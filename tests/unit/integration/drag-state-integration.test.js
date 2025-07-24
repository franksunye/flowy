/**
 * 拖拽状态管理器集成测试
 * 
 * 验证拖拽状态管理器与主文件的集成情况
 * 
 * @author Flowy Team
 * @version 1.0.0
 */

const DragStateManager = require('../../../src/core/drag-state-manager.js');

describe('拖拽状态管理器集成测试', () => {
  let dragStateManager;

  beforeEach(() => {
    dragStateManager = new DragStateManager();
  });

  describe('模块加载和初始化', () => {
    test('应该能够成功加载DragStateManager模块', () => {
      expect(DragStateManager).toBeDefined();
      expect(typeof DragStateManager).toBe('function');
    });

    test('应该能够创建DragStateManager实例', () => {
      expect(dragStateManager).toBeInstanceOf(DragStateManager);
      expect(dragStateManager.getState).toBeDefined();
      expect(dragStateManager.setState).toBeDefined();
    });

    test.skip('应该能够在浏览器环境中使用', () => {
      // 模拟浏览器环境
      const originalWindow = global.window;
      global.window = {};

      // 重新加载模块以测试浏览器导出
      const modulePath = require.resolve('../../../src/core/drag-state-manager.js');
      delete require.cache[modulePath];
      require('../../../src/core/drag-state-manager.js');

      expect(global.window.DragStateManager).toBeDefined();
      expect(typeof global.window.DragStateManager).toBe('function');

      // 清理
      global.window = originalWindow;
      delete require.cache[modulePath];
    });
  });

  describe('与现有拖拽逻辑的兼容性', () => {
    test('应该能够管理所有现有的拖拽状态变量', () => {
      // 测试所有在主文件中使用的状态变量
      const requiredStates = [
        'active', 'rearrange', 'drag', 'dragx', 'dragy', 
        'original', 'lastevent', 'offsetleft', 'offsetleftold'
      ];

      requiredStates.forEach(state => {
        expect(dragStateManager.get(state)).toBeDefined();
      });
    });

    test('应该能够模拟完整的拖拽生命周期', () => {
      // 模拟拖拽开始
      const mockDragElement = { id: 'test-drag' };
      const mockOriginalElement = { id: 'test-original' };
      
      dragStateManager.startActiveDrag(mockDragElement, mockOriginalElement, 50, 75);
      
      expect(dragStateManager.isDragging()).toBe(true);
      expect(dragStateManager.isActiveDragging()).toBe(true);
      expect(dragStateManager.getCurrentDragElement()).toBe(mockDragElement);
      
      // 模拟拖拽位置更新
      dragStateManager.updateDragOffset(100, 150);
      expect(dragStateManager.getDragOffset()).toEqual({ x: 100, y: 150 });
      
      // 模拟拖拽结束
      dragStateManager.endDrag();
      expect(dragStateManager.isDragging()).toBe(false);
      expect(dragStateManager.getCurrentDragElement()).toBe(null);
    });

    test('应该能够模拟重排操作', () => {
      const mockDragElement = { id: 'rearrange-drag' };
      
      // 开始重排
      dragStateManager.startRearrange(mockDragElement, 30, 40);
      
      expect(dragStateManager.isDragging()).toBe(true);
      expect(dragStateManager.isRearranging()).toBe(true);
      expect(dragStateManager.isActiveDragging()).toBe(false);
      
      // 结束重排
      dragStateManager.endDrag();
      expect(dragStateManager.isRearranging()).toBe(false);
    });
  });

  describe('状态一致性验证', () => {
    test('状态变更应该保持内部一致性', () => {
      // 设置冲突状态应该被正确处理
      dragStateManager.setState({
        active: true,
        rearrange: true
      });

      // 虽然两个状态都为true，但isDragging应该正确工作
      expect(dragStateManager.isDragging()).toBe(true);
      
      // 使用高级方法应该正确设置状态
      dragStateManager.startActiveDrag({}, {}, 0, 0);
      expect(dragStateManager.get('active')).toBe(true);
      expect(dragStateManager.get('rearrange')).toBe(false);
    });

    test('状态重置应该完全清理', () => {
      // 设置复杂状态
      dragStateManager.setState({
        active: true,
        rearrange: true,
        drag: { id: 'test' },
        dragx: 100,
        dragy: 200,
        original: { id: 'original' }
      });

      // 重置
      dragStateManager.reset();

      // 验证所有状态都被重置
      expect(dragStateManager.isDragging()).toBe(false);
      expect(dragStateManager.getCurrentDragElement()).toBe(null);
      expect(dragStateManager.getOriginalElement()).toBe(null);
      expect(dragStateManager.getDragOffset()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('性能和内存管理', () => {
    test('历史记录应该有合理的内存限制', () => {
      // 创建大量状态变更
      for (let i = 0; i < 20; i++) {
        dragStateManager.set('dragx', i);
      }

      const history = dragStateManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(10); // 默认最大历史大小
    });

    test('频繁的位置更新不应该影响性能', () => {
      const startTime = Date.now();
      
      // 模拟频繁的位置更新
      for (let i = 0; i < 1000; i++) {
        dragStateManager.updateDragOffset(i, i * 2);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 1000次更新应该在合理时间内完成
      expect(duration).toBeLessThan(100); // 100ms
      
      // 位置更新不应该产生历史记录
      expect(dragStateManager.getHistory().length).toBe(0);
    });

    test('状态对象应该正确处理内存引用', () => {
      const mockElement = { id: 'test', data: 'some data' };
      
      dragStateManager.set('drag', mockElement);
      
      // 获取状态应该返回相同的引用
      expect(dragStateManager.get('drag')).toBe(mockElement);
      
      // 但getState应该返回深拷贝
      const state = dragStateManager.getState();
      expect(state.drag).toEqual(mockElement);
      expect(state.drag).not.toBe(mockElement); // 不是同一个引用
    });
  });

  describe('错误处理和边界条件', () => {
    test('应该处理无效的状态键', () => {
      expect(() => {
        dragStateManager.get('nonexistent');
      }).not.toThrow();
      
      expect(dragStateManager.get('nonexistent')).toBeUndefined();
    });

    test('应该处理null和undefined值', () => {
      expect(() => {
        dragStateManager.set('drag', null);
        dragStateManager.set('original', undefined);
      }).not.toThrow();
      
      expect(dragStateManager.get('drag')).toBe(null);
      expect(dragStateManager.get('original')).toBeUndefined();
    });

    test('应该处理空的状态更新', () => {
      expect(() => {
        dragStateManager.setState({});
      }).not.toThrow();
    });

    test('辅助状态设置应该过滤无效键', () => {
      dragStateManager.setAuxiliaryState({
        lastevent: true,
        invalidKey: 'should be ignored',
        offsetleft: 10
      });

      expect(dragStateManager.get('lastevent')).toBe(true);
      expect(dragStateManager.get('offsetleft')).toBe(10);
      expect(dragStateManager.get('invalidKey')).toBeUndefined();
    });
  });

  describe('调试和监控功能', () => {
    test('getSummary应该提供有用的调试信息', () => {
      dragStateManager.startActiveDrag({ id: 'test' }, { id: 'original' }, 50, 75);
      
      const summary = dragStateManager.getSummary();
      
      expect(summary).toHaveProperty('isDragging', true);
      expect(summary).toHaveProperty('isActive', true);
      expect(summary).toHaveProperty('isRearranging', false);
      expect(summary).toHaveProperty('hasDragElement', true);
      expect(summary).toHaveProperty('hasOriginalElement', true);
      expect(summary).toHaveProperty('dragOffset', { x: 50, y: 75 });
    });

    test('状态变更应该可以被追踪', () => {
      const initialHistoryLength = dragStateManager.getHistory().length;
      
      dragStateManager.set('active', true);
      expect(dragStateManager.getHistory().length).toBe(initialHistoryLength + 1);
      
      dragStateManager.set('dragx', 100);
      expect(dragStateManager.getHistory().length).toBe(initialHistoryLength + 2);
    });
  });
});
