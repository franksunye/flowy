/**
 * 传统 API 兼容层
 * 提供与原始 flowy.js 完全兼容的 API
 */

import Flowy from '../core/flowy';
import type { FlowyConfig, LegacyFlowyOutput } from '../types';

/**
 * 传统的 flowy 函数
 * 完全兼容原始 API
 */
export function flowy(
  canvas: HTMLElement,
  grab?: (block: HTMLElement) => void,
  release?: () => void,
  snapping?: (
    drag: HTMLElement,
    first: boolean,
    parent: HTMLElement | undefined
  ) => boolean,
  rearrange?: (block: HTMLElement, parent: HTMLElement) => boolean,
  spacing_x?: number,
  spacing_y?: number
): FlowyLegacyInstance {
  // 转换参数为新的配置格式
  const config: FlowyConfig = {
    spacing: {
      x: spacing_x || 20,
      y: spacing_y || 80,
    },
    onGrab: grab || (() => {}),
    onRelease: release || (() => {}),
    onSnap: snapping || (() => true),
    onRearrange: rearrange || (() => false),
  };

  // 创建新的 Flowy 实例
  const flowyInstance = new Flowy(canvas, config);

  // 创建传统 API 包装器
  const legacyInstance: FlowyLegacyInstance = {
    load: () => flowyInstance.load(),
    import: (data: LegacyFlowyOutput) => flowyInstance.importLegacy(data),
    output: () => flowyInstance.output(),
    deleteBlocks: () => flowyInstance.deleteBlocks(),
    beginDrag: (event: MouseEvent | TouchEvent) =>
      flowyInstance.beginDrag(event),
    endDrag: (event: MouseEvent | TouchEvent) => flowyInstance.endDrag(event),
    moveBlock: (event: MouseEvent | TouchEvent) =>
      flowyInstance.moveBlock(event),
  };

  // 自动调用 load
  legacyInstance.load();

  return legacyInstance;
}

/**
 * 传统 API 实例接口
 */
export interface FlowyLegacyInstance {
  load(): void;
  import(data: LegacyFlowyOutput): void;
  output(): LegacyFlowyOutput | undefined;
  deleteBlocks(): void;
  beginDrag(event: MouseEvent | TouchEvent): void;
  endDrag(event: MouseEvent | TouchEvent): void;
  moveBlock(event: MouseEvent | TouchEvent): void;
}

/**
 * 添加浏览器兼容性 polyfills
 */
export function addPolyfills(): void {
  // Element.matches polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      (Element.prototype as any).msMatchesSelector ||
      (Element.prototype as any).webkitMatchesSelector;
  }

  // Element.closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s: string) {
      let el: Element | null = this;
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || (el.parentNode as Element);
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
}

// 自动添加 polyfills
addPolyfills();

// 默认导出传统函数
export default flowy;
