/**
 * 数据管理器测试
 */

import { DataManager } from '../../src/core/data-manager';
import type {
  FlowyNode,
  FlowyConnection,
  BlockData,
  LegacyFlowyOutput,
} from '../../src/types';

describe('DataManager', () => {
  let container: HTMLElement;
  let dataManager: DataManager;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div class="indicator invisible"></div>';
    document.body.appendChild(container);
    dataManager = new DataManager(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('现代格式导入导出', () => {
    it('应该能够导出现代格式数据', () => {
      const nodes = new Map<string, FlowyNode>();
      const connections = new Map<string, FlowyConnection>();

      nodes.set('node1', {
        id: 'node1',
        type: 'start',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        childwidth: 0,
      });

      const data = dataManager.exportModern(nodes, connections);

      expect(data.nodes).toHaveLength(1);
      expect(data.connections).toHaveLength(0);
      expect(data.nodes[0]?.id).toBe('node1');
    });

    it('应该能够导入现代格式数据', () => {
      const testData = {
        nodes: [
          {
            id: 'node1',
            type: 'start',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            childwidth: 0,
          },
        ],
        connections: [
          {
            id: 'conn1',
            from: 'node1',
            to: 'node2',
          },
        ],
      };

      const { nodes, connections } = dataManager.importModern(testData);

      expect(nodes.size).toBe(1);
      expect(connections.size).toBe(1);
      expect(nodes.get('node1')?.type).toBe('start');
      expect(connections.get('conn1')?.from).toBe('node1');
    });
  });

  describe('传统格式导入导出', () => {
    it('应该能够导出传统格式数据', () => {
      const blocks: BlockData[] = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
      ];

      const data = dataManager.exportLegacy(blocks);

      expect(data.html).toBeDefined();
      expect(data.blockarr).toHaveLength(1);
      expect(data.blocks).toHaveLength(0); // 没有实际的块元素
    });

    it('应该能够导入传统格式数据', () => {
      const testData: LegacyFlowyOutput = {
        html: '<div class="block"><input class="blockid" value="0"></div>',
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
        ],
        blocks: [],
      };

      const blocks = dataManager.importLegacy(testData);

      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.id).toBe(0);
      expect(blocks[0]?.x).toBe(100);
    });
  });

  describe('格式转换', () => {
    it('应该能够将现代格式转换为传统格式', () => {
      const nodes = new Map<string, FlowyNode>();
      const connections = new Map<string, FlowyConnection>();

      nodes.set('1', {
        id: '1',
        type: 'start',
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        childwidth: 0,
      });

      nodes.set('2', {
        id: '2',
        type: 'end',
        x: 300,
        y: 200,
        width: 200,
        height: 50,
        childwidth: 0,
      });

      connections.set('conn1', {
        id: 'conn1',
        from: '1',
        to: '2',
      });

      const blocks = dataManager.modernToLegacy(nodes, connections);

      expect(blocks).toHaveLength(2);
      expect(blocks.find(b => b.id === 1)).toBeDefined();
      expect(blocks.find(b => b.id === 2)?.parent).toBe(1);
    });

    it('应该能够将传统格式转换为现代格式', () => {
      const blocks: BlockData[] = [
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
      ];

      const { nodes, connections } = dataManager.legacyToModern(blocks);

      expect(nodes.size).toBe(2);
      expect(connections.size).toBe(1);
      expect(nodes.get('0')).toBeDefined();
      expect(nodes.get('1')).toBeDefined();
      expect(connections.get('0_1')?.from).toBe('0');
      expect(connections.get('0_1')?.to).toBe('1');
    });
  });

  describe('数据验证', () => {
    it('应该能够验证现代格式数据', () => {
      const validData = {
        nodes: [
          {
            id: 'node1',
            type: 'start',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
        ],
        connections: [
          {
            id: 'conn1',
            from: 'node1',
            to: 'node2',
          },
        ],
      };

      const result = dataManager.validateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe('modern');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够验证传统格式数据', () => {
      const validData = {
        html: '<div></div>',
        blockarr: [
          {
            id: 0,
            parent: -1,
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
        ],
      };

      const result = dataManager.validateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe('legacy');
      expect(result.errors).toHaveLength(0);
    });

    it('应该能够识别无效数据', () => {
      const invalidData = {
        invalid: 'data',
      };

      const result = dataManager.validateData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.format).toBe('unknown');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('清理操作', () => {
    it('应该能够清空容器', () => {
      container.innerHTML = '<div>some content</div>';
      dataManager.clear();

      expect(container.innerHTML).toBe(
        '<div class="indicator invisible"></div>'
      );
    });
  });
});
