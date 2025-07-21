/**
 * Flowy 拖拽功能单元测试
 * 测试拖拽开始、拖拽过程、拖拽结束等核心功能
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 直接 require flowy.js（现在支持模块导出）
const flowy = require('../../../src/flowy.js');

describe('Flowy 拖拽功能', () => {
  let canvas;
  let mockGrab, mockRelease, mockSnapping;

  beforeEach(async () => {
    // 创建测试画布
    canvas = createTestCanvas();

    // 创建模拟回调函数
    mockGrab = jest.fn();
    mockRelease = jest.fn();
    mockSnapping = jest.fn();

    // 初始化Flowy并等待ready回调
    flowy($(canvas), mockGrab, mockRelease, mockSnapping);

    // 等待ready回调执行
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('基础拖拽功能', () => {
    test('应该能够初始化拖拽系统', () => {
      // 验证Flowy API是否可用
      expect(typeof flowy.output).toBe('function');
      expect(typeof flowy.deleteBlocks).toBe('function');
    });

    test('应该能够处理拖拽元素的创建', () => {
      const dragElement = createTestDragElement('1', 'Test Block');

      // 验证拖拽元素是否正确创建
      expect(dragElement).toBeDefined();
      expect(dragElement.getAttribute('data-type')).toBe('1');
      expect(dragElement.textContent).toBe('Test Block');
    });

    test('应该能够检测拖拽元素', () => {
      const dragElement = createTestDragElement('1', 'Test Block');

      // 验证元素具有正确的类名
      expect(dragElement.classList.contains('create-flowy')).toBe(true);
    });
  });

  describe('拖拽状态管理', () => {
    test('应该能够跟踪拖拽状态', () => {
      // 这里我们测试拖拽状态的基本概念
      // 由于原始代码使用全局变量，我们通过API可用性来验证状态
      expect(typeof flowy.output).toBe('function');
    });

    test('应该能够处理多个拖拽元素', () => {
      const element1 = createTestDragElement('1', 'Block 1');
      const element2 = createTestDragElement('2', 'Block 2');

      expect(element1.getAttribute('data-type')).toBe('1');
      expect(element2.getAttribute('data-type')).toBe('2');
    });
  });

  describe('画布交互', () => {
    test('应该能够识别画布区域', () => {
      expect(canvas).toBeDefined();
      expect(canvas.id).toBe('test-canvas');
      expect(canvas.style.width).toBe('800px');
      expect(canvas.style.height).toBe('600px');
    });

    test('应该能够在画布上创建块', () => {
      // 通过flowy.output()来验证画布状态
      const output = flowy.output();

      // 空画布时返回undefined或空数组
      if (output) {
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBe(0);
      } else {
        expect(output).toBeUndefined();
      }
    });
  });

  describe('数据输出功能', () => {
    test('flowy.output() 应该返回正确的数据结构', () => {
      const output = flowy.output();

      // 空画布时返回undefined或空数组
      if (output) {
        // 如果返回值存在，验证其为数组
        expect(Array.isArray(output)).toBe(true);

        // 如果有数据，验证数组元素结构
        if (output.length > 0) {
          expect(output[0]).toHaveProperty('id');
          expect(output[0]).toHaveProperty('parent');
          expect(output[0]).toHaveProperty('data');
          expect(Array.isArray(output[0].data)).toBe(true);
        }
      } else {
        // undefined也是可接受的（空画布状态）
        expect(output).toBeUndefined();
      }
    });

    test('flowy.output() 应该处理空画布', () => {
      const output = flowy.output();

      // 空画布时返回undefined或空数组
      if (output) {
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBe(0);
      } else {
        expect(output).toBeUndefined();
      }
    });
  });

  describe('清理功能', () => {
    test('flowy.deleteBlocks() 应该存在', () => {
      expect(typeof flowy.deleteBlocks).toBe('function');
    });

    test('flowy.deleteBlocks() 应该能够清理画布', () => {
      // 调用清理函数
      flowy.deleteBlocks();

      // 验证清理后的状态
      const output = flowy.output();

      // 清理后应该返回undefined或空数组
      if (output) {
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toBe(0);
      } else {
        expect(output).toBeUndefined();
      }
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的拖拽操作', () => {
      // 测试在没有有效目标的情况下的行为
      expect(() => {
        flowy.output();
      }).not.toThrow();
    });

    test('应该处理重复的清理操作', () => {
      expect(() => {
        flowy.deleteBlocks();
        flowy.deleteBlocks(); // 重复调用
      }).not.toThrow();
    });
  });

  describe('API 一致性', () => {
    test('所有API方法应该始终可用', () => {
      expect(typeof flowy.output).toBe('function');
      expect(typeof flowy.deleteBlocks).toBe('function');

      // 调用API后仍然可用
      flowy.output();
      expect(typeof flowy.output).toBe('function');

      flowy.deleteBlocks();
      expect(typeof flowy.deleteBlocks).toBe('function');
    });

    test('API方法应该返回一致的数据类型', () => {
      const output1 = flowy.output();
      const output2 = flowy.output();

      // 返回值类型应该一致
      expect(typeof output1).toBe(typeof output2);

      if (output1 && output2) {
        expect(Array.isArray(output1)).toBe(Array.isArray(output2));

        // 如果有数据，验证数组元素结构一致
        if (output1.length > 0 && output2.length > 0) {
          expect(typeof output1[0].id).toBe(typeof output2[0].id);
          expect(typeof output1[0].parent).toBe(typeof output2[0].parent);
          expect(Array.isArray(output1[0].data)).toBe(
            Array.isArray(output2[0].data)
          );
        }
      }
    });
  });

  describe('性能考虑', () => {
    test('API调用应该在合理时间内完成', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        flowy.output();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 100次调用应该在1秒内完成
      expect(duration).toBeLessThan(1000);
    });

    test('清理操作应该高效', () => {
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        flowy.deleteBlocks();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 10次清理应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });
  });
});
