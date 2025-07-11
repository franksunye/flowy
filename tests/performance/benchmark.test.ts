/**
 * 性能基准测试
 */

import Flowy from '../../src/core/flowy';
import { DataManager } from '../../src/core/data-manager';
import type { FlowyNode, FlowyConnection } from '../../src/types';

describe('Performance Benchmarks', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '1000px';
    container.style.height = '800px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('节点操作性能', () => {
    it('应该能够快速创建大量节点', () => {
      const flowy = new Flowy(container);
      const nodeCount = 1000;

      const startTime = performance.now();

      for (let i = 0; i < nodeCount; i++) {
        flowy.addNode({
          type: `node-${i}`,
          x: (i % 50) * 20,
          y: Math.floor(i / 50) * 20,
          width: 100,
          height: 50,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 500ms 内完成
      expect(duration).toBeLessThan(500);

      // 验证所有节点都被创建
      const exportedData = flowy.export();
      expect(exportedData.nodes).toHaveLength(nodeCount);

      flowy.destroy();
    });

    it('应该能够快速删除大量节点', () => {
      const flowy = new Flowy(container);
      const nodeCount = 500;
      const nodeIds: string[] = [];

      // 创建节点
      for (let i = 0; i < nodeCount; i++) {
        const nodeId = flowy.addNode({
          type: `node-${i}`,
          x: i * 10,
          y: i * 10,
        });
        nodeIds.push(nodeId);
      }

      const startTime = performance.now();

      // 删除所有节点
      nodeIds.forEach(nodeId => {
        flowy.removeNode(nodeId);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 200ms 内完成
      expect(duration).toBeLessThan(200);

      // 验证所有节点都被删除
      const exportedData = flowy.export();
      expect(exportedData.nodes).toHaveLength(0);

      flowy.destroy();
    });
  });

  describe('连接操作性能', () => {
    it('应该能够快速创建大量连接', () => {
      const flowy = new Flowy(container);
      const nodeCount = 100;
      const nodeIds: string[] = [];

      // 创建节点
      for (let i = 0; i < nodeCount; i++) {
        const nodeId = flowy.addNode({
          type: `node-${i}`,
          x: i * 15,
          y: i * 15,
        });
        nodeIds.push(nodeId);
      }

      const startTime = performance.now();

      // 创建连接（每个节点连接到下一个）
      for (let i = 0; i < nodeIds.length - 1; i++) {
        flowy.connect(nodeIds[i]!, nodeIds[i + 1]!);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 100ms 内完成
      expect(duration).toBeLessThan(100);

      // 验证所有连接都被创建
      const exportedData = flowy.export();
      expect(exportedData.connections).toHaveLength(nodeCount - 1);

      flowy.destroy();
    });
  });

  describe('数据导入导出性能', () => {
    it('应该能够快速导出大量数据', () => {
      const flowy = new Flowy(container);
      const nodeCount = 500;

      // 创建大量数据
      const nodeIds: string[] = [];
      for (let i = 0; i < nodeCount; i++) {
        const nodeId = flowy.addNode({
          type: `node-${i}`,
          x: i * 10,
          y: i * 10,
          data: {
            index: i,
            name: `Node ${i}`,
            description: `This is node number ${i}`,
            tags: [`tag-${i}`, `category-${i % 10}`],
          },
        });
        nodeIds.push(nodeId);
      }

      // 创建连接
      for (let i = 0; i < nodeIds.length - 1; i++) {
        flowy.connect(nodeIds[i]!, nodeIds[i + 1]!);
      }

      const startTime = performance.now();

      const exportedData = flowy.export();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 50ms 内完成
      expect(duration).toBeLessThan(50);

      // 验证数据完整性
      expect(exportedData.nodes).toHaveLength(nodeCount);
      expect(exportedData.connections).toHaveLength(nodeCount - 1);

      flowy.destroy();
    });

    it('应该能够快速导入大量数据', () => {
      const flowy = new Flowy(container);
      const nodeCount = 500;

      // 准备大量数据
      const nodes: FlowyNode[] = [];
      const connections: FlowyConnection[] = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          id: `node-${i}`,
          type: `type-${i % 5}`,
          x: i * 10,
          y: i * 10,
          width: 100,
          height: 50,
          childwidth: 0,
          data: {
            index: i,
            name: `Node ${i}`,
            complex: {
              nested: {
                data: `value-${i}`,
                array: [1, 2, 3, i],
              },
            },
          },
        });

        if (i > 0) {
          connections.push({
            id: `conn-${i}`,
            from: `node-${i - 1}`,
            to: `node-${i}`,
          });
        }
      }

      const importData = { nodes, connections };

      const startTime = performance.now();

      flowy.import(importData);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 100ms 内完成
      expect(duration).toBeLessThan(100);

      // 验证数据完整性
      const exportedData = flowy.export();
      expect(exportedData.nodes).toHaveLength(nodeCount);
      expect(exportedData.connections).toHaveLength(nodeCount - 1);

      flowy.destroy();
    });
  });

  describe('数据格式转换性能', () => {
    it('应该能够快速转换数据格式', () => {
      const dataManager = new DataManager(container);
      const nodeCount = 200;

      // 创建现代格式数据
      const nodes = new Map<string, FlowyNode>();
      const connections = new Map<string, FlowyConnection>();

      for (let i = 0; i < nodeCount; i++) {
        nodes.set(`node-${i}`, {
          id: `node-${i}`,
          type: `type-${i}`,
          x: i * 10,
          y: i * 10,
          width: 100,
          height: 50,
          childwidth: 0,
        });

        if (i > 0) {
          connections.set(`conn-${i}`, {
            id: `conn-${i}`,
            from: `node-${i - 1}`,
            to: `node-${i}`,
          });
        }
      }

      const startTime = performance.now();

      // 转换为传统格式
      const legacyBlocks = dataManager.modernToLegacy(nodes, connections);

      // 再转换回现代格式
      const { nodes: convertedNodes } =
        dataManager.legacyToModern(legacyBlocks);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 50ms 内完成
      expect(duration).toBeLessThan(50);

      // 验证转换正确性（传统格式转换可能会有一些数据丢失）
      expect(convertedNodes.size).toBeGreaterThan(0);
      expect(convertedNodes.size).toBeLessThanOrEqual(nodeCount);
    });
  });

  describe('内存使用测试', () => {
    it('应该能够处理大量创建和销毁而不泄漏内存', () => {
      const iterations = 50;
      const nodesPerIteration = 100;

      const startTime = performance.now();

      for (let iteration = 0; iteration < iterations; iteration++) {
        const flowy = new Flowy(container);

        // 创建节点
        for (let i = 0; i < nodesPerIteration; i++) {
          flowy.addNode({
            type: `node-${i}`,
            x: i * 5,
            y: i * 5,
          });
        }

        // 导出数据
        flowy.export();

        // 销毁实例
        flowy.destroy();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（2秒）
      expect(duration).toBeLessThan(2000);

      // 如果有内存泄漏，这个测试可能会变得越来越慢
      // 这是一个基本的检查，实际项目中可能需要更精确的内存监控
    });
  });

  describe('并发操作性能', () => {
    it('应该能够处理并发的节点操作', async () => {
      const flowy = new Flowy(container);
      const operationCount = 100;

      const startTime = performance.now();

      // 并发执行多个操作
      const promises = [];
      for (let i = 0; i < operationCount; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const nodeId = flowy.addNode({
              type: `concurrent-node-${i}`,
              x: i * 5,
              y: i * 5,
            });
            return nodeId;
          })
        );
      }

      const nodeIds = await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在 200ms 内完成
      expect(duration).toBeLessThan(200);

      // 验证所有操作都成功
      expect(nodeIds).toHaveLength(operationCount);
      expect(nodeIds.every(id => typeof id === 'string')).toBe(true);

      flowy.destroy();
    });
  });
});
