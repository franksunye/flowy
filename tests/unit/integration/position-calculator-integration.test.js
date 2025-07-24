/**
 * 位置计算服务集成测试
 * 
 * 验证位置计算服务与主文件的集成情况
 * 
 * @author Flowy Team
 * @version 1.0.0
 */

const PositionCalculator = require('../../../src/services/position-calculator.js');

describe('位置计算服务集成测试', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PositionCalculator();
  });

  describe('模块加载和初始化', () => {
    test('应该能够成功加载PositionCalculator模块', () => {
      expect(PositionCalculator).toBeDefined();
      expect(typeof PositionCalculator).toBe('function');
    });

    test('应该能够创建PositionCalculator实例', () => {
      expect(calculator).toBeInstanceOf(PositionCalculator);
      expect(calculator.calculateDragPosition).toBeDefined();
      expect(calculator.calculateSnapPosition).toBeDefined();
      expect(calculator.calculateChildrenLayout).toBeDefined();
    });

    test.skip('应该能够在浏览器环境中使用', () => {
      // 模拟浏览器环境
      const originalWindow = global.window;
      global.window = {};
      
      // 重新加载模块以测试浏览器导出
      const modulePath = require.resolve('../../../src/services/position-calculator.js');
      delete require.cache[modulePath];
      require('../../../src/services/position-calculator.js');
      
      expect(global.window.PositionCalculator).toBeDefined();
      expect(typeof global.window.PositionCalculator).toBe('function');
      
      // 清理
      global.window = originalWindow;
      delete require.cache[modulePath];
    });
  });

  describe('与现有拖拽逻辑的兼容性', () => {
    test('应该能够处理现有的拖拽位置计算场景', () => {
      // 模拟现有代码中的拖拽位置计算
      const mouseEvent = { clientX: 200, clientY: 150 };
      const dragOffset = { x: 20, y: 30 };

      const result = calculator.calculateDragPosition(mouseEvent, dragOffset);

      expect(result).toEqual({
        left: 180, // event.clientX - dragx
        top: 120   // event.clientY - dragy
      });
    });

    test('应该能够处理现有的重排拖拽位置计算场景', () => {
      // 模拟现有代码中的重排拖拽位置计算
      const mouseEvent = { clientX: 300, clientY: 250 };
      const dragOffset = { x: 15, y: 25 };
      const canvasInfo = {
        offsetLeft: 50,
        offsetTop: 60,
        scrollLeft: 10,
        scrollTop: 20
      };

      const result = calculator.calculateRearrangeDragPosition(mouseEvent, dragOffset, canvasInfo);

      // 对应原代码: event.clientX - dragx - canvas_div.offset().left + canvas_div.scrollLeft()
      expect(result).toEqual({
        left: 245, // 300 - 15 - 50 + 10
        top: 185   // 250 - 25 - 60 + 20
      });
    });

    test('应该能够处理现有的画布坐标转换场景', () => {
      // 模拟现有代码中的画布坐标转换
      const elementPosition = { left: 150, top: 200 };
      const canvasInfo = {
        offsetLeft: 30,
        offsetTop: 40,
        scrollLeft: 5,
        scrollTop: 15
      };

      const result = calculator.calculateCanvasPosition(elementPosition, canvasInfo);

      // 对应原代码: drag.offset().left - canvas_div.offset().left + canvas_div.scrollLeft()
      expect(result).toEqual({
        left: 125, // 150 - 30 + 5
        top: 175   // 200 - 40 + 15
      });
    });

    test('应该能够处理现有的块中心点计算场景', () => {
      // 模拟现有代码中的块中心点计算
      const blockPosition = { left: 100, top: 150 };
      const blockSize = { width: 80, height: 60 };
      const canvasInfo = { scrollLeft: 10, scrollTop: 20 };

      const result = calculator.calculateBlockCenter(blockPosition, blockSize, canvasInfo);

      // 对应原代码: drag.offset().left + drag.innerWidth() / 2 + canvas_div.scrollLeft()
      expect(result).toEqual({
        x: 150, // 100 + 80/2 + 10
        y: 200  // 150 + 60/2 + 20
      });
    });
  });

  describe('吸附算法集成', () => {
    test('应该能够计算正确的吸附位置', () => {
      // 模拟现有代码中的吸附位置计算
      const targetBlock = { x: 200, y: 100, width: 100, height: 50 };
      const dragBlock = { width: 80, height: 40 };
      const childBlocks = [
        { width: 60, height: 30 }
      ];
      const spacing = { x: 20, y: 80 };

      const result = calculator.calculateSnapPosition(targetBlock, dragBlock, childBlocks, spacing);

      expect(result).toHaveProperty('left');
      expect(result).toHaveProperty('top');
      expect(result).toHaveProperty('snapX');
      expect(result).toHaveProperty('snapY');
      expect(result.totalWidth).toBe(160); // 60 + 20 + 80
      expect(result.childIndex).toBe(1);
    });

    test('应该能够计算子块的布局位置', () => {
      // 模拟现有代码中的子块布局计算
      const parentBlock = { x: 150, y: 80, width: 90, height: 45 };
      const childBlocks = [
        { id: 1, width: 50, height: 25 },
        { id: 2, width: 70, height: 35 }
      ];
      const spacing = { x: 20, y: 80 };

      const result = calculator.calculateChildrenLayout(parentBlock, childBlocks, spacing);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[0].y).toBe(182.5); // 80 + 45/2 + 80
      expect(result[1].y).toBe(182.5);
    });
  });

  describe('边界和偏移计算集成', () => {
    test('应该能够计算块的边界信息', () => {
      // 模拟现有代码中的边界计算
      const blocks = [
        { x: 100, y: 50, width: 80, height: 40 },
        { x: 200, y: 100, width: 60, height: 30 }
      ];

      const result = calculator.calculateBlocksBounds(blocks);

      expect(result.minX).toBe(60);  // 100 - 80/2
      expect(result.maxX).toBe(230); // 200 + 60/2
      expect(result.minY).toBe(30);  // 50 - 40/2
      expect(result.maxY).toBe(115); // 100 + 30/2
      expect(result.width).toBe(170);
      expect(result.height).toBe(85);
    });

    test('应该能够计算偏移修正', () => {
      // 模拟现有代码中的偏移修正计算
      const blocks = [
        { x: 40, y: 50, width: 80, height: 40 } // minX = 0
      ];
      const canvasInfo = { offsetLeft: 50 };
      const minOffset = 20;

      const result = calculator.calculateOffsetCorrection(blocks, canvasInfo, minOffset);

      expect(result.needsCorrection).toBe(true);
      expect(result.offsetX).toBe(70); // 50 + 20 - 0
      expect(result.correctedBlocks[0].x).toBe(110); // 40 + 70
    });
  });

  describe('性能和缓存集成', () => {
    test('应该提供高性能的位置计算', () => {
      const startTime = Date.now();

      // 执行大量位置计算
      for (let i = 0; i < 1000; i++) {
        calculator.calculateDragPosition(
          { clientX: 100 + i, clientY: 200 + i },
          { x: 10, y: 20 }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 1000次计算应该在合理时间内完成
      expect(duration).toBeLessThan(100); // 100ms
    });

    test('缓存机制应该正常工作', () => {
      // 测试缓存功能
      calculator._setCache('test-key', { x: 100, y: 200 });
      const cached = calculator._getCache('test-key');

      expect(cached).toEqual({ x: 100, y: 200 });

      // 测试缓存清理
      calculator.clearCache();
      const afterClear = calculator._getCache('test-key');
      expect(afterClear).toBeUndefined();
    });

    test('应该处理大量的子块布局计算', () => {
      // 创建大量子块
      const parentBlock = { x: 500, y: 300, width: 100, height: 50 };
      const childBlocks = [];
      for (let i = 0; i < 50; i++) {
        childBlocks.push({
          id: i,
          width: 60 + (i % 20),
          height: 30 + (i % 15)
        });
      }

      const startTime = Date.now();
      const result = calculator.calculateChildrenLayout(parentBlock, childBlocks);
      const endTime = Date.now();

      expect(result).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(50); // 50ms
    });
  });

  describe('错误处理和边界条件', () => {
    test('应该优雅处理无效输入', () => {
      expect(() => {
        calculator.calculateDragPosition(null, { x: 10, y: 10 });
      }).toThrow();

      expect(() => {
        calculator.calculateSnapPosition(null, { width: 100, height: 100 });
      }).toThrow();
    });

    test('应该处理极端数值', () => {
      // 测试极大数值
      const result1 = calculator.calculateDragPosition(
        { clientX: 999999, clientY: 999999 },
        { x: 500000, y: 500000 }
      );
      expect(result1.left).toBe(499999);
      expect(result1.top).toBe(499999);

      // 测试负数值
      const result2 = calculator.calculateDragPosition(
        { clientX: -100, clientY: -200 },
        { x: -50, y: -75 }
      );
      expect(result2.left).toBe(-50);
      expect(result2.top).toBe(-125);
    });

    test('应该处理零尺寸块', () => {
      const result = calculator.calculateBlockCenter(
        { left: 100, top: 100 },
        { width: 0, height: 0 }
      );
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });
  });

  describe('实际使用场景模拟', () => {
    test('应该能够模拟完整的拖拽流程', () => {
      // 1. 开始拖拽
      const mouseDown = { clientX: 150, clientY: 200 };
      const initialOffset = { x: 10, y: 15 };
      
      const dragStart = calculator.calculateDragPosition(mouseDown, initialOffset);
      expect(dragStart).toEqual({ left: 140, top: 185 });

      // 2. 拖拽移动
      const mouseMove = { clientX: 250, clientY: 300 };
      const dragMove = calculator.calculateDragPosition(mouseMove, initialOffset);
      expect(dragMove).toEqual({ left: 240, top: 285 });

      // 3. 吸附检测
      const targetBlock = { x: 300, y: 350, width: 100, height: 50 };
      const dragBlock = { width: 80, height: 40 };
      
      const snapResult = calculator.calculateSnapPosition(targetBlock, dragBlock);
      expect(snapResult).toHaveProperty('snapX');
      expect(snapResult).toHaveProperty('snapY');
    });

    test('应该能够模拟重排流程', () => {
      // 1. 开始重排
      const mouseEvent = { clientX: 200, clientY: 250 };
      const dragOffset = { x: 20, y: 30 };
      const canvasInfo = { offsetLeft: 50, offsetTop: 60, scrollLeft: 5, scrollTop: 10 };
      
      const rearrangePos = calculator.calculateRearrangeDragPosition(mouseEvent, dragOffset, canvasInfo);
      expect(rearrangePos).toEqual({ left: 135, top: 170 });

      // 2. 计算新的子块布局
      const parentBlock = { x: 200, y: 100, width: 100, height: 50 };
      const existingChildren = [
        { id: 1, width: 60, height: 30 },
        { id: 2, width: 70, height: 35 }
      ];
      
      const newLayout = calculator.calculateChildrenLayout(parentBlock, existingChildren);
      expect(newLayout).toHaveLength(2);
    });
  });
});
