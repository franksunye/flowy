/**
 * Flowy - AI/Agent 流程可视化引擎
 *
 * @author franksunye <franksunye@hotmail.com>
 * @license MIT
 */

// 现代 API
export { default as Flowy } from './core/flowy';
export * from './types';
export * from './utils';

// 传统 API（向后兼容）
export { flowy, type FlowyLegacyInstance } from './legacy/flowy-legacy';

// 管理器类（高级用法）
export { DragManager } from './core/drag-manager';
export { DataManager } from './core/data-manager';
export { SvgRenderer } from './renderer/svg-renderer';

// 版本信息
export const VERSION = '1.0.0';

// 默认导出现代 API
export { default } from './core/flowy';
