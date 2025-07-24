/**
 * 位置计算服务 (PositionCalculator)
 * 
 * 职责:
 * - 提供纯函数式的位置计算功能
 * - 处理拖拽位置、吸附位置、布局位置计算
 * - 坐标系转换和几何计算
 * 
 * 设计原则:
 * - 纯函数: 无副作用，相同输入产生相同输出
 * - 可测试: 每个函数都可以独立测试
 * - 高性能: 避免重复计算，提供缓存机制
 * 
 * @author Flowy Team
 * @version 1.0.0
 * @since 2025-07-24
 */

class PositionCalculator {
  constructor() {
    // 缓存机制，避免重复计算
    this.cache = new Map();
    this.cacheMaxSize = 100;
  }

  /**
   * 计算基础拖拽位置
   * @param {Object} mouseEvent - 鼠标事件信息 {clientX, clientY}
   * @param {Object} dragOffset - 拖拽偏移 {x, y}
   * @returns {Object} 拖拽位置 {left, top}
   */
  calculateDragPosition(mouseEvent, dragOffset) {
    if (!mouseEvent || !dragOffset) {
      throw new Error('calculateDragPosition: mouseEvent and dragOffset are required');
    }

    return {
      left: mouseEvent.clientX - dragOffset.x,
      top: mouseEvent.clientY - dragOffset.y
    };
  }

  /**
   * 计算重排拖拽位置 (考虑画布偏移和滚动)
   * @param {Object} mouseEvent - 鼠标事件信息 {clientX, clientY}
   * @param {Object} dragOffset - 拖拽偏移 {x, y}
   * @param {Object} canvasInfo - 画布信息 {offsetLeft, offsetTop, scrollLeft, scrollTop}
   * @returns {Object} 重排拖拽位置 {left, top}
   */
  calculateRearrangeDragPosition(mouseEvent, dragOffset, canvasInfo) {
    if (!mouseEvent || !dragOffset || !canvasInfo) {
      throw new Error('calculateRearrangeDragPosition: all parameters are required');
    }

    return {
      left: mouseEvent.clientX - dragOffset.x - canvasInfo.offsetLeft + canvasInfo.scrollLeft,
      top: mouseEvent.clientY - dragOffset.y - canvasInfo.offsetTop + canvasInfo.scrollTop
    };
  }

  /**
   * 计算画布坐标转换位置
   * @param {Object} elementPosition - 元素位置 {left, top}
   * @param {Object} canvasInfo - 画布信息 {offsetLeft, offsetTop, scrollLeft, scrollTop}
   * @returns {Object} 画布坐标 {left, top}
   */
  calculateCanvasPosition(elementPosition, canvasInfo) {
    if (!elementPosition || !canvasInfo) {
      throw new Error('calculateCanvasPosition: elementPosition and canvasInfo are required');
    }

    return {
      left: elementPosition.left - canvasInfo.offsetLeft + canvasInfo.scrollLeft,
      top: elementPosition.top - canvasInfo.offsetTop + canvasInfo.scrollTop
    };
  }

  /**
   * 计算块的中心点坐标
   * @param {Object} blockPosition - 块位置 {left, top}
   * @param {Object} blockSize - 块尺寸 {width, height}
   * @param {Object} canvasInfo - 画布信息 {scrollLeft, scrollTop}
   * @returns {Object} 中心点坐标 {x, y}
   */
  calculateBlockCenter(blockPosition, blockSize, canvasInfo) {
    if (!blockPosition || !blockSize) {
      throw new Error('calculateBlockCenter: blockPosition and blockSize are required');
    }

    const scrollLeft = canvasInfo ? canvasInfo.scrollLeft : 0;
    const scrollTop = canvasInfo ? canvasInfo.scrollTop : 0;

    return {
      x: blockPosition.left + blockSize.width / 2 + scrollLeft,
      y: blockPosition.top + blockSize.height / 2 + scrollTop
    };
  }

  /**
   * 计算吸附后的块位置
   * @param {Object} targetBlock - 目标块信息 {x, y, width, height}
   * @param {Object} dragBlock - 拖拽块信息 {width, height}
   * @param {Array} childBlocks - 子块数组
   * @param {Object} spacing - 间距配置 {x, y}
   * @param {Object} canvasInfo - 画布信息
   * @returns {Object} 吸附位置 {left, top, snapX, snapY}
   */
  calculateSnapPosition(targetBlock, dragBlock, childBlocks = [], spacing = {x: 20, y: 80}, canvasInfo = {}) {
    if (!targetBlock || !dragBlock) {
      throw new Error('calculateSnapPosition: targetBlock and dragBlock are required');
    }

    // 计算子块的总宽度
    let totalWidth = 0;
    let totalRemove = 0;

    // 为新块分配位置
    const newChildBlocks = [...childBlocks];
    
    // 计算所有子块的总宽度
    for (const child of newChildBlocks) {
      totalWidth += child.width + spacing.x;
    }
    totalWidth += dragBlock.width; // 加上新拖拽块的宽度

    // 计算新块在子块序列中的位置
    for (const child of newChildBlocks) {
      totalRemove += child.width + spacing.x;
    }

    // 计算吸附后的位置
    const snapX = targetBlock.x - totalWidth / 2 + totalRemove + dragBlock.width / 2;
    const snapY = targetBlock.y + targetBlock.height / 2 + spacing.y;

    // 转换为DOM坐标
    const left = snapX - (canvasInfo.offsetLeft || 0) + (canvasInfo.scrollLeft || 0);
    const top = snapY - (canvasInfo.offsetTop || 0) + (canvasInfo.scrollTop || 0);

    return {
      left: left,
      top: top,
      snapX: snapX,
      snapY: snapY,
      totalWidth: totalWidth,
      childIndex: newChildBlocks.length
    };
  }

  /**
   * 计算子块的水平布局位置
   * @param {Object} parentBlock - 父块信息 {x, y, width, height}
   * @param {Array} childBlocks - 子块数组
   * @param {Object} spacing - 间距配置 {x, y}
   * @returns {Array} 子块位置数组
   */
  calculateChildrenLayout(parentBlock, childBlocks, spacing = {x: 20, y: 80}) {
    if (!parentBlock || !Array.isArray(childBlocks)) {
      throw new Error('calculateChildrenLayout: parentBlock and childBlocks array are required');
    }

    if (childBlocks.length === 0) {
      return [];
    }

    // 计算总宽度
    let totalWidth = 0;
    for (const child of childBlocks) {
      totalWidth += child.width + spacing.x;
    }
    totalWidth -= spacing.x; // 移除最后一个间距

    // 计算起始位置
    const startX = parentBlock.x - totalWidth / 2;
    const childY = parentBlock.y + parentBlock.height / 2 + spacing.y;

    // 计算每个子块的位置
    const positions = [];
    let currentX = startX;

    for (const child of childBlocks) {
      positions.push({
        id: child.id,
        x: currentX + child.width / 2,
        y: childY,
        width: child.width,
        height: child.height
      });
      currentX += child.width + spacing.x;
    }

    return positions;
  }

  /**
   * 计算块的边界信息
   * @param {Array} blocks - 块数组
   * @returns {Object} 边界信息 {minX, maxX, minY, maxY, width, height}
   */
  calculateBlocksBounds(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const block of blocks) {
      const blockMinX = block.x - block.width / 2;
      const blockMaxX = block.x + block.width / 2;
      const blockMinY = block.y - block.height / 2;
      const blockMaxY = block.y + block.height / 2;

      minX = Math.min(minX, blockMinX);
      maxX = Math.max(maxX, blockMaxX);
      minY = Math.min(minY, blockMinY);
      maxY = Math.max(maxY, blockMaxY);
    }

    return {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 计算偏移修正位置
   * @param {Array} blocks - 块数组
   * @param {Object} canvasInfo - 画布信息
   * @param {number} minOffset - 最小偏移量 (默认: 20)
   * @returns {Object} 修正信息 {needsCorrection, offsetX, correctedBlocks}
   */
  calculateOffsetCorrection(blocks, canvasInfo, minOffset = 20) {
    if (!Array.isArray(blocks) || !canvasInfo) {
      throw new Error('calculateOffsetCorrection: blocks array and canvasInfo are required');
    }

    const bounds = this.calculateBlocksBounds(blocks);
    const needsCorrection = bounds.minX < canvasInfo.offsetLeft + minOffset;

    if (!needsCorrection) {
      return { needsCorrection: false, offsetX: 0, correctedBlocks: blocks };
    }

    const offsetX = canvasInfo.offsetLeft + minOffset - bounds.minX;
    const correctedBlocks = blocks.map(block => ({
      ...block,
      x: block.x + offsetX
    }));

    return {
      needsCorrection: true,
      offsetX: offsetX,
      correctedBlocks: correctedBlocks
    };
  }

  /**
   * 缓存计算结果
   * @private
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   */
  _setCache(key, value) {
    if (this.cache.size >= this.cacheMaxSize) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 获取缓存结果
   * @private
   * @param {string} key - 缓存键
   * @returns {*} 缓存值或undefined
   */
  _getCache(key) {
    return this.cache.get(key);
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计 {size, maxSize, hitRate}
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionCalculator;
} else if (typeof window !== 'undefined') {
  window.PositionCalculator = PositionCalculator;
}
