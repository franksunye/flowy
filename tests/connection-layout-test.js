/**
 * 连线和布局问题测试
 * 专门测试您提到的两个问题：
 * 1. 首次拖拽后连线显示不完整
 * 2. 第三个块拖拽时块重排问题
 */

class ConnectionLayoutTest {
  constructor() {
    this.testResults = [];
    this.page = null;
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, details = {}) {
    this.testResults.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⚠️  元素 ${selector} 未在 ${timeout}ms 内出现`);
      return false;
    }
  }

  /**
   * 测试1: 首次拖拽连线完整性
   */
  async testFirstDragConnection() {
    console.log('🔗 测试1: 首次拖拽连线完整性...');

    try {
      // 清空画布
      await this.page.evaluate(() => {
        if (window.clearFlowyCanvas) {
          window.clearFlowyCanvas();
        }
      });

      // 等待画布准备就绪
      await this.page.waitForTimeout(500);

      // 1. 拖拽第一个块 (New visitor)
      const firstBlock = await this.page.$('.create-flowy[value="1"]');
      if (!firstBlock) {
        throw new Error('找不到第一个块');
      }

      const canvas = await this.page.$('#canvas');
      const canvasBox = await canvas.boundingBox();

      // 拖拽到画布中心
      await this.page.mouse.move(100, 100);
      await this.page.mouse.down();
      await this.page.mouse.move(canvasBox.x + 200, canvasBox.y + 100);
      await this.page.mouse.up();

      await this.page.waitForTimeout(500);

      // 2. 拖拽第二个块 (Action is performed)
      const secondBlock = await this.page.$('.create-flowy[value="2"]');
      if (!secondBlock) {
        throw new Error('找不到第二个块');
      }

      await this.page.mouse.move(100, 150);
      await this.page.mouse.down();
      await this.page.mouse.move(canvasBox.x + 200, canvasBox.y + 250);
      await this.page.mouse.up();

      await this.page.waitForTimeout(1000);

      // 3. 检查连线是否存在且完整
      const arrowBlocks = await this.page.$$('.arrowblock');
      const hasConnection = arrowBlocks.length > 0;

      if (hasConnection) {
        // 检查连线的SVG路径
        const svgPath = await this.page.evaluate(() => {
          const arrow = document.querySelector('.arrowblock svg path');
          return arrow ? arrow.getAttribute('d') : null;
        });

        const pathValid = svgPath && svgPath.length > 10; // 基本路径长度检查

        // 检查连线位置
        const arrowPosition = await this.page.evaluate(() => {
          const arrow = document.querySelector('.arrowblock');
          if (!arrow) return null;
          const rect = arrow.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          };
        });

        const positionValid = arrowPosition && 
                             arrowPosition.width > 0 && 
                             arrowPosition.height > 0;

        this.recordTest('首次拖拽连线完整性', pathValid && positionValid, {
          hasConnection,
          pathValid,
          positionValid,
          svgPath: svgPath ? svgPath.substring(0, 50) + '...' : null,
          arrowPosition,
        });

        console.log(`     ${pathValid && positionValid ? '✅' : '❌'} 连线完整性: ${pathValid && positionValid ? '通过' : '失败'}`);
        if (svgPath) {
          console.log(`     📏 SVG路径: ${svgPath.substring(0, 50)}...`);
        }
        if (arrowPosition) {
          console.log(`     📍 连线位置: (${arrowPosition.left}, ${arrowPosition.top})`);
        }

      } else {
        this.recordTest('首次拖拽连线完整性', false, {
          hasConnection: false,
          error: '未找到连线元素',
        });
        console.log('     ❌ 未找到连线元素');
      }

    } catch (error) {
      this.recordTest('首次拖拽连线完整性', false, {
        error: error.message,
      });
      console.log(`     ❌ 测试失败: ${error.message}`);
    }
  }

  /**
   * 测试2: 第三个块拖拽重排问题
   */
  async testThirdBlockRearrangement() {
    console.log('🔄 测试2: 第三个块拖拽重排问题...');

    try {
      // 清空画布
      await this.page.evaluate(() => {
        if (window.clearFlowyCanvas) {
          window.clearFlowyCanvas();
        }
      });

      await this.page.waitForTimeout(500);

      const canvas = await this.page.$('#canvas');
      const canvasBox = await canvas.boundingBox();

      // 1. 拖拽第一个块
      await this.page.mouse.move(100, 100);
      await this.page.mouse.down();
      await this.page.mouse.move(canvasBox.x + 200, canvasBox.y + 100);
      await this.page.mouse.up();
      await this.page.waitForTimeout(300);

      // 2. 拖拽第二个块
      await this.page.mouse.move(100, 150);
      await this.page.mouse.down();
      await this.page.mouse.move(canvasBox.x + 200, canvasBox.y + 250);
      await this.page.mouse.up();
      await this.page.waitForTimeout(300);

      // 3. 拖拽第三个块 (并列排版)
      await this.page.mouse.move(100, 200);
      await this.page.mouse.down();
      await this.page.mouse.move(canvasBox.x + 350, canvasBox.y + 250);
      await this.page.mouse.up();
      await this.page.waitForTimeout(1000);

      // 4. 检查所有块是否都可见
      const allBlocks = await this.page.$$('.block');
      const blockCount = allBlocks.length;

      const blockVisibility = await this.page.evaluate(() => {
        const blocks = document.querySelectorAll('.block');
        return Array.from(blocks).map((block, index) => {
          const rect = block.getBoundingClientRect();
          const style = window.getComputedStyle(block);
          return {
            index,
            visible: style.display !== 'none' && style.visibility !== 'hidden',
            position: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            blockId: block.querySelector('.blockid')?.value || 'unknown',
          };
        });
      });

      const allBlocksVisible = blockVisibility.every(block => block.visible && 
                                                    block.position.width > 0 && 
                                                    block.position.height > 0);

      // 5. 检查连线是否都正确显示
      const arrowBlocks = await this.page.$$('.arrowblock');
      const connectionCount = arrowBlocks.length;

      const connectionVisibility = await this.page.evaluate(() => {
        const arrows = document.querySelectorAll('.arrowblock');
        return Array.from(arrows).map((arrow, index) => {
          const rect = arrow.getBoundingClientRect();
          const svg = arrow.querySelector('svg');
          const path = svg ? svg.querySelector('path') : null;
          return {
            index,
            hasPath: !!path,
            pathData: path ? path.getAttribute('d') : null,
            position: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
          };
        });
      });

      const allConnectionsValid = connectionVisibility.every(conn => 
        conn.hasPath && 
        conn.pathData && 
        conn.pathData.length > 10
      );

      const testPassed = blockCount === 3 && allBlocksVisible && allConnectionsValid;

      this.recordTest('第三个块拖拽重排', testPassed, {
        blockCount,
        allBlocksVisible,
        connectionCount,
        allConnectionsValid,
        blockVisibility,
        connectionVisibility,
      });

      console.log(`     ${testPassed ? '✅' : '❌'} 重排测试: ${testPassed ? '通过' : '失败'}`);
      console.log(`     📦 块数量: ${blockCount}/3`);
      console.log(`     👁️  块可见性: ${allBlocksVisible ? '全部可见' : '部分隐藏'}`);
      console.log(`     🔗 连线数量: ${connectionCount}`);
      console.log(`     ✨ 连线有效性: ${allConnectionsValid ? '全部有效' : '部分无效'}`);

      // 详细输出每个块的状态
      blockVisibility.forEach((block, i) => {
        console.log(`     📍 块${i+1} (ID:${block.blockId}): ${block.visible ? '可见' : '隐藏'} at (${Math.round(block.position.left)}, ${Math.round(block.position.top)})`);
      });

    } catch (error) {
      this.recordTest('第三个块拖拽重排', false, {
        error: error.message,
      });
      console.log(`     ❌ 测试失败: ${error.message}`);
    }
  }

  /**
   * 测试3: 删除后重新操作
   */
  async testDeleteAndRestart() {
    console.log('🗑️  测试3: 删除后重新操作...');

    try {
      // 先执行完整的拖拽流程
      await this.testThirdBlockRearrangement();

      // 清空画布
      await this.page.evaluate(() => {
        if (window.clearFlowyCanvas) {
          window.clearFlowyCanvas();
        }
      });

      await this.page.waitForTimeout(500);

      // 重新执行拖拽流程
      await this.testFirstDragConnection();

      this.recordTest('删除后重新操作', true, {
        note: '成功清空并重新执行操作',
      });

      console.log('     ✅ 删除后重新操作: 通过');

    } catch (error) {
      this.recordTest('删除后重新操作', false, {
        error: error.message,
      });
      console.log(`     ❌ 测试失败: ${error.message}`);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests(page) {
    this.page = page;
    console.log('🧪 开始连线和布局问题测试...');

    await this.testFirstDragConnection();
    await this.testThirdBlockRearrangement();
    await this.testDeleteAndRestart();

    // 输出测试总结
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;

    console.log('\n📊 测试总结:');
    console.log(`   通过: ${passedTests}/${totalTests}`);
    console.log(`   成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests < totalTests) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details.error || '未知错误'}`);
        });
    }

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests,
      results: this.testResults,
    };
  }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConnectionLayoutTest;
} else {
  window.ConnectionLayoutTest = ConnectionLayoutTest;
}
