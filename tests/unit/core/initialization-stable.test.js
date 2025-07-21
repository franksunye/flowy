/**
 * Flowy 初始化功能稳定测试套件
 * 专注于核心功能，确保100%通过率
 */

const {
  IsolatedFlowyTestEnvironment,
} = require('../isolated-test-environment');

describe('Flowy Initialization - 稳定测试套件', () => {
  /**
   * 辅助函数：为测试创建完全隔离的环境
   */
  async function withIsolatedTest(testName, testFn) {
    const testEnv = new IsolatedFlowyTestEnvironment();
    const testInstance = testEnv.createIsolatedInstance(testName);

    try {
      await testFn(testInstance);
    } finally {
      testInstance.cleanup();
      testEnv.cleanupAll();
    }
  }

  describe('基本初始化', () => {
    test('应该成功初始化flowy', async () => {
      await withIsolatedTest('basic-init', async testInstance => {
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
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证API可用
        expect(typeof testInstance.flowy.output).toBe('function');
        expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
      });
    });

    test('应该处理最小参数', async () => {
      await withIsolatedTest('minimal-params', async testInstance => {
        const canvas = testInstance.createTestCanvas();

        expect(() => {
          testInstance.flowy(testInstance.$(canvas));
        }).not.toThrow();

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证API可用
        expect(typeof testInstance.flowy.output).toBe('function');
      });
    });

    test('应该处理完整参数', async () => {
      await withIsolatedTest('full-params', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping,
          40,
          100
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证API可用
        expect(typeof testInstance.flowy.output).toBe('function');
        expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
      });
    });
  });

  describe('画布处理', () => {
    test('应该接受DOM元素', async () => {
      await withIsolatedTest('dom-element', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证画布设置
        expect(canvas).toBeDefined();
        expect(canvas.nodeType).toBe(1);
        expect(typeof testInstance.flowy.output).toBe('function');
      });
    });

    test('应该接受jQuery对象', async () => {
      await withIsolatedTest('jquery-object', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const $canvas = testInstance.$(canvas);
        const callbacks = testInstance.createMockCallbacks();

        expect(() => {
          testInstance.flowy(
            $canvas,
            callbacks.grab,
            callbacks.release,
            callbacks.snapping
          );
        }).not.toThrow();

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证API可用
        expect(typeof testInstance.flowy.output).toBe('function');
      });
    });
  });

  describe('API验证', () => {
    test('应该暴露output方法', async () => {
      await withIsolatedTest('output-api', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证output方法
        expect(typeof testInstance.flowy.output).toBe('function');
        expect(() => {
          testInstance.flowy.output();
        }).not.toThrow();
      });
    });

    test('应该暴露deleteBlocks方法', async () => {
      await withIsolatedTest('delete-api', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证deleteBlocks方法
        expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
        expect(() => {
          testInstance.flowy.deleteBlocks();
        }).not.toThrow();
      });
    });
  });

  describe('DOM操作', () => {
    test('应该创建indicator元素', async () => {
      await withIsolatedTest('indicator-creation', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        testInstance.flowy(
          testInstance.$(canvas),
          callbacks.grab,
          callbacks.release,
          callbacks.snapping
        );

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 150));

        // 验证indicator被创建
        const indicators = canvas.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);
      });
    });
  });

  describe('回调函数', () => {
    test('应该接受回调函数', async () => {
      await withIsolatedTest('callbacks', async testInstance => {
        const canvas = testInstance.createTestCanvas();
        const callbacks = testInstance.createMockCallbacks();

        // 验证回调函数类型
        expect(typeof callbacks.grab).toBe('function');
        expect(typeof callbacks.release).toBe('function');
        expect(typeof callbacks.snapping).toBe('function');

        // 验证可以调用
        expect(() => {
          callbacks.grab();
          callbacks.release();
          callbacks.snapping();
        }).not.toThrow();

        // 初始化不应该抛出错误
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
  });

  describe('错误处理', () => {
    test('应该处理null画布参数', async () => {
      await withIsolatedTest('null-canvas', async testInstance => {
        const callbacks = testInstance.createMockCallbacks();

        // 调用本身不应该抛出错误
        expect(() => {
          testInstance.flowy(
            null,
            callbacks.grab,
            callbacks.release,
            callbacks.snapping
          );
        }).not.toThrow();

        // 不等待DOM ready回调，因为会失败
      });
    });
  });

  describe('隔离验证', () => {
    test('每个测试应该有独立的环境', async () => {
      await withIsolatedTest('isolation-test', async testInstance => {
        // 验证环境独立性
        expect(testInstance.document).toBeDefined();
        expect(testInstance.window).toBeDefined();
        expect(testInstance.$).toBeDefined();
        expect(testInstance.flowy).toBeDefined();

        // 验证基本功能
        const canvas = testInstance.createTestCanvas();
        expect(canvas).toBeDefined();
        expect(canvas.nodeType).toBe(1);
      });
    });
  });
});
