import { ModernFlowData } from '../types';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: 'add' | 'remove' | 'move' | 'connect' | 'disconnect';
  data: {
    before: ModernFlowData;
    after: ModernFlowData;
  };
  description: string;
}

export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  constructor(maxSize: number = 50) {
    this.maxHistorySize = maxSize;
  }

  /**
   * 记录一个操作
   */
  public recordAction(
    action: HistoryEntry['action'],
    beforeState: ModernFlowData,
    afterState: ModernFlowData,
    description: string
  ): void {
    // 如果当前不在历史记录的末尾，删除后面的记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // 创建新的历史记录条目
    const entry: HistoryEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      action,
      data: {
        before: this.deepClone(beforeState),
        after: this.deepClone(afterState),
      },
      description,
    };

    // 添加到历史记录
    this.history.push(entry);
    this.currentIndex++;

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * 撤销操作
   */
  public undo(): ModernFlowData | null {
    if (!this.canUndo()) {
      return null;
    }

    const entry = this.history[this.currentIndex];
    if (!entry) return null;

    this.currentIndex--;

    return this.deepClone(entry.data.before);
  }

  /**
   * 重做操作
   */
  public redo(): ModernFlowData | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    const entry = this.history[this.currentIndex];
    if (!entry) return null;

    return this.deepClone(entry.data.after);
  }

  /**
   * 检查是否可以撤销
   */
  public canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 检查是否可以重做
   */
  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 获取当前历史记录信息
   */
  public getHistoryInfo(): {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
    totalEntries: number;
    currentEntry?: HistoryEntry;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      totalEntries: this.history.length,
      currentEntry:
        this.currentIndex >= 0 ? this.history[this.currentIndex] : undefined,
    };
  }

  /**
   * 获取历史记录列表
   */
  public getHistory(): HistoryEntry[] {
    return this.history.map(entry => this.deepClone(entry));
  }

  /**
   * 清空历史记录
   */
  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取撤销描述
   */
  public getUndoDescription(): string | null {
    if (!this.canUndo()) {
      return null;
    }
    return this.history[this.currentIndex]?.description || null;
  }

  /**
   * 获取重做描述
   */
  public getRedoDescription(): string | null {
    if (!this.canRedo()) {
      return null;
    }
    return this.history[this.currentIndex + 1]?.description || null;
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 深度克隆对象
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * 销毁历史管理器
   */
  public destroy(): void {
    this.clear();
  }
}
