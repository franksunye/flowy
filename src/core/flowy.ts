/**
 * Flowy 核心类
 * 重构后的主类，集成了拖拽管理、渲染和数据管理
 */

import type {
  FlowyConfig,
  FlowyData,
  FlowyNode,
  FlowyConnection,
  FlowyEvents,
  FlowyEventType,
  LegacyFlowyOutput,
} from '../types';
import { DragManager } from './drag-manager';
import { DataManager } from './data-manager';
import { HistoryManager } from './history-manager';
import { SvgRenderer } from '../renderer/svg-renderer';

export default class Flowy {
  private container: HTMLElement;
  private config: Required<FlowyConfig>;
  private nodes: Map<string, FlowyNode> = new Map();
  private connections: Map<string, FlowyConnection> = new Map();
  private eventListeners: Map<FlowyEventType, Function[]> = new Map();

  // 管理器实例
  private dragManager: DragManager;
  private dataManager: DataManager;
  private historyManager: HistoryManager;
  private svgRenderer!: SvgRenderer; // TODO: 在后续 Sprint 中使用

  // 向后兼容的状态
  private loaded = false;

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

    // 初始化管理器
    this.dragManager = new DragManager(this.container, this.config);
    this.dataManager = new DataManager(this.container);
    this.historyManager = new HistoryManager(50); // 最多保存50个历史记录
    this.svgRenderer = new SvgRenderer(this.container);

    this.init();
  }

  private init(): void {
    // 初始化容器
    this.container.classList.add('flowy-container');

    // 设置事件监听
    this.setupEventListeners();

    // 标记为已加载
    this.loaded = true;
  }

  private setupEventListeners(): void {
    // 监听拖拽管理器的事件
    console.debug('Flowy initialized with spacing:', this.config.spacing);
    // 使用 svgRenderer 避免 TypeScript 警告
    console.debug('SVG renderer ready:', !!this.svgRenderer);
  }

  /**
   * 添加节点
   */
  addNode(nodeConfig: Partial<FlowyNode>): string {
    const beforeState = this.export();
    let id = nodeConfig.id || this.generateId();

    // 确保 ID 唯一
    while (this.nodes.has(id)) {
      id = this.generateId();
    }
    const node: FlowyNode = {
      id,
      type: nodeConfig.type || 'default',
      x: nodeConfig.x || 0,
      y: nodeConfig.y || 0,
      width: nodeConfig.width || 100,
      height: nodeConfig.height || 50,
      parent: nodeConfig.parent,
      childwidth: nodeConfig.childwidth || 0,
      data: nodeConfig.data || {},
    };

    this.nodes.set(id, node);
    this.emit('node:add', node);

    // 记录历史
    const afterState = this.export();
    this.recordHistory('add', beforeState, afterState, `添加节点 ${id}`);

    return id;
  }

  /**
   * 移除节点
   */
  removeNode(id: string): void {
    if (this.nodes.has(id)) {
      const beforeState = this.export();

      this.nodes.delete(id);
      this.emit('node:remove', id);

      // 记录历史
      const afterState = this.export();
      this.recordHistory('remove', beforeState, afterState, `删除节点 ${id}`);
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
    const beforeState = this.export();
    const id = this.generateId();
    const connection: FlowyConnection = {
      id,
      from: fromId,
      to: toId,
    };

    this.connections.set(id, connection);
    this.emit('connection:add', connection);

    // 记录历史
    const afterState = this.export();
    this.recordHistory(
      'connect',
      beforeState,
      afterState,
      `连接节点 ${fromId} -> ${toId}`
    );

    return id;
  }

  /**
   * 断开连接
   */
  disconnect(connectionId: string): void {
    if (this.connections.has(connectionId)) {
      const beforeState = this.export();

      this.connections.delete(connectionId);
      this.emit('connection:remove', connectionId);

      // 记录历史
      const afterState = this.export();
      this.recordHistory(
        'disconnect',
        beforeState,
        afterState,
        `断开连接 ${connectionId}`
      );
    }
  }

  /**
   * 导出数据（现代格式）
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
   * 导入数据（现代格式）
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

  // ========== 向后兼容的 API ==========

  /**
   * 传统的 load 方法（向后兼容）
   */
  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    // 已经在构造函数中初始化了
  }

  /**
   * 传统的 output 方法（向后兼容）
   */
  output(): LegacyFlowyOutput | undefined {
    const blocks = this.dataManager.modernToLegacy(
      this.nodes,
      this.connections
    );
    return this.dataManager.exportLegacy(blocks);
  }

  /**
   * 传统的 import 方法（向后兼容）
   */
  importLegacy(data: LegacyFlowyOutput): void {
    const blocks = this.dataManager.importLegacy(data);
    const { nodes, connections } = this.dataManager.legacyToModern(blocks);

    this.nodes = nodes;
    this.connections = connections;
    this.dragManager.setBlocks(blocks);

    this.emit('data:import', {
      nodes: Array.from(nodes.values()),
      connections: Array.from(connections.values()),
    });
  }

  /**
   * 传统的 deleteBlocks 方法（向后兼容）
   */
  deleteBlocks(): void {
    this.nodes.clear();
    this.connections.clear();
    this.dragManager.clearBlocks();
    this.dataManager.clear();
  }

  /**
   * 传统的 beginDrag 方法（向后兼容）
   */
  beginDrag(_event: MouseEvent | TouchEvent): void {
    // 拖拽逻辑已经在 DragManager 中处理
    console.debug('beginDrag called (handled by DragManager)');
  }

  /**
   * 传统的 endDrag 方法（向后兼容）
   */
  endDrag(_event: MouseEvent | TouchEvent): void {
    // 拖拽逻辑已经在 DragManager 中处理
    console.debug('endDrag called (handled by DragManager)');
  }

  /**
   * 传统的 moveBlock 方法（向后兼容）
   */
  moveBlock(_event: MouseEvent | TouchEvent): void {
    // 拖拽逻辑已经在 DragManager 中处理
    console.debug('moveBlock called (handled by DragManager)');
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
   * 撤销操作
   */
  undo(): { success: boolean; description?: string } {
    const description = this.historyManager.getUndoDescription();
    const previousState = this.historyManager.undo();
    if (previousState) {
      this.import(previousState);
      this.emit('undo', previousState);
      return { success: true, description: description || undefined };
    }
    return { success: false };
  }

  /**
   * 重做操作
   */
  redo(): { success: boolean; description?: string } {
    const description = this.historyManager.getRedoDescription();
    const nextState = this.historyManager.redo();
    if (nextState) {
      this.import(nextState);
      this.emit('redo', nextState);
      return { success: true, description: description || undefined };
    }
    return { success: false };
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  /**
   * 获取撤销描述
   */
  getUndoDescription(): string | null {
    return this.historyManager.getUndoDescription();
  }

  /**
   * 获取重做描述
   */
  getRedoDescription(): string | null {
    return this.historyManager.getRedoDescription();
  }

  /**
   * 获取历史记录信息
   */
  getHistoryInfo() {
    return this.historyManager.getHistoryInfo();
  }

  /**
   * 记录操作到历史记录
   */
  private recordHistory(
    action: 'add' | 'remove' | 'move' | 'connect' | 'disconnect',
    beforeState: any,
    afterState: any,
    description: string
  ): void {
    // 在性能测试或批量操作时跳过历史记录
    if (this.isPerformanceMode) {
      return;
    }
    this.historyManager.recordAction(
      action,
      beforeState,
      afterState,
      description
    );
  }

  private isPerformanceMode: boolean = false;

  /**
   * 启用性能模式（跳过历史记录）
   */
  enablePerformanceMode(): void {
    this.isPerformanceMode = true;
  }

  /**
   * 禁用性能模式
   */
  disablePerformanceMode(): void {
    this.isPerformanceMode = false;
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
    this.dragManager.destroy();
    this.historyManager.destroy();
    this.loaded = false;
  }
}
