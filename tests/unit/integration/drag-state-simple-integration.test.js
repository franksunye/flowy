/**
 * 拖拽状态管理器简单集成测试
 * 
 * 验证拖拽状态管理器是否正确集成到主文件中
 * 
 * @author Flowy Team
 * @version 1.0.0
 */

const { withIsolatedTest } = require('../isolated-test-environment');

describe('拖拽状态管理器简单集成测试', () => {
  test('主文件应该能够正常初始化', async () => {
    await withIsolatedTest(async (testInstance) => {
      // 验证主文件初始化成功
      expect(testInstance.flowy).toBeDefined();
      expect(typeof testInstance.flowy.output).toBe('function');
      expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
    });
  });

  test('应该能够处理基本的拖拽操作', async () => {
    await withIsolatedTest(async (testInstance) => {
      const { canvas } = testInstance;
      
      // 创建拖拽元素
      const element = document.createElement('div');
      element.className = 'create-flowy';
      element.textContent = 'Test Block';
      canvas.appendChild(element);
      
      // 模拟拖拽操作不应该抛出异常
      expect(() => {
        testInstance.simulateMouseDown(element);
        testInstance.simulateMouseMove(200, 200);
        testInstance.simulateMouseUp();
      }).not.toThrow();
    });
  });

  test('状态清理应该正常工作', async () => {
    await withIsolatedTest(async (testInstance) => {
      // 清理操作不应该抛出异常
      expect(() => {
        testInstance.flowy.deleteBlocks();
      }).not.toThrow();
      
      // 如果全局清理函数存在，也应该正常工作
      if (typeof window.clearFlowyCanvas === 'function') {
        expect(() => {
          window.clearFlowyCanvas();
        }).not.toThrow();
      }
    });
  });

  test('API调用应该保持兼容性', async () => {
    await withIsolatedTest(async (testInstance) => {
      // 核心API调用不应该抛出异常
      expect(() => {
        const output = testInstance.flowy.output();
        // output可能是undefined（空画布）或数组
        expect(output === undefined || Array.isArray(output)).toBe(true);
      }).not.toThrow();
    });
  });

  test('事件处理应该保持稳定', async () => {
    await withIsolatedTest(async (testInstance) => {
      const { canvas } = testInstance;
      
      // 创建多个拖拽元素
      for (let i = 0; i < 3; i++) {
        const element = document.createElement('div');
        element.className = 'create-flowy';
        element.textContent = `Test Block ${i}`;
        canvas.appendChild(element);
      }
      
      // 模拟多个拖拽操作
      const elements = canvas.querySelectorAll('.create-flowy');
      elements.forEach((element, index) => {
        expect(() => {
          testInstance.simulateMouseDown(element);
          testInstance.simulateMouseMove(100 + index * 50, 100 + index * 50);
          testInstance.simulateMouseUp();
        }).not.toThrow();
      });
    });
  });
});
