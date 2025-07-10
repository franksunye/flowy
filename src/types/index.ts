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
    first: HTMLElement,
    parent: HTMLElement
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
}

export interface FlowyEvents {
  'node:add': (node: FlowyNode) => void;
  'node:remove': (nodeId: string) => void;
  'node:update': (node: FlowyNode) => void;
  'connection:add': (connection: FlowyConnection) => void;
  'connection:remove': (connectionId: string) => void;
  'data:import': (data: FlowyData) => void;
  'data:export': (data: FlowyData) => void;
}

export type FlowyEventType = keyof FlowyEvents;
