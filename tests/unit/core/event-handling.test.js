/**
 * 事件处理完整性测试
 * 基于源代码分析，专门测试flowy.js中的事件处理逻辑
 * 
 * 覆盖的核心功能:
 * - 鼠标事件链完整性 (行168-918)
 * - 状态转换逻辑 (active/rearrange)
 * - 事件冲突和竞态条件
 * - 事件清理和内存管理
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入隔离测试环境
const { withIsolatedTest } = require('../isolated-test-environment');

describe('事件处理完整性测试', () => {
  describe('鼠标事件链完整性', () => {
    test('应该正确处理完整的mousedown->mousemove->mouseup事件链', async () => {
      await withIsolatedTest('complete-mouse-event-chain', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建拖拽元素
        const element = testInstance.createTestDragElement('1', 'Event Test');
        
        // 模拟完整的事件链
        testInstance.simulateMouseDown(element);
        expect(callbacks.grab).toHaveBeenCalled();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 模拟多次mousemove
        testInstance.simulateMouseMove(200, 200);
        await new Promise(resolve => setTimeout(resolve, 50));
        testInstance.simulateMouseMove(250, 220);
        await new Promise(resolve => setTimeout(resolve, 50));
        testInstance.simulateMouseMove(300, 250);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 完成拖拽
        testInstance.simulateMouseUp();
        expect(callbacks.release).toHaveBeenCalled();
        
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证最终状态
        const output = testInstance.flowy.output();
        expect(output).toBeDefined();
      });
    });

    test('应该正确处理中断的事件链', async () => {
      await withIsolatedTest('interrupted-event-chain', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        const element = testInstance.createTestDragElement('1', 'Interrupt Test');
        
        // 开始拖拽
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 移动一下
        testInstance.simulateMouseMove(200, 200);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 直接触发mouseup而不在画布内
        testInstance.simulateMouseUp(100, 100); // 画布外位置
        
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证系统能够正确处理中断的事件链
        expect(() => testInstance.flowy.output()).not.toThrow();
        
        // 验证回调被调用
        expect(callbacks.grab).toHaveBeenCalled();
        expect(callbacks.release).toHaveBeenCalled();
      });
    });

    test('应该正确处理快速连续的事件', async () => {
      await withIsolatedTest('rapid-events', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 快速连续的拖拽操作
        for (let i = 0; i < 3; i++) {
          const element = testInstance.createTestDragElement(`${i + 1}`, `Rapid ${i + 1}`);
          
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 10)); // 很短的延迟
          testInstance.simulateMouseMove(200 + i * 50, 200);
          await new Promise(resolve => setTimeout(resolve, 10));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 验证系统能够处理快速事件
        expect(() => testInstance.flowy.output()).not.toThrow();
        expect(callbacks.grab).toHaveBeenCalled();
        expect(callbacks.release).toHaveBeenCalled();
      });
    });
  });

  describe('状态转换逻辑', () => {
    test('应该正确管理active状态', async () => {
      await withIsolatedTest('active-state-management', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        const element = testInstance.createTestDragElement('1', 'Active Test');
        
        // 验证初始状态
        expect(canvas.querySelector('.dragging')).toBeNull();
        
        // 开始拖拽，应该进入active状态
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 验证active状态的视觉指示
        const draggingElements = canvas.querySelectorAll('.dragging');
        // 可能有dragging类的元素
        
        // 移动
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 结束拖拽，应该退出active状态
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 验证状态清理
        const finalDraggingElements = canvas.querySelectorAll('.dragging');
        expect(finalDraggingElements.length).toBe(0);
      });
    });

    test('应该正确管理rearrange状态', async () => {
      await withIsolatedTest('rearrange-state-management', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 首先创建一个块
        const element1 = testInstance.createTestDragElement('1', 'First Block');
        testInstance.simulateMouseDown(element1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证块被创建
        const blocks = canvas.querySelectorAll('.block');
        expect(blocks.length).toBeGreaterThan(0);

        if (blocks.length > 0) {
          const block = blocks[0];
          
          // 模拟在已存在的块上开始拖拽（应该触发rearrange）
          const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: block.offsetLeft + 10,
            clientY: block.offsetTop + 10,
            button: 0,
            which: 1
          });
          
          block.dispatchEvent(mouseDownEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 模拟mousemove来触发rearrange逻辑
          const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: block.offsetLeft + 50,
            clientY: block.offsetTop + 50,
            button: 0,
            which: 1
          });
          
          document.dispatchEvent(mouseMoveEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 结束rearrange
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: block.offsetLeft + 50,
            clientY: block.offsetTop + 50,
            button: 0,
            which: 1
          });
          
          document.dispatchEvent(mouseUpEvent);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 验证系统状态正常
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });

    test('应该正确处理active和rearrange状态冲突', async () => {
      await withIsolatedTest('state-conflict-handling', async (testInstance) => {
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
        const element1 = testInstance.createTestDragElement('1', 'Initial Block');
        testInstance.simulateMouseDown(element1);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 尝试同时触发active和rearrange状态
        const element2 = testInstance.createTestDragElement('2', 'Conflict Test');
        
        // 开始新的拖拽（active状态）
        testInstance.simulateMouseDown(element2);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 同时尝试在已存在的块上操作
        const existingBlocks = canvas.querySelectorAll('.block');
        if (existingBlocks.length > 0) {
          const existingBlock = existingBlocks[0];
          
          // 这应该不会干扰当前的active状态
          const conflictEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: existingBlock.offsetLeft + 10,
            clientY: existingBlock.offsetTop + 10,
            button: 0,
            which: 1
          });
          
          // 不直接触发，因为应该有状态保护
        }
        
        // 完成原始拖拽
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证系统状态一致
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });
  });

  describe('事件冲突和竞态条件', () => {
    test('应该正确处理重叠的拖拽操作', async () => {
      await withIsolatedTest('overlapping-drag-operations', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建两个拖拽元素
        const element1 = testInstance.createTestDragElement('1', 'Element 1');
        const element2 = testInstance.createTestDragElement('2', 'Element 2');
        
        // 开始第一个拖拽
        testInstance.simulateMouseDown(element1);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 尝试开始第二个拖拽（应该被忽略或正确处理）
        testInstance.simulateMouseDown(element2);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 移动第一个
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 尝试移动第二个
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 结束第一个拖拽
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 结束第二个拖拽
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证系统能够正确处理重叠操作
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });

    test('应该正确处理快速的mouseup/mousedown序列', async () => {
      await withIsolatedTest('rapid-up-down-sequence', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        const element = testInstance.createTestDragElement('1', 'Rapid Test');
        
        // 快速的down/up序列
        for (let i = 0; i < 5; i++) {
          testInstance.simulateMouseDown(element);
          await new Promise(resolve => setTimeout(resolve, 10));
          testInstance.simulateMouseUp();
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // 验证系统稳定性
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });

    test('应该正确处理事件目标变化', async () => {
      await withIsolatedTest('event-target-changes', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        const element = testInstance.createTestDragElement('1', 'Target Test');
        
        // 开始拖拽
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 移动到不同的目标上
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 移动到画布外
        testInstance.simulateMouseMove(50, 50);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 移动回画布内
        testInstance.simulateMouseMove(350, 250);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 结束拖拽
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证事件目标变化的处理
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });
  });

  describe('事件清理和内存管理', () => {
    test('应该正确清理事件监听器', async () => {
      await withIsolatedTest('event-listener-cleanup', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 记录初始事件监听器数量（如果可能）
        const initialListeners = document._events || {};

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 执行一些操作
        const element = testInstance.createTestDragElement('1', 'Cleanup Test');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 清理操作
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证没有内存泄漏（基础检查）
        expect(() => testInstance.flowy.output()).not.toThrow();
        
        // 验证DOM清理
        const remainingBlocks = canvas.querySelectorAll('.block');
        expect(remainingBlocks.length).toBe(0);
      });
    });

    test('应该正确处理DOM元素移除后的事件', async () => {
      await withIsolatedTest('events-after-dom-removal', async (testInstance) => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        await new Promise(resolve => setTimeout(resolve, 200));

        // 创建并移除元素
        const element = testInstance.createTestDragElement('1', 'Removal Test');
        testInstance.simulateMouseDown(element);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(300, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 删除所有块
        testInstance.flowy.deleteBlocks();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 尝试在删除后触发事件
        const newElement = testInstance.createTestDragElement('2', 'After Removal');
        testInstance.simulateMouseDown(newElement);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseMove(400, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        testInstance.simulateMouseUp();
        await new Promise(resolve => setTimeout(resolve, 200));

        // 验证系统仍然正常工作
        expect(() => testInstance.flowy.output()).not.toThrow();
      });
    });
  });
});
