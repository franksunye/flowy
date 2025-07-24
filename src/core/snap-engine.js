/**
 * 吸附引擎模块 (Snap Engine)
 * 负责处理块的吸附逻辑和位置计算
 *
 * 功能范围:
 * - 吸附区域的边界计算和检测逻辑
 * - 拖拽位置与目标块的距离判断
 * - 吸附条件的实时检测和状态管理
 * - 吸附回调函数的统一处理
 *
 * 设计原则：
 * - 专注于核心算法，避免直接DOM操作
 * - 提供纯函数式的计算接口
 * - 保持与现有代码的兼容性
 */

/**
 * 吸附引擎类
 * 管理所有与吸附相关的逻辑和状态
 */
class SnapEngine {
  constructor(paddingx, paddingy, snappingCallback) {
    // 核心配置
    this.paddingx = paddingx || 20;
    this.paddingy = paddingy || 80;
    this.snappingCallback = snappingCallback || function() {};

    // 状态管理
    this.isIndicatorVisible = false;
  }

  /**
   * 计算吸附区域边界
   * @param {Object} targetBlock - 目标块对象
   * @returns {Object} 边界对象 {xMin, xMax, yMin, yMax}
   */
  calculateSnapBounds(targetBlock) {
    return {
      xMin: targetBlock.x - targetBlock.width / 2 - this.paddingx,
      xMax: targetBlock.x + targetBlock.width / 2 + this.paddingx,
      yMin: targetBlock.y - targetBlock.height / 2,
      yMax: targetBlock.y + targetBlock.height
    };
  }

  /**
   * 检查位置是否在吸附范围内
   * @param {number} xpos - 拖拽元素X位置
   * @param {number} ypos - 拖拽元素Y位置
   * @param {Object} bounds - 吸附边界
   * @returns {Object} 检测结果 {xInRange, yInRange, shouldSnap}
   */
  checkSnapRange(xpos, ypos, bounds) {
    const xInRange = xpos >= bounds.xMin && xpos <= bounds.xMax;
    const yInRange = ypos >= bounds.yMin && ypos <= bounds.yMax;
    
    return {
      xInRange,
      yInRange,
      shouldSnap: xInRange && yInRange
    };
  }

  /**
   * 计算indicator应该显示的位置
   * @param {Object} targetBlock - 目标块对象
   * @returns {Object} indicator位置信息
   */
  calculateIndicatorPosition(targetBlock) {
    if (!targetBlock) return null;

    return {
      blockId: targetBlock.id,
      left: targetBlock.width / 2 - 5,
      top: targetBlock.height,
      shouldShow: true
    };
  }

  /**
   * 设置indicator可见状态
   * @param {boolean} visible - 是否可见
   */
  setIndicatorVisible(visible) {
    this.isIndicatorVisible = visible;
  }

  /**
   * 检测拖拽位置与所有块的吸附情况
   * @param {number} xpos - 拖拽元素X位置
   * @param {number} ypos - 拖拽元素Y位置
   * @param {Array} blocks - 所有块的数组
   * @returns {Object|null} 吸附结果或null
   */
  detectSnapping(xpos, ypos, blocks) {
    if (!blocks || blocks.length === 0 || xpos == null || ypos == null) {
      this.setIndicatorVisible(false);
      return null;
    }

    // 检查每个块的吸附情况
    for (let i = 0; i < blocks.length; i++) {
      const targetBlock = blocks[i];
      const bounds = this.calculateSnapBounds(targetBlock);
      const snapResult = this.checkSnapRange(xpos, ypos, bounds);

      if (snapResult.shouldSnap) {
        // 计算indicator位置
        const indicatorPos = this.calculateIndicatorPosition(targetBlock);
        this.setIndicatorVisible(true);

        return {
          targetBlockId: targetBlock.id,
          targetBlock: targetBlock,
          dragPos: { x: xpos, y: ypos },
          bounds: bounds,
          snapResult: snapResult,
          indicatorPosition: indicatorPos
        };
      }
    }

    // 没有找到吸附目标
    this.setIndicatorVisible(false);
    return null;
  }

  /**
   * 计算吸附后的位置信息
   * @param {Object} dragBlockInfo - 拖拽块信息 {width, height}
   * @param {Object} snapInfo - 吸附信息
   * @param {Array} blocks - 块数组
   * @param {Object} canvasInfo - 画布信息 {offsetLeft, offsetTop, scrollLeft, scrollTop}
   * @returns {Object} 吸附后的位置信息
   */
  calculateSnapPosition(dragBlockInfo, snapInfo, blocks, canvasInfo) {
    if (!snapInfo || !dragBlockInfo) return null;

    const targetBlock = snapInfo.targetBlock;
    const targetBlockId = snapInfo.targetBlockId;

    // 计算子块的总宽度
    let totalwidth = 0;
    let totalremove = 0;

    const childBlocks = blocks.filter(block => block.parent === targetBlockId);

    for (let w = 0; w < childBlocks.length; w++) {
      const child = childBlocks[w];
      if (child.childwidth > child.width) {
        totalwidth += child.childwidth + this.paddingx;
      } else {
        totalwidth += child.width + this.paddingx;
      }
    }

    // 加上当前拖拽块的宽度
    totalwidth += dragBlockInfo.width;

    // 计算子块的新位置
    const childPositions = [];
    totalremove = 0;

    for (let w = 0; w < childBlocks.length; w++) {
      const child = childBlocks[w];
      let newLeft, newX;

      if (child.childwidth > child.width) {
        newLeft = targetBlock.x - totalwidth / 2 + totalremove +
                 child.childwidth / 2 - child.width / 2;
        newX = targetBlock.x - totalwidth / 2 + totalremove + child.childwidth / 2;
        totalremove += child.childwidth + this.paddingx;
      } else {
        newLeft = targetBlock.x - totalwidth / 2 + totalremove;
        newX = targetBlock.x - totalwidth / 2 + totalremove + child.width / 2;
        totalremove += child.width + this.paddingx;
      }

      childPositions.push({
        id: child.id,
        left: newLeft,
        x: newX
      });
    }

    // 计算新拖拽块的位置
    const newLeft = targetBlock.x - totalwidth / 2 + totalremove -
                   (canvasInfo?.offsetLeft || 0) + (canvasInfo?.scrollLeft || 0);
    const newTop = targetBlock.y + targetBlock.height / 2 + this.paddingy -
                  (canvasInfo?.offsetTop || 0);

    return {
      left: newLeft,
      top: newTop,
      parentId: targetBlockId,
      // 🔧 修复：避免重复添加scrollLeft，因为newLeft已经包含了滚动调整
      x: newLeft + dragBlockInfo.width / 2,
      y: newTop + dragBlockInfo.height / 2,
      childPositions: childPositions
    };
  }

  /**
   * 触发吸附回调函数
   * @param {Object} dragElement - 拖拽元素
   */
  triggerSnappingCallback(dragElement) {
    if (typeof this.snappingCallback === 'function') {
      this.snappingCallback(dragElement);
    }
  }

  /**
   * 清理吸附状态
   */
  cleanup() {
    this.setIndicatorVisible(false);
  }

  /**
   * 获取当前吸附状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      isIndicatorVisible: this.isIndicatorVisible,
      paddingx: this.paddingx,
      paddingy: this.paddingy
    };
  }
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SnapEngine;
} else if (typeof window !== 'undefined') {
  window.SnapEngine = SnapEngine;
}
