/**
 * 拖拽状态管理器单元测试
 * 
 * 测试覆盖:
 * - 基础状态管理功能
 * - 拖拽状态转换
 * - 状态查询方法
 * - 历史记录功能
 * - 边界条件处理
 * 
 * @author Flowy Team
 * @version 1.0.0
 */

const DragStateManager = require('../../../src/core/drag-state-manager.js');

describe('DragStateManager', () => {
  let dragStateManager;

  beforeEach(() => {
    dragStateManager = new DragStateManager();
  });

  describe('初始化和重置', () => {
    test('应该正确初始化默认状态', () => {
      const state = dragStateManager.getState();
      
      expect(state.active).toBe(false);
      expect(state.rearrange).toBe(false);
      expect(state.drag).toBe(null);
      expect(state.dragx).toBe(0);
      expect(state.dragy).toBe(0);
      expect(state.original).toBe(null);
      expect(state.lastevent).toBe(false);
      expect(state.offsetleft).toBe(0);
      expect(state.offsetleftold).toBe(0);
      expect(Array.isArray(state.history)).toBe(true);
      expect(state.history.length).toBe(0);
    });

    test('reset() 应该重置所有状态到初始值', () => {
      // 修改一些状态
      dragStateManager.setState({
        active: true,
        rearrange: true,
        dragx: 100,
        dragy: 200
      });

      // 重置
      dragStateManager.reset();

      // 验证重置结果
      const state = dragStateManager.getState();
      expect(state.active).toBe(false);
      expect(state.rearrange).toBe(false);
      expect(state.dragx).toBe(0);
      expect(state.dragy).toBe(0);
    });
  });

  describe('基础状态操作', () => {
    test('get() 应该返回正确的状态值', () => {
      expect(dragStateManager.get('active')).toBe(false);
      expect(dragStateManager.get('dragx')).toBe(0);
    });

    test('set() 应该正确设置单个状态值', () => {
      dragStateManager.set('active', true);
      expect(dragStateManager.get('active')).toBe(true);

      dragStateManager.set('dragx', 150);
      expect(dragStateManager.get('dragx')).toBe(150);
    });

    test('setState() 应该正确批量设置状态', () => {
      const updates = {
        active: true,
        dragx: 100,
        dragy: 200
      };

      dragStateManager.setState(updates);

      expect(dragStateManager.get('active')).toBe(true);
      expect(dragStateManager.get('dragx')).toBe(100);
      expect(dragStateManager.get('dragy')).toBe(200);
    });

    test('getState() 应该返回状态的深拷贝', () => {
      const state1 = dragStateManager.getState();
      const state2 = dragStateManager.getState();

      // 应该是不同的对象
      expect(state1).not.toBe(state2);
      // 但内容相同
      expect(state1).toEqual(state2);

      // 修改返回的状态不应该影响内部状态
      state1.active = true;
      expect(dragStateManager.get('active')).toBe(false);
    });
  });

  describe('拖拽状态查询', () => {
    test('isDragging() 应该正确检测拖拽状态', () => {
      expect(dragStateManager.isDragging()).toBe(false);

      dragStateManager.set('active', true);
      expect(dragStateManager.isDragging()).toBe(true);

      dragStateManager.set('active', false);
      dragStateManager.set('rearrange', true);
      expect(dragStateManager.isDragging()).toBe(true);

      dragStateManager.set('rearrange', false);
      expect(dragStateManager.isDragging()).toBe(false);
    });

    test('isActiveDragging() 应该正确检测新块拖拽', () => {
      expect(dragStateManager.isActiveDragging()).toBe(false);

      dragStateManager.set('active', true);
      expect(dragStateManager.isActiveDragging()).toBe(true);

      dragStateManager.set('rearrange', true);
      expect(dragStateManager.isActiveDragging()).toBe(true); // active 仍为 true
    });

    test('isRearranging() 应该正确检测重排状态', () => {
      expect(dragStateManager.isRearranging()).toBe(false);

      dragStateManager.set('rearrange', true);
      expect(dragStateManager.isRearranging()).toBe(true);
    });
  });

  describe('高级拖拽操作', () => {
    test('startActiveDrag() 应该正确设置新块拖拽状态', () => {
      const mockDragElement = { id: 'drag' };
      const mockOriginalElement = { id: 'original' };

      dragStateManager.startActiveDrag(mockDragElement, mockOriginalElement, 50, 75);

      expect(dragStateManager.get('active')).toBe(true);
      expect(dragStateManager.get('rearrange')).toBe(false);
      expect(dragStateManager.get('drag')).toBe(mockDragElement);
      expect(dragStateManager.get('original')).toBe(mockOriginalElement);
      expect(dragStateManager.get('dragx')).toBe(50);
      expect(dragStateManager.get('dragy')).toBe(75);
    });

    test('startRearrange() 应该正确设置重排状态', () => {
      const mockDragElement = { id: 'drag' };

      dragStateManager.startRearrange(mockDragElement, 30, 40);

      expect(dragStateManager.get('active')).toBe(false);
      expect(dragStateManager.get('rearrange')).toBe(true);
      expect(dragStateManager.get('drag')).toBe(mockDragElement);
      expect(dragStateManager.get('dragx')).toBe(30);
      expect(dragStateManager.get('dragy')).toBe(40);
    });

    test('endDrag() 应该清理所有拖拽状态', () => {
      // 先设置一些拖拽状态
      dragStateManager.startActiveDrag({ id: 'drag' }, { id: 'original' }, 100, 200);

      // 结束拖拽
      dragStateManager.endDrag();

      expect(dragStateManager.get('active')).toBe(false);
      expect(dragStateManager.get('rearrange')).toBe(false);
      expect(dragStateManager.get('drag')).toBe(null);
      expect(dragStateManager.get('original')).toBe(null);
      expect(dragStateManager.get('dragx')).toBe(0);
      expect(dragStateManager.get('dragy')).toBe(0);
    });

    test('updateDragOffset() 应该更新拖拽偏移', () => {
      dragStateManager.updateDragOffset(120, 180);

      expect(dragStateManager.get('dragx')).toBe(120);
      expect(dragStateManager.get('dragy')).toBe(180);
    });
  });

  describe('便捷访问方法', () => {
    test('getCurrentDragElement() 应该返回当前拖拽元素', () => {
      expect(dragStateManager.getCurrentDragElement()).toBe(null);

      const mockElement = { id: 'test' };
      dragStateManager.set('drag', mockElement);
      expect(dragStateManager.getCurrentDragElement()).toBe(mockElement);
    });

    test('getOriginalElement() 应该返回原始元素', () => {
      expect(dragStateManager.getOriginalElement()).toBe(null);

      const mockElement = { id: 'original' };
      dragStateManager.set('original', mockElement);
      expect(dragStateManager.getOriginalElement()).toBe(mockElement);
    });

    test('getDragOffset() 应该返回拖拽偏移对象', () => {
      dragStateManager.updateDragOffset(50, 100);
      
      const offset = dragStateManager.getDragOffset();
      expect(offset).toEqual({ x: 50, y: 100 });
    });
  });

  describe('辅助状态管理', () => {
    test('setAuxiliaryState() 应该只设置允许的辅助状态', () => {
      const auxiliaryState = {
        lastevent: true,
        offsetleft: 10,
        offsetleftold: 5,
        invalidKey: 'should be ignored' // 不应该被设置
      };

      dragStateManager.setAuxiliaryState(auxiliaryState);

      expect(dragStateManager.get('lastevent')).toBe(true);
      expect(dragStateManager.get('offsetleft')).toBe(10);
      expect(dragStateManager.get('offsetleftold')).toBe(5);
      expect(dragStateManager.get('invalidKey')).toBeUndefined();
    });
  });

  describe('历史记录功能', () => {
    test('应该记录状态变更历史', () => {
      // 初始状态，历史为空
      expect(dragStateManager.getHistory().length).toBe(0);

      // 第一次变更
      dragStateManager.set('active', true);
      expect(dragStateManager.getHistory().length).toBe(1);

      // 第二次变更
      dragStateManager.set('dragx', 100);
      expect(dragStateManager.getHistory().length).toBe(2);
    });

    test('updateDragOffset() 不应该记录历史', () => {
      dragStateManager.updateDragOffset(50, 100);
      expect(dragStateManager.getHistory().length).toBe(0);
    });

    test('rollback() 应该恢复到上一个状态', () => {
      // 设置初始状态
      dragStateManager.set('active', true);
      // 历史记录: [初始状态]

      dragStateManager.set('dragx', 100);
      // 历史记录: [初始状态, {active: true, dragx: 0, ...}]

      // 再次变更
      dragStateManager.set('active', false);
      // 历史记录: [初始状态, {active: true, dragx: 0, ...}, {active: true, dragx: 100, ...}]

      dragStateManager.set('dragx', 200);
      // 历史记录: [初始状态, {active: true, dragx: 0, ...}, {active: true, dragx: 100, ...}, {active: false, dragx: 100, ...}]

      // 回滚应该恢复到最后一个历史状态 {active: false, dragx: 100, ...}
      const rollbackSuccess = dragStateManager.rollback();

      expect(rollbackSuccess).toBe(true);
      expect(dragStateManager.get('active')).toBe(false);
      expect(dragStateManager.get('dragx')).toBe(100);
    });

    test('当没有历史记录时 rollback() 应该返回 false', () => {
      const rollbackSuccess = dragStateManager.rollback();
      expect(rollbackSuccess).toBe(false);
    });
  });

  describe('状态摘要', () => {
    test('getSummary() 应该返回正确的状态摘要', () => {
      const mockDragElement = { id: 'drag' };
      const mockOriginalElement = { id: 'original' };

      dragStateManager.startActiveDrag(mockDragElement, mockOriginalElement, 50, 75);

      const summary = dragStateManager.getSummary();

      expect(summary.isDragging).toBe(true);
      expect(summary.isActive).toBe(true);
      expect(summary.isRearranging).toBe(false);
      expect(summary.hasDragElement).toBe(true);
      expect(summary.hasOriginalElement).toBe(true);
      expect(summary.dragOffset).toEqual({ x: 50, y: 75 });
    });
  });

  describe('边界条件', () => {
    test('应该处理 null 和 undefined 值', () => {
      dragStateManager.set('drag', null);
      dragStateManager.set('original', undefined);

      expect(dragStateManager.getCurrentDragElement()).toBe(null);
      expect(dragStateManager.getOriginalElement()).toBeUndefined();
    });

    test('应该处理数字类型的状态值', () => {
      dragStateManager.set('dragx', 0);
      dragStateManager.set('dragy', -50);

      expect(dragStateManager.get('dragx')).toBe(0);
      expect(dragStateManager.get('dragy')).toBe(-50);
    });
  });
});
