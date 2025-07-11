/**
 * 类型定义
 */

export interface FlowyConfig {
  spacing?: {
    x: number;
    y: number;
  };
  onGrab?: (block: HTMLElement) => void;
  onRelease?: () => void;
  onSnap?: (
    drag: HTMLElement,
    first: boolean,
    parent: HTMLElement | undefined
  ) => boolean;
  onRearrange?: (block: HTMLElement, parent: HTMLElement) => boolean;
}

export interface FlowyNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
  childwidth?: number;
  data?: Record<string, any>;
}

export interface FlowyConnection {
  id: string;
  from: string;
  to: string;
  fromPort?: string;
  toPort?: string;
}

export interface FlowyData {
  nodes: FlowyNode[];
  connections: FlowyConnection[];
  html?: string;
  blockarr?: any[]; // 向后兼容
  blocks?: any[]; // 向后兼容
}

// 现代化的流程数据格式
export interface ModernFlowData {
  nodes: FlowyNode[];
  connections: FlowyConnection[];
}

export interface FlowyEvents {
  'node:add': (node: FlowyNode) => void;
  'node:remove': (nodeId: string) => void;
  'node:update': (node: FlowyNode) => void;
  'connection:add': (connection: FlowyConnection) => void;
  'connection:remove': (connectionId: string) => void;
  'data:import': (data: FlowyData) => void;
  'data:export': (data: FlowyData) => void;
  undo: (data: ModernFlowData) => void;
  redo: (data: ModernFlowData) => void;
}

export type FlowyEventType = keyof FlowyEvents;

// 内部使用的类型
export interface DragState {
  active: boolean;
  element: HTMLElement | null;
  offsetX: number;
  offsetY: number;
  originalElement: HTMLElement | null;
  originalParent?: number; // 用于重排时记录原始父节点
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface BlockData {
  id: number;
  parent: number;
  childwidth: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// 向后兼容的接口
export interface LegacyFlowyOutput {
  html: string;
  blockarr: BlockData[];
  blocks: Array<{
    id: number;
    parent: number;
    data: Array<{ name: string; value: string }>;
    attr: Array<Record<string, string>>;
  }>;
}
