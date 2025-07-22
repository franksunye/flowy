/**
 * 状态一致性测试
 * 验证内部状态与UI状态的一致性
 * 确保块管理、DOM状态、内部变量之间的同步
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('状态一致性测试', () => {
  describe('块数据与DOM一致性', () => {
    test('blocks数组应该与DOM中的块元素保持一致', async () => {
      await withIsolatedTest('blocks-dom-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建多个块
        const blockCount = 3;
        for (let i = 0; i < blockCount; i++) {
          const element = testInstance.createTestDragElement(`${i + 1}`, `Block ${i + 1}`);
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(300 + i * 100, 300);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证数据一致性
        const output = testInstance.flowy.output();
        const domBlocks = canvas.querySelectorAll('.block');

        expect(output).toBeDefined();
        expect(output.length).toBe(blockCount);
        expect(domBlocks.length).toBe(blockCount);

        // 验证每个块的ID一致性
        output.forEach(blockData => {
          const domBlock = canvas.querySelector(`.blockid[value="${blockData.id}"]`);
          expect(domBlock).toBeDefined();
        });
      });
    });

    test('删除块后数据与DOM应该保持一致', async () => {
      await withIsolatedTest('delete-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建块
        const element = testInstance.createTestDragElement('1', 'Test Block');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证创建后的一致性
        let output = testInstance.flowy.output();
        let domBlocks = canvas.querySelectorAll('.block');
        expect(output.length).toBe(1);
        expect(domBlocks.length).toBe(1);

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证删除后的一致性
        output = testInstance.flowy.output();
        domBlocks = canvas.querySelectorAll('.block');
        
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }
        expect(domBlocks.length).toBe(0);
      });
    });
  });

  describe('indicator状态一致性', () => {
    test('indicator的DOM状态应该与内部逻辑一致', async () => {
      await withIsolatedTest('indicator-state-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证初始indicator状态
        let indicators = canvas.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);
        
        // 初始状态应该是不可见的
        let visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);

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
        
        // 拖拽到吸附区域
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // indicator应该变为可见
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        // 释放鼠标
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // indicator应该重新隐藏
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);
      });
    });

    test('清理后indicator状态应该正确重置', async () => {
      await withIsolatedTest('indicator-reset-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建块并触发indicator显示
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
        
        // 验证indicator显示
        let visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证indicator仍然存在但处于正确状态
        const indicators = canvas.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);
        
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);

        // 重新创建块，indicator功能应该正常
        const newElement1 = testInstance.createTestDragElement('1', 'New Block 1');
        testInstance.simulateMouseDown(newElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        const newElement2 = testInstance.createTestDragElement('2', 'New Block 2');
        testInstance.simulateMouseDown(newElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(420, 380);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // indicator应该能够正常显示
        visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));
      });
    });
  });

  describe('ID管理一致性', () => {
    test('块ID应该在清理后正确重置', async () => {
      await withIsolatedTest('id-reset-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建几个块
        for (let i = 0; i < 3; i++) {
          const element = testInstance.createTestDragElement(`${i + 1}`, `Block ${i + 1}`);
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(300 + i * 100, 300);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 验证ID递增
        let output = testInstance.flowy.output();
        expect(output.length).toBe(3);
        expect(output[0].id).toBe(0);
        expect(output[1].id).toBe(1);
        expect(output[2].id).toBe(2);

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建块，ID应该从0开始
        const newElement = testInstance.createTestDragElement('1', 'New Block');
        testInstance.simulateMouseDown(newElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        output = testInstance.flowy.output();
        expect(output.length).toBe(1);
        expect(output[0].id).toBe(0); // ID应该重置为0
      });
    });
  });

  describe('事件处理一致性', () => {
    test('清理后事件监听器应该正确工作', async () => {
      await withIsolatedTest('event-handler-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建块
        const element = testInstance.createTestDragElement('1', 'Test Block');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证回调被调用
        expect(callbacks.grab).toHaveBeenCalled();
        expect(callbacks.release).toHaveBeenCalled();

        // 重置mock
        callbacks.grab.mockClear();
        callbacks.release.mockClear();

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 重新创建块，事件处理应该仍然正常
        const newElement = testInstance.createTestDragElement('1', 'New Test Block');
        testInstance.simulateMouseDown(newElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证回调仍然被正确调用
        expect(callbacks.grab).toHaveBeenCalled();
        expect(callbacks.release).toHaveBeenCalled();
      });
    });
  });

  describe('内存管理一致性', () => {
    test('清理操作应该正确释放资源', async () => {
      await withIsolatedTest('memory-management-consistency', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建多个块
        for (let i = 0; i < 5; i++) {
          const element = testInstance.createTestDragElement(`${i + 1}`, `Block ${i + 1}`);
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseMove(300 + i * 50, 300);
          await new Promise(resolve => setTimeout(resolve, 50));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 验证创建成功
        let output = testInstance.flowy.output();
        expect(output.length).toBe(5);

        // 记录清理前的DOM元素数量
        const beforeCleanupBlocks = canvas.querySelectorAll('.block').length;
        const beforeCleanupArrows = canvas.querySelectorAll('.arrowblock').length;

        // 清理所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证DOM元素被正确清理
        const afterCleanupBlocks = canvas.querySelectorAll('.block').length;
        const afterCleanupArrows = canvas.querySelectorAll('.arrowblock').length;

        expect(afterCleanupBlocks).toBe(0);
        expect(afterCleanupArrows).toBe(0);

        // 验证数据被正确清理
        output = testInstance.flowy.output();
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }
      });
    });
  });
});
