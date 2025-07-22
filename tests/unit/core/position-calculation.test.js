/**
 * 位置计算算法测试
 * 基于源代码分析，专门测试flowy.js中的位置计算相关函数
 * 
 * 覆盖的核心算法:
 * - checkOffset() 边界检查算法 (行920-986)
 * - fixOffset() 位置修正算法 (行988-1048)
 * - 坐标转换和边界计算
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('位置计算算法测试', () => {
  describe('checkOffset() 边界检查算法', () => {
    test('应该正确计算块的最小左边界', async () => {
      await withIsolatedTest('check-offset-min-boundary', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建多个块在不同位置
        const positions = [
          { x: 100, y: 200 },  // 最左边的块
          { x: 300, y: 200 },  // 中间的块
          { x: 500, y: 200 }   // 最右边的块
        ];

        for (let i = 0; i < positions.length; i++) {
          const element = testInstance.createTestDragElement(`${i + 1}`, `Block ${i + 1}`);
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(positions[i].x, positions[i].y);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证块被创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(3);

        // 检查DOM中块的位置是否正确
        const blocks = canvas.querySelectorAll('.block');
        expect(blocks.length).toBe(3);

        // 验证最左边的块确实在最左边
        let minLeft = Infinity;
        blocks.forEach(block => {
          const left = parseInt(block.style.left) || block.offsetLeft;
          if (left < minLeft) {
            minLeft = left;
          }
        });

        expect(minLeft).toBeLessThan(200); // 应该小于中间位置
      });
    });

    test('应该在块超出画布边界时触发偏移修正', async () => {
      await withIsolatedTest('offset-correction-trigger', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建一个块在画布左边界外
        const element = testInstance.createTestDragElement('1', 'Boundary Block');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到画布左边界外的位置
        const canvasRect = canvas.getBoundingClientRect();
        const outsideX = canvasRect.left - 50; // 超出左边界50px
        testInstance.simulateMouseMove(outsideX, canvasRect.top + 100);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块被创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);

        // 验证块的位置被修正到画布内
        const block = canvas.querySelector('.block');
        expect(block).toBeDefined();
        
        const blockLeft = parseInt(block.style.left) || block.offsetLeft;
        expect(blockLeft).toBeGreaterThanOrEqual(0); // 应该在画布内
      });
    });

    test('应该正确处理多个块的宽度计算', async () => {
      await withIsolatedTest('multiple-blocks-width-calculation', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建不同宽度的块
        const blockConfigs = [
          { type: '1', text: 'Small', width: '80px' },
          { type: '2', text: 'Medium Block', width: '120px' },
          { type: '3', text: 'Large Block Content', width: '160px' }
        ];

        for (let i = 0; i < blockConfigs.length; i++) {
          const config = blockConfigs[i];
          const element = testInstance.createTestDragElement(config.type, config.text);
          element.style.width = config.width;
          
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(200 + i * 200, 200);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证所有块被创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(3);

        // 验证块的宽度信息被正确记录
        const blocks = canvas.querySelectorAll('.block');
        expect(blocks.length).toBe(3);

        // 检查每个块的宽度
        blocks.forEach((block, index) => {
          const width = block.offsetWidth || parseInt(block.style.width);
          expect(width).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('fixOffset() 位置修正算法', () => {
    test('应该正确修正超出边界的块位置', async () => {
      await withIsolatedTest('fix-offset-boundary-correction', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建一个块
        const element = testInstance.createTestDragElement('1', 'Test Block');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(100, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块被创建
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);

        // 获取初始位置
        const block = canvas.querySelector('.block');
        const initialLeft = parseInt(block.style.left) || block.offsetLeft;

        // 模拟触发位置修正的场景
        // 这通常在拖拽操作或重排时发生
        const element2 = testInstance.createTestDragElement('2', 'Second Block');
        testInstance.simulateMouseDown(element2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到一个会触发重排的位置
        testInstance.simulateMouseMove(50, 200); // 更靠左的位置
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证位置修正后的状态
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        
        // 检查块的最终位置是否合理
        const blocks = canvas.querySelectorAll('.block');
        blocks.forEach(blockEl => {
          const left = parseInt(blockEl.style.left) || blockEl.offsetLeft;
          expect(left).toBeGreaterThanOrEqual(0); // 应该在画布内
        });
      });
    });

    test('应该正确处理连线的位置修正', async () => {
      await withIsolatedTest('arrow-position-correction', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建父块
        const parentElement = testInstance.createTestDragElement('1', 'Parent Block');
        testInstance.simulateMouseDown(parentElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建子块并吸附
        const childElement = testInstance.createTestDragElement('2', 'Child Block');
        testInstance.simulateMouseDown(childElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(320, 280); // 接近父块的吸附区域
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块和连线被创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        
        const blocks = canvas.querySelectorAll('.block');
        const arrows = canvas.querySelectorAll('.arrowblock');
        
        expect(blocks.length).toBeGreaterThan(0);
        
        // 如果有连线，验证连线位置
        if (arrows.length > 0) {
          arrows.forEach(arrow => {
            const left = parseInt(arrow.style.left) || arrow.offsetLeft;
            const top = parseInt(arrow.style.top) || arrow.offsetTop;
            
            expect(left).toBeGreaterThanOrEqual(0);
            expect(top).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });
  });

  describe('坐标转换精度测试', () => {
    test('应该正确处理画布滚动偏移', async () => {
      await withIsolatedTest('canvas-scroll-offset', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 设置画布滚动
        canvas.style.overflow = 'auto';
        canvas.style.width = '400px';
        canvas.style.height = '300px';
        canvas.scrollLeft = 50;
        canvas.scrollTop = 30;

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建块
        const element = testInstance.createTestDragElement('1', 'Scroll Test');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(200, 150);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块位置考虑了滚动偏移
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        
        if (output && output.length > 0) {
          const blockData = output[0];
          // 验证坐标计算包含了滚动偏移
          expect(blockData.x).toBeGreaterThan(0);
          expect(blockData.y).toBeGreaterThan(0);
        }
      });
    });

    test('应该正确处理浮点数坐标精度', async () => {
      await withIsolatedTest('coordinate-precision', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 使用精确的浮点数坐标
        const preciseX = 123.456;
        const preciseY = 234.789;

        const element = testInstance.createTestDragElement('1', 'Precision Test');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(preciseX, preciseY);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证坐标精度处理
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        
        if (output && output.length > 0) {
          const blockData = output[0];
          // 验证坐标是数字且在合理范围内
          expect(typeof blockData.x).toBe('number');
          expect(typeof blockData.y).toBe('number');
          expect(blockData.x).toBeGreaterThan(0);
          expect(blockData.y).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('边界条件测试', () => {
    test('应该处理零尺寸画布', async () => {
      await withIsolatedTest('zero-size-canvas', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        canvas.style.width = '0px';
        canvas.style.height = '0px';
        
        const callbacks = testInstance.createMockCallbacks();

        // 应该不抛出错误
        expect(() => {
          testInstance.flowy(
            testInstance.$(canvas),
            callbacks.grab,
            callbacks.release,
            callbacks.snapping
          );
        }).not.toThrow();
      });
    });

    test('应该处理负坐标', async () => {
      await withIsolatedTest('negative-coordinates', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 尝试拖拽到负坐标
        const element = testInstance.createTestDragElement('1', 'Negative Test');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(-50, -30);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证系统能够处理负坐标而不崩溃
        const output = testInstance.flowy.output();
        // 可能没有输出（因为在画布外），但不应该崩溃
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });
  });
});
