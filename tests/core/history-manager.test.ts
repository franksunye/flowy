import { HistoryManager } from '../../src/core/history-manager';
import { ModernFlowData } from '../../src/types';

describe('HistoryManager', () => {
  let historyManager: HistoryManager;
  let mockData1: ModernFlowData;
  let mockData2: ModernFlowData;

  beforeEach(() => {
    historyManager = new HistoryManager(5); // 小的历史记录大小用于测试

    mockData1 = {
      nodes: [
        {
          id: '1',
          type: 'start',
          x: 100,
          y: 100,
          width: 100,
          height: 50,
          data: {},
        },
      ],
      connections: [],
    };

    mockData2 = {
      nodes: [
        {
          id: '1',
          type: 'start',
          x: 100,
          y: 100,
          width: 100,
          height: 50,
          data: {},
        },
        {
          id: '2',
          type: 'process',
          x: 200,
          y: 200,
          width: 100,
          height: 50,
          data: {},
        },
      ],
      connections: [{ id: 'c1', from: '1', to: '2' }],
    };
  });

  afterEach(() => {
    historyManager.destroy();
  });

  describe('初始化', () => {
    it('应该正确初始化历史管理器', () => {
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
      expect(historyManager.getHistoryInfo().totalEntries).toBe(0);
    });
  });

  describe('记录操作', () => {
    it('应该能够记录操作', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');

      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.canRedo()).toBe(false);
      expect(historyManager.getHistoryInfo().totalEntries).toBe(1);
    });

    it('应该能够记录多个操作', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.recordAction('remove', mockData2, mockData1, '删除节点');

      expect(historyManager.getHistoryInfo().totalEntries).toBe(2);
      expect(historyManager.getHistoryInfo().currentIndex).toBe(1);
    });

    it('应该限制历史记录大小', () => {
      // 添加超过最大大小的记录
      for (let i = 0; i < 10; i++) {
        historyManager.recordAction('add', mockData1, mockData2, `操作 ${i}`);
      }

      expect(historyManager.getHistoryInfo().totalEntries).toBe(5); // 最大大小
    });
  });

  describe('撤销操作', () => {
    it('应该能够撤销操作', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');

      const result = historyManager.undo();
      expect(result).toEqual(mockData1);
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(true);
    });

    it('应该能够撤销多个操作', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.recordAction('remove', mockData2, mockData1, '删除节点');

      let result = historyManager.undo();
      expect(result).toEqual(mockData2);

      result = historyManager.undo();
      expect(result).toEqual(mockData1);

      expect(historyManager.canUndo()).toBe(false);
    });

    it('应该在没有可撤销操作时返回 null', () => {
      const result = historyManager.undo();
      expect(result).toBeNull();
    });
  });

  describe('重做操作', () => {
    it('应该能够重做操作', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.undo();

      const result = historyManager.redo();
      expect(result).toEqual(mockData2);
      expect(historyManager.canRedo()).toBe(false);
      expect(historyManager.canUndo()).toBe(true);
    });

    it('应该在没有可重做操作时返回 null', () => {
      const result = historyManager.redo();
      expect(result).toBeNull();
    });
  });

  describe('历史记录分支', () => {
    it('应该在新操作后清除重做历史', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.undo();

      expect(historyManager.canRedo()).toBe(true);

      // 记录新操作应该清除重做历史
      historyManager.recordAction('connect', mockData1, mockData2, '连接节点');

      expect(historyManager.canRedo()).toBe(false);
      expect(historyManager.canUndo()).toBe(true);
    });
  });

  describe('描述信息', () => {
    it('应该能够获取撤销描述', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');

      expect(historyManager.getUndoDescription()).toBe('添加节点');
    });

    it('应该能够获取重做描述', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.undo();

      expect(historyManager.getRedoDescription()).toBe('添加节点');
    });

    it('应该在没有可撤销/重做操作时返回 null', () => {
      expect(historyManager.getUndoDescription()).toBeNull();
      expect(historyManager.getRedoDescription()).toBeNull();
    });
  });

  describe('历史记录信息', () => {
    it('应该能够获取完整的历史记录信息', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');

      const info = historyManager.getHistoryInfo();
      expect(info.canUndo).toBe(true);
      expect(info.canRedo).toBe(false);
      expect(info.currentIndex).toBe(0);
      expect(info.totalEntries).toBe(1);
      expect(info.currentEntry).toBeDefined();
      expect(info.currentEntry?.description).toBe('添加节点');
    });
  });

  describe('清理操作', () => {
    it('应该能够清空历史记录', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');
      historyManager.clear();

      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
      expect(historyManager.getHistoryInfo().totalEntries).toBe(0);
    });
  });

  describe('数据完整性', () => {
    it('应该深度克隆数据以防止意外修改', () => {
      historyManager.recordAction('add', mockData1, mockData2, '添加节点');

      // 修改原始数据
      mockData1.nodes[0].x = 999;

      // 撤销应该返回未修改的数据
      const result = historyManager.undo();
      expect(result?.nodes[0].x).toBe(100);
    });
  });
});
