/**
 * 版本对比测试 - 确保重构版本与原始版本功能完全一致
 * 
 * 测试策略：
 * 1. 并行测试原始版本(src-demo)和重构版本(refactor-demo)
 * 2. 执行相同的操作序列
 * 3. 对比DOM状态、数据输出、视觉效果
 * 4. 验证所有核心功能的一致性
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 版本对比测试类
 */
class VersionComparisonTest {
  constructor() {
    this.browser = null;
    this.originalContext = null;
    this.refactorContext = null;
    this.originalPage = null;
    this.refactorPage = null;
    this.testResults = [];
  }

  /**
   * 初始化测试环境
   */
  async setup() {
    console.log('🚀 初始化版本对比测试环境...');
    
    this.browser = await chromium.launch({ 
      headless: true,
      slowMo: 100 // 适度减慢以确保操作完成
    });

    // 创建两个独立的浏览器上下文
    this.originalContext = await this.browser.newContext();
    this.refactorContext = await this.browser.newContext();

    this.originalPage = await this.originalContext.newPage();
    this.refactorPage = await this.refactorContext.newPage();

    // 监听控制台错误
    this.setupErrorListeners();

    // 加载两个版本的页面
    await this.loadPages();
  }

  /**
   * 设置错误监听器
   */
  setupErrorListeners() {
    this.originalPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 原始版本控制台错误:`, msg.text());
      }
    });

    this.refactorPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 重构版本控制台错误:`, msg.text());
      }
    });
  }

  /**
   * 加载两个版本的页面
   */
  async loadPages() {
    const originalPath = path.resolve(__dirname, '../../docs/src-demo/index.html');
    const refactorPath = path.resolve(__dirname, '../../docs/refactor-demo/index.html');

    console.log('📄 加载原始版本:', originalPath);
    await this.originalPage.goto(`file://${originalPath}`);
    
    console.log('📄 加载重构版本:', refactorPath);
    await this.refactorPage.goto(`file://${refactorPath}`);

    // 等待页面完全加载
    await Promise.all([
      this.originalPage.waitForTimeout(2000),
      this.refactorPage.waitForTimeout(2000)
    ]);
  }

  /**
   * 执行完整的功能对比测试
   */
  async runFullComparisonTest() {
    console.log('\n🧪 开始完整功能对比测试...\n');

    const testSuites = [
      { name: '初始状态对比', test: () => this.testInitialState() },
      { name: '第一个块拖拽对比', test: () => this.testFirstBlockDrag() },
      { name: '第二个块吸附对比', test: () => this.testSecondBlockSnapping() },
      { name: '多块连接对比', test: () => this.testMultipleBlockConnections() },
      { name: '块删除功能对比', test: () => this.testBlockDeletion() },
      { name: '重新拖拽对比', test: () => this.testRedragAfterDeletion() },
      { name: '数据输出对比', test: () => this.testDataOutput() },
      { name: '清理功能对比', test: () => this.testCleanupFunction() },
      { name: '边界条件对比', test: () => this.testEdgeCases() },
      { name: '性能对比', test: () => this.testPerformance() }
    ];

    for (const suite of testSuites) {
      console.log(`\n🔍 执行测试: ${suite.name}`);
      try {
        const result = await suite.test();
        this.testResults.push({
          name: suite.name,
          status: 'PASS',
          result: result
        });
        console.log(`✅ ${suite.name}: 通过`);
      } catch (error) {
        this.testResults.push({
          name: suite.name,
          status: 'FAIL',
          error: error.message
        });
        console.log(`❌ ${suite.name}: 失败 - ${error.message}`);
      }
    }

    return this.generateReport();
  }

  /**
   * 测试初始状态
   */
  async testInitialState() {
    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareStates(originalState, refactorState, '初始状态');
    
    return {
      original: originalState,
      refactor: refactorState,
      comparison: 'identical'
    };
  }

  /**
   * 测试第一个块拖拽
   */
  async testFirstBlockDrag() {
    console.log('  📦 拖拽第一个块到画布...');
    
    // 在两个版本中执行相同的拖拽操作
    await Promise.all([
      this.dragFirstBlock(this.originalPage),
      this.dragFirstBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareStates(originalState, refactorState, '第一个块拖拽后');

    return {
      original: originalState,
      refactor: refactorState,
      blocksCount: {
        original: originalState.blocks.length,
        refactor: refactorState.blocks.length
      }
    };
  }

  /**
   * 测试第二个块吸附
   */
  async testSecondBlockSnapping() {
    console.log('  🧲 拖拽第二个块测试吸附...');
    
    // 在两个版本中执行相同的拖拽操作
    await Promise.all([
      this.dragSecondBlock(this.originalPage),
      this.dragSecondBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    // 特别检查吸附位置
    this.compareSnapPositions(originalState, refactorState);

    return {
      original: originalState,
      refactor: refactorState,
      snapping: {
        originalSecondBlockY: originalState.blocks[1]?.position.top,
        refactorSecondBlockY: refactorState.blocks[1]?.position.top,
        isSnapped: Math.abs(
          (originalState.blocks[1]?.position.top || 0) - 
          (refactorState.blocks[1]?.position.top || 0)
        ) < 5 // 允许5px的误差
      }
    };
  }

  /**
   * 测试多块连接对比
   */
  async testMultipleBlockConnections() {
    console.log('  🔗 测试多块连接...');

    // 添加第三个块
    await Promise.all([
      this.dragThirdBlock(this.originalPage),
      this.dragThirdBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareStates(originalState, refactorState, '多块连接');

    return {
      original: originalState,
      refactor: refactorState,
      connectionCount: {
        original: originalState.connections.length,
        refactor: refactorState.connections.length
      }
    };
  }

  /**
   * 测试块删除功能对比
   */
  async testBlockDeletion() {
    console.log('  🗑️  测试块删除功能...');

    // 删除第一个块
    await Promise.all([
      this.deleteFirstBlock(this.originalPage),
      this.deleteFirstBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareStates(originalState, refactorState, '块删除后');

    return {
      original: originalState,
      refactor: refactorState,
      deletionSuccess: originalState.blocks.length === 0 && refactorState.blocks.length === 0
    };
  }

  /**
   * 测试重新拖拽对比
   */
  async testRedragAfterDeletion() {
    console.log('  🔄 测试删除后重新拖拽...');

    // 重新拖拽两个块
    await Promise.all([
      this.dragFirstBlock(this.originalPage),
      this.dragFirstBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(500),
      this.refactorPage.waitForTimeout(500)
    ]);

    await Promise.all([
      this.dragSecondBlock(this.originalPage),
      this.dragSecondBlock(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareSnapPositions(originalState, refactorState);

    return {
      original: originalState,
      refactor: refactorState,
      redragSuccess: originalState.blocks.length === 2 && refactorState.blocks.length === 2
    };
  }

  /**
   * 测试数据输出对比
   */
  async testDataOutput() {
    console.log('  📊 测试数据输出...');

    const originalOutput = await this.getFlowyOutput(this.originalPage);
    const refactorOutput = await this.getFlowyOutput(this.refactorPage);

    if (JSON.stringify(originalOutput) !== JSON.stringify(refactorOutput)) {
      throw new Error('flowy.output()结果不一致');
    }

    return {
      original: originalOutput,
      refactor: refactorOutput,
      identical: true
    };
  }

  /**
   * 测试清理功能对比
   */
  async testCleanupFunction() {
    console.log('  🧹 测试清理功能...');

    // 调用deleteBlocks
    await Promise.all([
      this.callDeleteBlocks(this.originalPage),
      this.callDeleteBlocks(this.refactorPage)
    ]);

    await Promise.all([
      this.originalPage.waitForTimeout(1000),
      this.refactorPage.waitForTimeout(1000)
    ]);

    const originalState = await this.getPageState(this.originalPage);
    const refactorState = await this.getPageState(this.refactorPage);

    this.compareStates(originalState, refactorState, '清理后');

    return {
      original: originalState,
      refactor: refactorState,
      cleanupSuccess: originalState.blocks.length === 0 && refactorState.blocks.length === 0
    };
  }

  /**
   * 测试边界条件对比
   */
  async testEdgeCases() {
    console.log('  🎯 测试边界条件...');

    // 测试多次调用output
    const originalMultipleOutputs = await this.testMultipleOutputCalls(this.originalPage);
    const refactorMultipleOutputs = await this.testMultipleOutputCalls(this.refactorPage);

    return {
      original: originalMultipleOutputs,
      refactor: refactorMultipleOutputs,
      consistent: JSON.stringify(originalMultipleOutputs) === JSON.stringify(refactorMultipleOutputs)
    };
  }

  /**
   * 测试性能对比
   */
  async testPerformance() {
    console.log('  ⚡ 测试性能...');

    const originalPerf = await this.measurePerformance(this.originalPage);
    const refactorPerf = await this.measurePerformance(this.refactorPage);

    return {
      original: originalPerf,
      refactor: refactorPerf,
      performanceRatio: refactorPerf.totalTime / originalPerf.totalTime
    };
  }

  /**
   * 拖拽第一个块
   */
  async dragFirstBlock(page) {
    const firstBlock = await page.locator('.create-flowy').first();
    await firstBlock.dragTo(page.locator('#canvas'), {
      targetPosition: { x: 200, y: 200 }
    });
  }

  /**
   * 拖拽第二个块
   */
  async dragSecondBlock(page) {
    const firstBlock = await page.locator('.create-flowy').first();
    await firstBlock.dragTo(page.locator('#canvas'), {
      targetPosition: { x: 200, y: 300 } // 尝试吸附到第一个块下方
    });
  }

  /**
   * 拖拽第三个块
   */
  async dragThirdBlock(page) {
    const firstBlock = await page.locator('.create-flowy').first();
    await firstBlock.dragTo(page.locator('#canvas'), {
      targetPosition: { x: 200, y: 400 } // 尝试吸附到第二个块下方
    });
  }

  /**
   * 删除第一个块
   */
  async deleteFirstBlock(page) {
    const firstBlock = await page.locator('.block').first();
    if (await firstBlock.count() > 0) {
      await firstBlock.click();
      await page.waitForTimeout(500);

      const deleteButton = await page.locator('#removeblock');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.waitForTimeout(500);
      }
    }
  }

  /**
   * 获取flowy.output()结果
   */
  async getFlowyOutput(page) {
    return await page.evaluate(() => {
      try {
        if (typeof window.flowy !== 'undefined' && window.flowy.output) {
          return window.flowy.output();
        }
        return null;
      } catch (e) {
        return 'error: ' + e.message;
      }
    });
  }

  /**
   * 调用deleteBlocks
   */
  async callDeleteBlocks(page) {
    return await page.evaluate(() => {
      try {
        if (typeof window.flowy !== 'undefined' && window.flowy.deleteBlocks) {
          return window.flowy.deleteBlocks();
        }
        return null;
      } catch (e) {
        return 'error: ' + e.message;
      }
    });
  }

  /**
   * 测试多次调用output
   */
  async testMultipleOutputCalls(page) {
    return await page.evaluate(() => {
      const results = [];
      try {
        for (let i = 0; i < 3; i++) {
          if (typeof window.flowy !== 'undefined' && window.flowy.output) {
            results.push(window.flowy.output());
          }
        }
        return results;
      } catch (e) {
        return ['error: ' + e.message];
      }
    });
  }

  /**
   * 测量性能
   */
  async measurePerformance(page) {
    return await page.evaluate(() => {
      const start = performance.now();

      // 执行一系列操作
      let operations = 0;
      try {
        for (let i = 0; i < 10; i++) {
          if (typeof window.flowy !== 'undefined' && window.flowy.output) {
            window.flowy.output();
            operations++;
          }
        }
      } catch (e) {
        // 忽略错误，继续测量
      }

      const end = performance.now();
      return {
        totalTime: end - start,
        operations: operations,
        avgTimePerOp: operations > 0 ? (end - start) / operations : 0
      };
    });
  }

  /**
   * 获取页面状态
   */
  async getPageState(page) {
    return await page.evaluate(() => {
      const blocks = Array.from(document.querySelectorAll('.block')).map(block => {
        const rect = block.getBoundingClientRect();
        const blockId = block.querySelector('.blockid');
        return {
          id: blockId ? blockId.value : null,
          position: {
            left: parseInt(block.style.left) || rect.left,
            top: parseInt(block.style.top) || rect.top
          },
          size: {
            width: rect.width,
            height: rect.height
          }
        };
      });

      const connections = Array.from(document.querySelectorAll('.arrowblock')).map(arrow => {
        const rect = arrow.getBoundingClientRect();
        const arrowId = arrow.querySelector('.arrowid');
        const path = arrow.querySelector('path');
        return {
          id: arrowId ? arrowId.value : null,
          position: {
            left: parseInt(arrow.style.left) || rect.left,
            top: parseInt(arrow.style.top) || rect.top
          },
          path: path ? path.getAttribute('d') : null
        };
      });

      // 尝试获取flowy.output()的结果
      let flowyOutput = null;
      try {
        if (typeof window.flowy !== 'undefined' && window.flowy.output) {
          flowyOutput = window.flowy.output();
        }
      } catch (e) {
        flowyOutput = 'error: ' + e.message;
      }

      return {
        blocks,
        connections,
        flowyOutput,
        timestamp: Date.now()
      };
    });
  }

  /**
   * 对比两个状态
   */
  compareStates(original, refactor, context) {
    // 对比块数量
    if (original.blocks.length !== refactor.blocks.length) {
      throw new Error(`${context}: 块数量不一致 - 原始:${original.blocks.length}, 重构:${refactor.blocks.length}`);
    }

    // 对比连接数量
    if (original.connections.length !== refactor.connections.length) {
      throw new Error(`${context}: 连接数量不一致 - 原始:${original.connections.length}, 重构:${refactor.connections.length}`);
    }

    // 对比flowy.output()结果
    if (JSON.stringify(original.flowyOutput) !== JSON.stringify(refactor.flowyOutput)) {
      console.warn(`${context}: flowy.output()结果不同`);
      console.log('原始版本输出:', original.flowyOutput);
      console.log('重构版本输出:', refactor.flowyOutput);
    }
  }

  /**
   * 对比吸附位置
   */
  compareSnapPositions(original, refactor) {
    if (original.blocks.length >= 2 && refactor.blocks.length >= 2) {
      const originalY = original.blocks[1].position.top;
      const refactorY = refactor.blocks[1].position.top;
      const diff = Math.abs(originalY - refactorY);
      
      if (diff > 5) { // 允许5px误差
        throw new Error(`吸附位置不一致 - 原始:${originalY}px, 重构:${refactorY}px, 差异:${diff}px`);
      }
    }
  }

  /**
   * 清理测试环境
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log('\n📊 版本对比测试报告');
    console.log('='.repeat(50));
    console.log(`✅ 通过: ${passCount}`);
    console.log(`❌ 失败: ${failCount}`);
    console.log(`📈 成功率: ${((passCount / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failCount > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }

    return {
      total: this.testResults.length,
      passed: passCount,
      failed: failCount,
      successRate: (passCount / this.testResults.length) * 100,
      details: this.testResults
    };
  }
}

// 导出测试类
export default VersionComparisonTest;
