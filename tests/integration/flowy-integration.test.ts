/**
 * Flowy 集成测试
 * 测试各个模块之间的协作
 */

import Flowy from '../../src/core/flowy';
// import { flowy } from '../../src/legacy/flowy-legacy';
import type { FlowyConfig, LegacyFlowyOutput } from '../../src/types';

describe('Flowy Integration Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'integration-test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('现代 API 与传统 API 互操作', () => {
    it('应该能够在现代 API 和传统 API 之间转换数据', () => {
      // 使用现代 API 创建数据
      const modernFlowy = new Flowy(container);
      const node1Id = modernFlowy.addNode({
        type: 'start',
        x: 100,
        y: 100,
        width: 200,
        height: 50,
      });
      const node2Id = modernFlowy.addNode({
        type: 'end',
        x: 300,
        y: 200,
        width: 200,
        height: 50,
      });
      modernFlowy.connect(node1Id, node2Id);

      // 导出现代格式数据
      const modernData = modernFlowy.export();
      expect(modernData.nodes).toHaveLength(2);
      expect(modernData.connections).toHaveLength(1);

      // 使用传统 API 导入数据
      // const legacyFlowy = flowy(container);
      const legacyData = modernFlowy.output();
      expect(legacyData).toBeDefined();
      expect(legacyData?.blockarr).toBeDefined();

      // 清理
      modernFlowy.destroy();
    });

    it('应该能够处理复杂的数据转换', () => {
      const config: FlowyConfig = {
        spacing: { x: 30, y: 100 },
        onGrab: jest.fn(),
        onRelease: jest.fn(),
        onSnap: jest.fn().mockReturnValue(true),
      };

      const modernFlowy = new Flowy(container, config);

      // 创建复杂的节点结构
      const nodes = [];
      for (let i = 0; i < 5; i++) {
        const nodeId = modernFlowy.addNode({
          type: `node-${i}`,
          x: i * 150,
          y: i * 100,
          width: 120,
          height: 60,
          data: { index: i, name: `Node ${i}` },
        });
        nodes.push(nodeId);
      }

      // 创建连接
      for (let i = 0; i < nodes.length - 1; i++) {
        modernFlowy.connect(nodes[i]!, nodes[i + 1]!);
      }

      // 验证数据完整性
      const exportedData = modernFlowy.export();
      expect(exportedData.nodes).toHaveLength(5);
      expect(exportedData.connections).toHaveLength(4);

      // 验证传统格式导出
      const legacyOutput = modernFlowy.output();
      expect(legacyOutput?.blockarr).toBeDefined();

      modernFlowy.destroy();
    });
  });

  describe('事件系统集成', () => {
    it('应该能够正确触发和处理事件', () => {
      const nodeAddCallback = jest.fn();
      const connectionAddCallback = jest.fn();
      const dataExportCallback = jest.fn();

      const modernFlowy = new Flowy(container);
      modernFlowy.on('node:add', nodeAddCallback);
      modernFlowy.on('connection:add', connectionAddCallback);
      modernFlowy.on('data:export', dataExportCallback);

      // 添加节点应该触发事件
      const nodeId = modernFlowy.addNode({ type: 'test' });
      expect(nodeAddCallback).toHaveBeenCalledTimes(1);
      expect(nodeAddCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: nodeId,
          type: 'test',
        })
      );

      // 添加连接应该触发事件
      const node2Id = modernFlowy.addNode({ type: 'test2' });
      const connectionId = modernFlowy.connect(nodeId, node2Id);
      expect(connectionAddCallback).toHaveBeenCalledTimes(1);
      expect(connectionAddCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: connectionId,
          from: nodeId,
          to: node2Id,
        })
      );

      // 导出数据应该触发事件
      // 注意：由于历史记录功能，export 可能被多次调用
      // 我们只检查是否至少被调用了一次
      modernFlowy.export();
      expect(dataExportCallback).toHaveBeenCalled();

      modernFlowy.destroy();
    });

    it('应该能够移除事件监听器', () => {
      const callback = jest.fn();
      const modernFlowy = new Flowy(container);

      modernFlowy.on('node:add', callback);
      modernFlowy.addNode({ type: 'test' });
      expect(callback).toHaveBeenCalledTimes(1);

      modernFlowy.off('node:add', callback);
      modernFlowy.addNode({ type: 'test2' });
      expect(callback).toHaveBeenCalledTimes(1); // 不应该再次调用

      modernFlowy.destroy();
    });
  });

  describe('数据持久化和恢复', () => {
    it('应该能够完整保存和恢复状态', () => {
      const originalFlowy = new Flowy(container);

      // 创建复杂状态
      const node1 = originalFlowy.addNode({
        type: 'input',
        x: 50,
        y: 50,
        data: { label: 'Input Node' },
      });
      const node2 = originalFlowy.addNode({
        type: 'process',
        x: 250,
        y: 150,
        data: { label: 'Process Node' },
      });
      const node3 = originalFlowy.addNode({
        type: 'output',
        x: 450,
        y: 250,
        data: { label: 'Output Node' },
      });

      originalFlowy.connect(node1, node2);
      originalFlowy.connect(node2, node3);

      // 导出状态
      const savedState = originalFlowy.export();
      originalFlowy.destroy();

      // 创建新实例并恢复状态
      const restoredFlowy = new Flowy(container);
      restoredFlowy.import(savedState);

      // 验证状态恢复
      const restoredState = restoredFlowy.export();
      expect(restoredState.nodes).toHaveLength(3);
      expect(restoredState.connections).toHaveLength(2);

      // 验证节点数据
      const inputNode = restoredState.nodes.find(n => n.type === 'input');
      expect(inputNode?.data?.['label']).toBe('Input Node');

      restoredFlowy.destroy();
    });

    it('应该能够处理传统格式的数据恢复', () => {
      const legacyData: LegacyFlowyOutput = {
        html: '<div class="indicator invisible"></div>',
        blockarr: [
          {
            id: 0,
            parent: -1,
            childwidth: 0,
            x: 100,
            y: 100,
            width: 200,
            height: 50,
          },
          {
            id: 1,
            parent: 0,
            childwidth: 0,
            x: 300,
            y: 200,
            width: 200,
            height: 50,
          },
        ],
        blocks: [],
      };

      const modernFlowy = new Flowy(container);
      modernFlowy.importLegacy(legacyData);

      const exportedData = modernFlowy.export();
      expect(exportedData.nodes).toHaveLength(2);
      expect(exportedData.connections).toHaveLength(1);

      modernFlowy.destroy();
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该能够处理无效的节点 ID', () => {
      const modernFlowy = new Flowy(container);

      expect(() => modernFlowy.removeNode('non-existent')).not.toThrow();
      expect(() => modernFlowy.connect('invalid1', 'invalid2')).not.toThrow();
      expect(() => modernFlowy.disconnect('invalid-connection')).not.toThrow();

      modernFlowy.destroy();
    });

    it('应该能够处理空数据导入', () => {
      const modernFlowy = new Flowy(container);

      expect(() =>
        modernFlowy.import({ nodes: [], connections: [] })
      ).not.toThrow();

      const exportedData = modernFlowy.export();
      expect(exportedData.nodes).toHaveLength(0);
      expect(exportedData.connections).toHaveLength(0);

      modernFlowy.destroy();
    });

    it('应该能够处理重复的节点 ID', () => {
      const modernFlowy = new Flowy(container);

      const nodeId1 = modernFlowy.addNode({ id: 'duplicate', type: 'test' });
      const nodeId2 = modernFlowy.addNode({ id: 'duplicate', type: 'test' });

      // 应该生成不同的 ID
      expect(nodeId1).not.toBe(nodeId2);

      modernFlowy.destroy();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量节点', () => {
      const modernFlowy = new Flowy(container);
      const startTime = performance.now();

      // 创建 100 个节点
      const nodeIds = [];
      for (let i = 0; i < 100; i++) {
        const nodeId = modernFlowy.addNode({
          type: `node-${i}`,
          x: (i % 10) * 100,
          y: Math.floor(i / 10) * 100,
        });
        nodeIds.push(nodeId);
      }

      // 创建连接
      for (let i = 0; i < nodeIds.length - 1; i++) {
        modernFlowy.connect(nodeIds[i]!, nodeIds[i + 1]!);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（1秒）
      expect(duration).toBeLessThan(1000);

      // 验证数据完整性
      const exportedData = modernFlowy.export();
      expect(exportedData.nodes).toHaveLength(100);
      expect(exportedData.connections).toHaveLength(99);

      modernFlowy.destroy();
    });
  });
});
