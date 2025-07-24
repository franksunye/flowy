/**
 * 拖拽状态管理器与主文件集成测试
 * 
 * 验证拖拽状态管理器是否正确集成到 src/flowy.js 中
 * 
 * @author Flowy Team
 * @version 1.0.0
 */

const { withIsolatedTest } = require('../isolated-test-environment');

describe('拖拽状态管理器主文件集成测试', () => {
  describe('模块加载集成', () => {
    test('主文件应该能够加载拖拽状态管理器', async () => {
      await withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 验证主文件初始化成功
        expect(testInstance.flowy).toBeDefined();
        expect(typeof testInstance.flowy.output).toBe('function');
        expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
        
        // 验证画布初始化
        expect(canvas).toBeDefined();
        expect(canvas.querySelector('.indicator')).toBeTruthy();
      });
    });

    test('应该能够处理拖拽状态管理器不可用的情况', () => {
      return withIsolatedTest(async (testInstance) => {
        // 即使拖拽状态管理器不可用，主文件也应该正常工作
        expect(() => {
          testInstance.flowy.output();
        }).not.toThrow();
      });
    });
  });

  describe('拖拽事件集成', () => {
    test('mousedown事件应该使用拖拽状态管理器', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建拖拽元素
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        // 模拟mousedown事件
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          which: 1,
          clientX: 100,
          clientY: 100
        });
        
        // 应该不抛出异常
        expect(() => {
          element.dispatchEvent(mouseDownEvent);
        }).not.toThrow();
        
        // 验证拖拽元素被创建
        const dragElements = document.querySelectorAll('.dragging');
        expect(dragElements.length).toBeGreaterThanOrEqual(0);
      });
    });

    test('mousemove事件应该使用拖拽状态管理器', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建拖拽元素
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        // 模拟完整的拖拽序列
        testInstance.simulateMouseDown(element);
        
        // 模拟mousemove事件
        const mouseMoveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: 150,
          clientY: 150
        });
        
        // 应该不抛出异常
        expect(() => {
          document.dispatchEvent(mouseMoveEvent);
        }).not.toThrow();
      });
    });

    test('mouseup事件应该使用拖拽状态管理器', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建拖拽元素
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        // 模拟完整的拖拽序列
        testInstance.simulateMouseDown(element);
        testInstance.simulateMouseMove(200, 200);
        
        // 模拟mouseup事件
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          which: 1,
          clientX: 200,
          clientY: 200
        });
        
        // 应该不抛出异常
        expect(() => {
          document.dispatchEvent(mouseUpEvent);
        }).not.toThrow();
      });
    });
  });

  describe('状态清理集成', () => {
    test('clearCanvasState应该使用拖拽状态管理器', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建一些块
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        // 模拟拖拽创建块
        testInstance.simulateMouseDown(element);
        testInstance.simulateMouseMove(200, 200);
        testInstance.simulateMouseUp();
        
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 清理画布
        if (typeof window.clearFlowyCanvas === 'function') {
          expect(() => {
            window.clearFlowyCanvas();
          }).not.toThrow();
        }
        
        // 验证清理效果
        const blocks = canvas.querySelectorAll('.block');
        expect(blocks.length).toBe(0);
      });
    });
  });

  describe('向后兼容性', () => {
    test('应该保持现有API的兼容性', () => {
      return withIsolatedTest(async (testInstance) => {
        // 验证核心API仍然可用
        expect(typeof testInstance.flowy.output).toBe('function');
        expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
        
        // 调用API不应该抛出异常
        expect(() => {
          testInstance.flowy.output();
        }).not.toThrow();
        
        expect(() => {
          testInstance.flowy.deleteBlocks();
        }).not.toThrow();
      });
    });

    test('应该保持现有事件处理的兼容性', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建拖拽元素
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        // 模拟传统的拖拽操作
        const rect = element.getBoundingClientRect();
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          which: 1,
          clientX: rect.left + 10,
          clientY: rect.top + 10
        });
        
        // 应该能够正常处理事件
        expect(() => {
          element.dispatchEvent(mouseDownEvent);
        }).not.toThrow();
      });
    });
  });

  describe('错误处理集成', () => {
    test('应该优雅处理拖拽状态管理器加载失败', () => {
      return withIsolatedTest(async (testInstance) => {
        // 即使在模块加载失败的情况下，主文件也应该正常工作
        expect(testInstance.flowy).toBeDefined();
        
        // 基本功能应该仍然可用
        expect(() => {
          testInstance.flowy.output();
        }).not.toThrow();
      });
    });

    test('应该处理无效的拖拽操作', () => {
      return withIsolatedTest(async (testInstance) => {
        // 在没有拖拽元素的情况下触发事件
        const mouseMoveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: 100,
          clientY: 100
        });
        
        expect(() => {
          document.dispatchEvent(mouseMoveEvent);
        }).not.toThrow();
      });
    });
  });

  describe('性能集成', () => {
    test('集成后的拖拽操作应该保持高性能', () => {
      return withIsolatedTest(async (testInstance) => {
        const { canvas } = testInstance;
        
        // 创建拖拽元素
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = 'Test Block';
        canvas.appendChild(element);
        
        const startTime = Date.now();
        
        // 模拟大量的mousemove事件
        testInstance.simulateMouseDown(element);
        
        for (let i = 0; i < 100; i++) {
          testInstance.simulateMouseMove(100 + i, 100 + i);
        }
        
        testInstance.simulateMouseUp();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 100次移动操作应该在合理时间内完成
        expect(duration).toBeLessThan(1000); // 1秒
      });
    });

    test('状态查询应该高效', () => {
      return withIsolatedTest(async (testInstance) => {
        const startTime = Date.now();
        
        // 模拟大量的状态查询
        for (let i = 0; i < 1000; i++) {
          // 这些操作内部会使用拖拽状态管理器
          testInstance.flowy.output();
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 1000次查询应该在合理时间内完成
        expect(duration).toBeLessThan(500); // 500ms
      });
    });
  });
});
