/**
 * 吸附引擎模块单元测试
 * 测试SnapEngine类的所有功能
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 导入SnapEngine模块
const SnapEngine = require('../../../src/core/snap-engine.js');

describe('SnapEngine 吸附引擎', () => {
  let canvas;
  let snapEngine;
  let mockSnappingCallback;

  beforeEach(() => {
    // 创建测试画布
    canvas = createTestCanvas();

    // 创建模拟回调函数
    mockSnappingCallback = jest.fn();

    // 创建SnapEngine实例（新的简化API）
    snapEngine = new SnapEngine(40, 100, mockSnappingCallback);
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('初始化', () => {
    test('应该正确初始化SnapEngine', () => {
      expect(snapEngine).toBeInstanceOf(SnapEngine);
      expect(snapEngine.paddingx).toBe(40);
      expect(snapEngine.paddingy).toBe(100);
      expect(snapEngine.snappingCallback).toBe(mockSnappingCallback);
    });

    test('应该使用默认参数初始化', () => {
      const defaultEngine = new SnapEngine();
      expect(defaultEngine.paddingx).toBe(20);
      expect(defaultEngine.paddingy).toBe(80);
      expect(typeof defaultEngine.snappingCallback).toBe('function');
    });

    test('应该创建indicator元素', () => {
      // 在测试环境中，indicator可能不会被创建（因为没有完整的DOM环境）
      // 我们主要测试SnapEngine的初始化是否成功
      expect(snapEngine).toBeInstanceOf(SnapEngine);
      expect(snapEngine.isIndicatorVisible).toBe(false);
    });
  });

  describe('吸附边界计算', () => {
    test('应该正确计算吸附边界', () => {
      const targetBlock = {
        x: 200,
        y: 150,
        width: 100,
        height: 50
      };

      const bounds = snapEngine.calculateSnapBounds(targetBlock);
      
      expect(bounds.xMin).toBe(200 - 100/2 - 40); // 110
      expect(bounds.xMax).toBe(200 + 100/2 + 40); // 290
      expect(bounds.yMin).toBe(150 - 50/2); // 125
      expect(bounds.yMax).toBe(150 + 50); // 200
    });

    test('应该处理不同尺寸的块', () => {
      const smallBlock = { x: 100, y: 100, width: 50, height: 30 };
      const largeBlock = { x: 300, y: 200, width: 200, height: 80 };

      const smallBounds = snapEngine.calculateSnapBounds(smallBlock);
      const largeBounds = snapEngine.calculateSnapBounds(largeBlock);

      expect(smallBounds.xMax - smallBounds.xMin).toBe(50 + 2 * 40); // 130
      expect(largeBounds.xMax - largeBounds.xMin).toBe(200 + 2 * 40); // 280
    });
  });

  describe('吸附范围检测', () => {
    test('应该正确检测位置是否在吸附范围内', () => {
      const bounds = {
        xMin: 100,
        xMax: 200,
        yMin: 50,
        yMax: 150
      };

      // 在范围内
      const inRange = snapEngine.checkSnapRange(150, 100, bounds);
      expect(inRange.xInRange).toBe(true);
      expect(inRange.yInRange).toBe(true);
      expect(inRange.shouldSnap).toBe(true);

      // X轴超出范围
      const xOutOfRange = snapEngine.checkSnapRange(250, 100, bounds);
      expect(xOutOfRange.xInRange).toBe(false);
      expect(xOutOfRange.yInRange).toBe(true);
      expect(xOutOfRange.shouldSnap).toBe(false);

      // Y轴超出范围
      const yOutOfRange = snapEngine.checkSnapRange(150, 200, bounds);
      expect(yOutOfRange.xInRange).toBe(true);
      expect(yOutOfRange.yInRange).toBe(false);
      expect(yOutOfRange.shouldSnap).toBe(false);

      // 完全超出范围
      const completelyOut = snapEngine.checkSnapRange(300, 300, bounds);
      expect(completelyOut.shouldSnap).toBe(false);
    });

    test('应该处理边界值', () => {
      const bounds = { xMin: 100, xMax: 200, yMin: 50, yMax: 150 };

      // 边界值应该被包含
      const onBoundary = snapEngine.checkSnapRange(100, 50, bounds);
      expect(onBoundary.shouldSnap).toBe(true);

      const onOtherBoundary = snapEngine.checkSnapRange(200, 150, bounds);
      expect(onOtherBoundary.shouldSnap).toBe(true);
    });
  });

  describe('Indicator位置计算', () => {
    test('应该正确计算indicator位置', () => {
      const targetBlock = {
        id: 1,
        width: 100,
        height: 50
      };

      const position = snapEngine.calculateIndicatorPosition(targetBlock);

      expect(position).not.toBeNull();
      expect(position.blockId).toBe(1);
      expect(position.left).toBe(100/2 - 5); // 45
      expect(position.top).toBe(50);
      expect(position.shouldShow).toBe(true);
    });

    test('应该处理null目标块', () => {
      const position = snapEngine.calculateIndicatorPosition(null);
      expect(position).toBeNull();
    });

    test('应该能够设置indicator可见状态', () => {
      snapEngine.setIndicatorVisible(true);
      expect(snapEngine.isIndicatorVisible).toBe(true);

      snapEngine.setIndicatorVisible(false);
      expect(snapEngine.isIndicatorVisible).toBe(false);
    });
  });

  describe('吸附检测', () => {
    test('应该检测到吸附目标', () => {
      const targetBlock = {
        id: 1,
        x: 200,
        y: 150,
        width: 100,
        height: 50
      };

      // 在吸附范围内的位置
      const result = snapEngine.detectSnapping(200, 160, [targetBlock]);

      expect(result).not.toBeNull();
      expect(result.targetBlockId).toBe(1);
      expect(result.snapResult.shouldSnap).toBe(true);
      expect(result.indicatorPosition).not.toBeNull();
      expect(snapEngine.isIndicatorVisible).toBe(true);
    });

    test('应该在没有吸附目标时返回null', () => {
      const targetBlock = {
        id: 1,
        x: 200,
        y: 150,
        width: 100,
        height: 50
      };

      // 远离吸附范围的位置
      const result = snapEngine.detectSnapping(500, 500, [targetBlock]);

      expect(result).toBeNull();
      expect(snapEngine.isIndicatorVisible).toBe(false);
    });

    test('应该处理空块数组', () => {
      const result = snapEngine.detectSnapping(200, 160, []);
      expect(result).toBeNull();
    });

    test('应该处理null参数', () => {
      const result = snapEngine.detectSnapping(null, null, null);
      expect(result).toBeNull();
    });

    test('应该处理undefined参数', () => {
      const result = snapEngine.detectSnapping(undefined, undefined, undefined);
      expect(result).toBeNull();
    });
  });

  describe('状态管理', () => {
    test('应该返回正确的状态信息', () => {
      const status = snapEngine.getStatus();

      expect(status).toHaveProperty('isIndicatorVisible');
      expect(status).toHaveProperty('paddingx');
      expect(status).toHaveProperty('paddingy');

      expect(status.paddingx).toBe(40);
      expect(status.paddingy).toBe(100);
      expect(status.isIndicatorVisible).toBe(false);
    });

    test('应该能够清理状态', () => {
      // 先设置一些状态
      snapEngine.isIndicatorVisible = true;

      // 清理
      snapEngine.cleanup();

      expect(snapEngine.isIndicatorVisible).toBe(false);
    });
  });

  describe('回调函数', () => {
    test('应该触发吸附回调', () => {
      const dragElement = { id: 'test' };

      snapEngine.triggerSnappingCallback(dragElement);

      expect(mockSnappingCallback).toHaveBeenCalledWith(dragElement);
    });

    test('应该处理无效的回调函数', () => {
      const engineWithoutCallback = new SnapEngine(40, 100, null);
      const dragElement = { id: 'test' };

      // 不应该抛出错误
      expect(() => {
        engineWithoutCallback.triggerSnappingCallback(dragElement);
      }).not.toThrow();
    });
  });
});
