/**
 * Flowy 核心类测试
 */

import Flowy from '../../src/core/flowy';
import type { FlowyConfig, FlowyData } from '../../src/types';

describe('Flowy', () => {
  let container: HTMLElement;
  let flowy: Flowy;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // 创建 Flowy 实例
    flowy = new Flowy(container);
  });

  afterEach(() => {
    // 清理
    flowy.destroy();
    document.body.removeChild(container);
  });

  describe('初始化', () => {
    it('应该正确初始化容器', () => {
      expect(container.classList.contains('flowy-container')).toBe(true);
    });

    it('应该接受配置参数', () => {
      const config: FlowyConfig = {
        spacing: { x: 30, y: 100 },
        onGrab: jest.fn(),
      };

      const customFlowy = new Flowy(container, config);
      expect(customFlowy).toBeInstanceOf(Flowy);
      customFlowy.destroy();
    });
  });

  describe('节点管理', () => {
    it('应该能够添加节点', () => {
      const nodeId = flowy.addNode({
        type: 'action',
        x: 100,
        y: 200,
        data: { name: 'Test Node' },
      });

      expect(nodeId).toBeDefined();
      expect(typeof nodeId).toBe('string');

      const node = flowy.getNode(nodeId);
      expect(node).toBeDefined();
      expect(node?.type).toBe('action');
      expect(node?.x).toBe(100);
      expect(node?.y).toBe(200);
      expect(node?.data?.['name']).toBe('Test Node');
      expect(node?.childwidth).toBe(0);
    });

    it('应该能够移除节点', () => {
      const nodeId = flowy.addNode({ type: 'action' });
      expect(flowy.getNode(nodeId)).toBeDefined();

      flowy.removeNode(nodeId);
      expect(flowy.getNode(nodeId)).toBeUndefined();
    });

    it('应该为节点生成唯一 ID', () => {
      const nodeId1 = flowy.addNode({ type: 'action' });
      const nodeId2 = flowy.addNode({ type: 'action' });

      expect(nodeId1).not.toBe(nodeId2);
    });

    it('应该使用提供的节点 ID', () => {
      const customId = 'custom-node-id';
      const nodeId = flowy.addNode({ id: customId, type: 'action' });

      expect(nodeId).toBe(customId);
    });
  });

  describe('连接管理', () => {
    let node1Id: string;
    let node2Id: string;

    beforeEach(() => {
      node1Id = flowy.addNode({ type: 'start' });
      node2Id = flowy.addNode({ type: 'end' });
    });

    it('应该能够连接节点', () => {
      const connectionId = flowy.connect(node1Id, node2Id);

      expect(connectionId).toBeDefined();
      expect(typeof connectionId).toBe('string');
    });

    it('应该能够断开连接', () => {
      const connectionId = flowy.connect(node1Id, node2Id);

      // 断开连接前应该存在
      expect(connectionId).toBeDefined();

      // 断开连接
      flowy.disconnect(connectionId);

      // 验证连接已断开（通过导出数据检查）
      const data = flowy.export();
      expect(data.connections.find(c => c.id === connectionId)).toBeUndefined();
    });
  });

  describe('数据导入导出', () => {
    it('应该能够导出空数据', () => {
      const data = flowy.export();

      expect(data).toBeDefined();
      expect(data.nodes).toEqual([]);
      expect(data.connections).toEqual([]);
    });

    it('应该能够导出节点和连接', () => {
      const node1Id = flowy.addNode({ type: 'start', x: 0, y: 0 });
      const node2Id = flowy.addNode({ type: 'end', x: 100, y: 100 });
      flowy.connect(node1Id, node2Id);

      const data = flowy.export();

      expect(data.nodes).toHaveLength(2);
      expect(data.connections).toHaveLength(1);
      expect(data.nodes[0]?.type).toBe('start');
      expect(data.nodes[1]?.type).toBe('end');
      expect(data.connections[0]?.from).toBe(node1Id);
      expect(data.connections[0]?.to).toBe(node2Id);
    });

    it('应该能够导入数据', () => {
      const testData: FlowyData = {
        nodes: [
          { id: 'node1', type: 'start', x: 0, y: 0, width: 100, height: 50 },
          { id: 'node2', type: 'end', x: 200, y: 100, width: 100, height: 50 },
        ],
        connections: [{ id: 'conn1', from: 'node1', to: 'node2' }],
      };

      flowy.import(testData);

      const exportedData = flowy.export();
      expect(exportedData.nodes).toHaveLength(2);
      expect(exportedData.connections).toHaveLength(1);
      expect(exportedData.nodes[0]?.id).toBe('node1');
      expect(exportedData.nodes[1]?.id).toBe('node2');
      expect(exportedData.connections[0]?.id).toBe('conn1');
    });

    it('导入数据应该清空现有数据', () => {
      // 添加一些初始数据
      flowy.addNode({ type: 'initial' });
      expect(flowy.export().nodes).toHaveLength(1);

      // 导入新数据
      const testData: FlowyData = {
        nodes: [
          { id: 'new-node', type: 'new', x: 0, y: 0, width: 100, height: 50 },
        ],
        connections: [],
      };

      flowy.import(testData);

      const exportedData = flowy.export();
      expect(exportedData.nodes).toHaveLength(1);
      expect(exportedData.nodes[0]?.id).toBe('new-node');
    });
  });

  describe('事件系统', () => {
    it('应该能够监听和触发事件', () => {
      const mockCallback = jest.fn();
      flowy.on('node:add', mockCallback);

      const nodeId = flowy.addNode({ type: 'test' });

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: nodeId,
          type: 'test',
        })
      );
    });

    it('应该能够移除事件监听', () => {
      const mockCallback = jest.fn();
      flowy.on('node:add', mockCallback);
      flowy.off('node:add', mockCallback);

      flowy.addNode({ type: 'test' });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('应该支持多个事件监听器', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      flowy.on('node:add', mockCallback1);
      flowy.on('node:add', mockCallback2);

      flowy.addNode({ type: 'test' });

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('撤销重做功能', () => {
    it('应该能够撤销添加节点操作', () => {
      flowy.addNode({ x: 100, y: 100 });

      expect(flowy.export().nodes).toHaveLength(1);
      expect(flowy.canUndo()).toBe(true);

      const undoResult = flowy.undo();
      expect(undoResult.success).toBe(true);
      expect(flowy.export().nodes).toHaveLength(0);
    });

    it('应该能够重做添加节点操作', () => {
      flowy.addNode({ x: 100, y: 100 });
      flowy.undo();

      expect(flowy.canRedo()).toBe(true);

      const redoResult = flowy.redo();
      expect(redoResult.success).toBe(true);
      expect(flowy.export().nodes).toHaveLength(1);
    });

    it('应该能够撤销删除节点操作', () => {
      const nodeId = flowy.addNode({ x: 100, y: 100 });
      flowy.removeNode(nodeId);

      expect(flowy.export().nodes).toHaveLength(0);
      expect(flowy.canUndo()).toBe(true);

      flowy.undo();
      expect(flowy.export().nodes).toHaveLength(1);
    });

    it('应该能够撤销连接操作', () => {
      const node1Id = flowy.addNode({ x: 100, y: 100 });
      const node2Id = flowy.addNode({ x: 200, y: 200 });
      flowy.connect(node1Id, node2Id);

      expect(flowy.export().connections).toHaveLength(1);

      flowy.undo();
      expect(flowy.export().connections).toHaveLength(0);
    });

    it('应该能够获取撤销重做描述', () => {
      flowy.addNode({ x: 100, y: 100 });

      const undoDesc = flowy.getUndoDescription();
      expect(undoDesc).toContain('添加节点');

      flowy.undo();
      const redoDesc = flowy.getRedoDescription();
      expect(redoDesc).toContain('添加节点');
    });

    it('应该能够获取历史记录信息', () => {
      flowy.addNode({ x: 100, y: 100 });

      const historyInfo = flowy.getHistoryInfo();
      expect(historyInfo.canUndo).toBe(true);
      expect(historyInfo.canRedo).toBe(false);
      expect(historyInfo.totalEntries).toBe(1);
    });

    it('应该在没有历史记录时正确处理', () => {
      expect(flowy.canUndo()).toBe(false);
      expect(flowy.canRedo()).toBe(false);
      expect(flowy.undo().success).toBe(false);
      expect(flowy.redo().success).toBe(false);
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁实例', () => {
      const mockCallback = jest.fn();
      flowy.on('node:add', mockCallback);
      flowy.addNode({ type: 'test' });

      flowy.destroy();

      // 销毁后添加节点不应该触发事件
      flowy.addNode({ type: 'test2' });
      expect(mockCallback).toHaveBeenCalledTimes(1); // 只有第一次调用
    });
  });
});
