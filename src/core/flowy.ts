/**
 * Flowy 核心类
 */

import type {
  FlowyConfig,
  FlowyData,
  FlowyNode,
  FlowyConnection,
  FlowyEvents,
  FlowyEventType,
} from '../types';

export default class Flowy {
  private container: HTMLElement;
  private config: Required<FlowyConfig>;
  private nodes: Map<string, FlowyNode> = new Map();
  private connections: Map<string, FlowyConnection> = new Map();
  private eventListeners: Map<FlowyEventType, Function[]> = new Map();

  constructor(container: HTMLElement, config: FlowyConfig = {}) {
    this.container = container;
    this.config = {
      spacing: { x: 20, y: 80 },
      onGrab: () => {},
      onRelease: () => {},
      onSnap: () => true,
      onRearrange: () => false,
      ...config,
    };

    this.init();
  }

  private init(): void {
    // 初始化容器
    this.container.classList.add('flowy-container');

    // 设置事件监听
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // TODO: 实现事件监听逻辑
    // 这里将在 Sprint 1 中实现
    // 使用 config 避免 TypeScript 警告
    console.debug('Flowy initialized with spacing:', this.config.spacing);
  }

  /**
   * 添加节点
   */
  addNode(nodeConfig: Partial<FlowyNode>): string {
    const id = nodeConfig.id || this.generateId();
    const node: FlowyNode = {
      id,
      type: nodeConfig.type || 'default',
      x: nodeConfig.x || 0,
      y: nodeConfig.y || 0,
      width: nodeConfig.width || 100,
      height: nodeConfig.height || 50,
      parent: nodeConfig.parent,
      data: nodeConfig.data || {},
    };

    this.nodes.set(id, node);
    this.emit('node:add', node);
    return id;
  }

  /**
   * 移除节点
   */
  removeNode(id: string): void {
    if (this.nodes.has(id)) {
      this.nodes.delete(id);
      this.emit('node:remove', id);
    }
  }

  /**
   * 获取节点
   */
  getNode(id: string): FlowyNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * 连接节点
   */
  connect(fromId: string, toId: string): string {
    const id = this.generateId();
    const connection: FlowyConnection = {
      id,
      from: fromId,
      to: toId,
    };

    this.connections.set(id, connection);
    this.emit('connection:add', connection);
    return id;
  }

  /**
   * 断开连接
   */
  disconnect(connectionId: string): void {
    if (this.connections.has(connectionId)) {
      this.connections.delete(connectionId);
      this.emit('connection:remove', connectionId);
    }
  }

  /**
   * 导出数据
   */
  export(): FlowyData {
    const data: FlowyData = {
      nodes: Array.from(this.nodes.values()),
      connections: Array.from(this.connections.values()),
    };

    this.emit('data:export', data);
    return data;
  }

  /**
   * 导入数据
   */
  import(data: FlowyData): void {
    // 清空现有数据
    this.nodes.clear();
    this.connections.clear();

    // 导入节点
    data.nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });

    // 导入连接
    data.connections.forEach(connection => {
      this.connections.set(connection.id, connection);
    });

    this.emit('data:import', data);
  }

  /**
   * 事件监听
   */
  on<T extends FlowyEventType>(event: T, callback: FlowyEvents[T]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off<T extends FlowyEventType>(event: T, callback: FlowyEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<T extends FlowyEventType>(
    event: T,
    ...args: Parameters<FlowyEvents[T]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        callback(...args);
      });
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `flowy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.eventListeners.clear();
    this.nodes.clear();
    this.connections.clear();
  }
}
