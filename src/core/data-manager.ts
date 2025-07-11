/**
 * 数据管理器
 * 处理数据的导入导出和格式转换
 */

import type {
  FlowyData,
  FlowyNode,
  FlowyConnection,
  BlockData,
  LegacyFlowyOutput,
} from '../types';

export class DataManager {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 导出现代格式数据
   */
  public exportModern(
    nodes: Map<string, FlowyNode>,
    connections: Map<string, FlowyConnection>
  ): FlowyData {
    return {
      nodes: Array.from(nodes.values()),
      connections: Array.from(connections.values()),
    };
  }

  /**
   * 导出传统格式数据（向后兼容）
   */
  public exportLegacy(blocks: BlockData[]): LegacyFlowyOutput {
    const html = this.container.innerHTML;
    const blocksData: LegacyFlowyOutput['blocks'] = [];

    if (blocks.length > 0) {
      blocks.forEach(block => {
        const blockElement = this.container.querySelector(
          `.blockid[value='${block.id}']`
        )?.parentNode as HTMLElement;

        if (blockElement) {
          const data: Array<{ name: string; value: string }> = [];
          const attr: Array<Record<string, string>> = [];

          // 收集输入数据
          blockElement.querySelectorAll('input').forEach(input => {
            const name = input.getAttribute('name');
            const value = input.value;
            if (name) {
              data.push({ name, value });
            }
          });

          // 收集属性
          Array.from(blockElement.attributes).forEach(attribute => {
            const attrObj: Record<string, string> = {};
            attrObj[attribute.name] = attribute.value;
            attr.push(attrObj);
          });

          blocksData.push({
            id: block.id,
            parent: block.parent,
            data,
            attr,
          });
        }
      });
    }

    return {
      html,
      blockarr: blocks,
      blocks: blocksData,
    };
  }

  /**
   * 导入传统格式数据
   */
  public importLegacy(data: LegacyFlowyOutput): BlockData[] {
    // 清空容器
    this.container.innerHTML = data.html;

    // 转换块数据
    const blocks: BlockData[] = [];
    if (data.blockarr) {
      data.blockarr.forEach(blockData => {
        blocks.push({
          id: blockData.id,
          parent: blockData.parent,
          childwidth: blockData.childwidth || 0,
          x: blockData.x,
          y: blockData.y,
          width: blockData.width,
          height: blockData.height,
        });
      });
    }

    return blocks;
  }

  /**
   * 导入现代格式数据
   */
  public importModern(data: FlowyData): {
    nodes: Map<string, FlowyNode>;
    connections: Map<string, FlowyConnection>;
  } {
    const nodes = new Map<string, FlowyNode>();
    const connections = new Map<string, FlowyConnection>();

    // 导入节点
    data.nodes.forEach(node => {
      nodes.set(node.id, node);
    });

    // 导入连接
    data.connections.forEach(connection => {
      connections.set(connection.id, connection);
    });

    return { nodes, connections };
  }

  /**
   * 将现代格式转换为传统格式
   */
  public modernToLegacy(
    nodes: Map<string, FlowyNode>,
    connections: Map<string, FlowyConnection>
  ): BlockData[] {
    const blocks: BlockData[] = [];

    nodes.forEach(node => {
      // 查找父节点
      let parentId = -1;
      connections.forEach(connection => {
        if (connection.to === node.id) {
          const parentNode = nodes.get(connection.from);
          if (parentNode) {
            parentId = parseInt(parentNode.id) || -1;
          }
        }
      });

      blocks.push({
        id: parseInt(node.id) || 0,
        parent: parentId,
        childwidth: node.childwidth || 0,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      });
    });

    return blocks;
  }

  /**
   * 将传统格式转换为现代格式
   */
  public legacyToModern(blocks: BlockData[]): {
    nodes: Map<string, FlowyNode>;
    connections: Map<string, FlowyConnection>;
  } {
    const nodes = new Map<string, FlowyNode>();
    const connections = new Map<string, FlowyConnection>();

    // 转换节点
    blocks.forEach(block => {
      const node: FlowyNode = {
        id: block.id.toString(),
        type: 'default',
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
        childwidth: block.childwidth,
        data: {},
      };

      nodes.set(node.id, node);
    });

    // 转换连接
    blocks.forEach(block => {
      if (block.parent !== -1) {
        const connectionId = `${block.parent}_${block.id}`;
        const connection: FlowyConnection = {
          id: connectionId,
          from: block.parent.toString(),
          to: block.id.toString(),
        };

        connections.set(connectionId, connection);
      }
    });

    return { nodes, connections };
  }

  /**
   * 清空所有数据
   */
  public clear(): void {
    this.container.innerHTML = '<div class="indicator invisible"></div>';
  }

  /**
   * 验证数据格式
   */
  public validateData(data: any): {
    isValid: boolean;
    format: 'modern' | 'legacy' | 'unknown';
    errors: string[];
  } {
    const errors: string[] = [];

    // 检查是否为现代格式
    if (
      data.nodes &&
      Array.isArray(data.nodes) &&
      data.connections &&
      Array.isArray(data.connections)
    ) {
      // 验证节点格式
      for (const node of data.nodes) {
        if (
          !node.id ||
          typeof node.x !== 'number' ||
          typeof node.y !== 'number'
        ) {
          errors.push('Invalid node format');
          break;
        }
      }

      // 验证连接格式
      for (const connection of data.connections) {
        if (!connection.id || !connection.from || !connection.to) {
          errors.push('Invalid connection format');
          break;
        }
      }

      return {
        isValid: errors.length === 0,
        format: 'modern',
        errors,
      };
    }

    // 检查是否为传统格式
    if (data.html && data.blockarr && Array.isArray(data.blockarr)) {
      // 验证块格式
      for (const block of data.blockarr) {
        if (
          typeof block.id !== 'number' ||
          typeof block.x !== 'number' ||
          typeof block.y !== 'number'
        ) {
          errors.push('Invalid block format');
          break;
        }
      }

      return {
        isValid: errors.length === 0,
        format: 'legacy',
        errors,
      };
    }

    return {
      isValid: false,
      format: 'unknown',
      errors: ['Unknown data format'],
    };
  }
}
