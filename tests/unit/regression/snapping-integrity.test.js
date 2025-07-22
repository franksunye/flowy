/**
 * 吸附功能完整性测试
 * 专门测试吸附功能在各种状态下的正确性和一致性
 * 确保吸附功能在任何情况下都能正常工作
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('吸附功能完整性测试', () => {
  describe('基础吸附功能', () => {
    test('第一个块拖拽后第二个块应该能够正确吸附', async () => {
      await withIsolatedTest('basic-snapping', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建第一个块
        const dragElement1 = testInstance.createTestDragElement('1', 'First Block');
        testInstance.simulateMouseDown(dragElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证第一个块被创建
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);

        // 创建第二个块并测试吸附
        const dragElement2 = testInstance.createTestDragElement('2', 'Second Block');
        testInstance.simulateMouseDown(dragElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到第一个块的吸附区域
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 检查indicator是否显示（吸附激活的标志）
        const visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证吸附成功
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(2);
        
        // 验证父子关系
        const childBlock = output.find(block => block.parent !== -1);
        expect(childBlock).toBeDefined();
      });
    });

    test('吸附功能应该在不同位置都能正常工作', async () => {
      await withIsolatedTest('snapping-different-positions', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 测试不同位置的吸附
        const positions = [
          { x: 200, y: 200 },
          { x: 500, y: 300 },
          { x: 300, y: 450 }
        ];

        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          
          // 创建父块
          const parentElement = testInstance.createTestDragElement('1', `Parent ${i}`);
          testInstance.simulateMouseDown(parentElement);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(pos.x, pos.y);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));

          // 创建子块并测试吸附
          const childElement = testInstance.createTestDragElement('2', `Child ${i}`);
          testInstance.simulateMouseDown(childElement);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(pos.x + 20, pos.y + 80);
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // 验证indicator显示
          const visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
          expect(visibleIndicators.length).toBeGreaterThan(0);
          
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证所有块都被正确创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(positions.length * 2);
      });
    });
  });

  describe('清理后吸附功能恢复', () => {
    test('清理后第一次拖拽应该正常工作', async () => {
      await withIsolatedTest('snapping-after-cleanup-first-drag', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建初始块
        const initialElement = testInstance.createTestDragElement('1', 'Initial Block');
        testInstance.simulateMouseDown(initialElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建第一个块
        const newElement = testInstance.createTestDragElement('1', 'New Block');
        testInstance.simulateMouseDown(newElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块被正确创建
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);
        expect(output[0].id).toBe(0); // 第一个块的ID应该重置为0
      });
    });

    test('清理后第二次拖拽的吸附功能应该正常工作', async () => {
      await withIsolatedTest('snapping-after-cleanup-second-drag', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建初始的两个块
        const element1 = testInstance.createTestDragElement('1', 'Block 1');
        testInstance.simulateMouseDown(element1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        const element2 = testInstance.createTestDragElement('2', 'Block 2');
        testInstance.simulateMouseDown(element2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证初始状态
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(2);

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建第一个块
        const newElement1 = testInstance.createTestDragElement('1', 'New Block 1');
        testInstance.simulateMouseDown(newElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建第二个块，测试吸附功能
        const newElement2 = testInstance.createTestDragElement('2', 'New Block 2');
        testInstance.simulateMouseDown(newElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到吸附区域
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 关键测试：验证indicator是否正确显示
        const visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证吸附成功
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(2);
        
        // 验证父子关系正确建立
        const parentBlock = output.find(block => block.parent === -1);
        const childBlock = output.find(block => block.parent !== -1);
        expect(parentBlock).toBeDefined();
        expect(childBlock).toBeDefined();
        expect(childBlock.parent).toBe(parentBlock.id);
      });
    });
  });

  describe('indicator状态一致性', () => {
    test('indicator应该在正确的时机显示和隐藏', async () => {
      await withIsolatedTest('indicator-visibility-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建第一个块
        const element1 = testInstance.createTestDragElement('1', 'Block 1');
        testInstance.simulateMouseDown(element1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 开始拖拽第二个块
        const element2 = testInstance.createTestDragElement('2', 'Block 2');
        testInstance.simulateMouseDown(element2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到非吸附区域，indicator应该隐藏
        testInstance.simulateMouseMove(200, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);
        
        // 拖拽到吸附区域，indicator应该显示
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        // 拖拽离开吸附区域，indicator应该隐藏
        testInstance.simulateMouseMove(600, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));
      });
    });
  });

  describe('复杂场景吸附测试', () => {
    test('多次清理和重建后吸附功能应该保持一致', async () => {
      await withIsolatedTest('multiple-cleanup-snapping-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 进行多轮创建-清理-重建循环
        for (let round = 0; round < 3; round++) {
          // 创建两个块
          const element1 = testInstance.createTestDragElement('1', `Round ${round} Block 1`);
          testInstance.simulateMouseDown(element1);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(400, 300);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));

          const element2 = testInstance.createTestDragElement('2', `Round ${round} Block 2`);
          testInstance.simulateMouseDown(element2);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(420, 380);
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // 验证每轮的吸附功能都正常
          const visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
          expect(visibleIndicators.length).toBeGreaterThan(0);
          
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));

          // 验证块被正确创建
          let output = testInstance.flowy.output();
          expect(output).toBeDefined();
          expect(output.length).toBe(2);

          // 清理准备下一轮
          if (round < 2) {
            testInstance.flowy.deleteBlocks();
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      });
    });
  });
});
