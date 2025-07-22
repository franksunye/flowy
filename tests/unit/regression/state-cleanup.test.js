/**
 * 状态清理回归测试
 * 专门测试删除所有块后重新拖拽时吸附功能的正确性
 * 这个测试套件专门针对用户报告的问题：
 * "删除所有块后，重新拖拽第二个块时吸附功能不工作"
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('状态清理回归测试', () => {
  describe('删除所有块后重新拖拽', () => {
    test('应该能够在删除所有块后正确重新拖拽第一个块', async () => {
      await withIsolatedTest('first-block-after-clear', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 初始化 flowy
        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证初始状态
        expect(testInstance.flowy.output()).toBeUndefined();

        // 创建第一个拖拽元素
        const dragElement1 = testInstance.createTestDragElement('1', 'First Block');
        
        // 模拟拖拽第一个块到画布
        testInstance.simulateMouseDown(dragElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 模拟拖拽到画布位置
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 释放鼠标
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证第一个块被创建
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBe(1);

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证删除后状态
        output = testInstance.flowy.output();
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }

        // 重新拖拽第一个块
        const dragElement2 = testInstance.createTestDragElement('1', 'First Block Again');
        
        testInstance.simulateMouseDown(dragElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证第一个块能够正确创建
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBe(1);
      });
    });

    test('应该能够在删除所有块后正确拖拽第二个块并启用吸附功能', async () => {
      await withIsolatedTest('second-block-snapping-after-clear', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 初始化 flowy
        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 第一轮：创建两个块
        const dragElement1 = testInstance.createTestDragElement('1', 'First Block');
        testInstance.simulateMouseDown(dragElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        const dragElement2 = testInstance.createTestDragElement('2', 'Second Block');
        testInstance.simulateMouseDown(dragElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 400);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证两个块都被创建
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(2);

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证删除后状态
        output = testInstance.flowy.output();
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }

        // 第二轮：重新创建两个块，测试吸附功能
        const newDragElement1 = testInstance.createTestDragElement('1', 'New First Block');
        testInstance.simulateMouseDown(newDragElement1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证第一个块被创建
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);

        // 创建第二个块，测试吸附功能
        const newDragElement2 = testInstance.createTestDragElement('2', 'New Second Block');
        testInstance.simulateMouseDown(newDragElement2);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 拖拽到第一个块附近，应该触发吸附
        testInstance.simulateMouseMove(420, 380); // 接近第一个块的吸附区域
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 检查indicator是否被正确显示（吸附功能工作的标志）
        const indicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(indicators.length).toBeGreaterThan(0);
        
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证第二个块被正确创建并吸附
        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(2);
        
        // 验证第二个块有正确的父子关系（吸附成功的标志）
        const secondBlock = output.find(block => block.parent !== -1);
        expect(secondBlock).toBeDefined();
      });
    });
  });

  describe('indicator状态管理', () => {
    test('删除所有块后indicator应该正确重置', async () => {
      await withIsolatedTest('indicator-reset', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证indicator被创建
        let indicators = canvas.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证indicator仍然存在但处于正确状态
        indicators = canvas.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);
        
        // indicator应该是不可见的
        const visibleIndicators = canvas.querySelectorAll('.indicator:not(.invisible)');
        expect(visibleIndicators.length).toBe(0);
      });
    });
  });

  describe('状态变量重置', () => {
    test('删除所有块后内部状态变量应该正确重置', async () => {
      await withIsolatedTest('state-variables-reset', async (testInstance) => {
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
        const dragElement = testInstance.createTestDragElement('1', 'Test Block');
        testInstance.simulateMouseDown(dragElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块被创建
        let output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证状态被正确重置
        output = testInstance.flowy.output();
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }

        // 验证可以正常创建新块（说明状态重置正确）
        const newDragElement = testInstance.createTestDragElement('1', 'New Test Block');
        testInstance.simulateMouseDown(newDragElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        output = testInstance.flowy.output();
        expect(output).toBeDefined();
        expect(output.length).toBe(1);
      });
    });
  });

  describe('多次清理操作', () => {
    test('应该能够处理多次连续的清理操作', async () => {
      await withIsolatedTest('multiple-cleanup', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 多次调用deleteBlocks不应该出错
        expect(() => {
          testInstance.flowy.deleteBlocks();
          testInstance.flowy.deleteBlocks();
          testInstance.flowy.deleteBlocks();
        }).not.toThrow();

        // 验证状态仍然正确
        const output = testInstance.flowy.output();
        if (output) {
          expect(output.length).toBe(0);
        } else {
          expect(output).toBeUndefined();
        }
      });
    });
  });
});
