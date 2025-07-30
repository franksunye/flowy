/**
 * 箭头渲染器
 * 负责处理连线和箭头的绘制逻辑
 * 这是从 flowy.js 中提炼出来的连线绘制算法
 */

class ArrowRenderer {
  constructor(options = {}) {
    this.canvas_div = options.canvas;
    this.updateArrowPosition = options.updateArrowPosition;
    this.getBlockById = options.getBlockById;
    
    // 间距参数
    this.paddingx = options.spacing_x || 20;
    this.paddingy = options.spacing_y || 80;
    
    // 样式配置
    this.strokeColor = '#C5CCD0';
    this.strokeWidth = '2px';
    this.fillColor = '#C5CCD0';
  }

  /**
   * 创建连接两个块的箭头
   * @param {Object} childBlock - 子块对象
   * @param {Object} parentBlock - 父块对象
   * @param {number} dragId - 拖拽块ID
   */
  createArrowBetweenBlocks(childBlock, parentBlock, dragId) {
    const arrowx = childBlock.x - parentBlock.x + 20;
    const arrowy = childBlock.y - childBlock.height / 2 - (parentBlock.y + parentBlock.height / 2) + this.canvas_div.scrollTop();

    // 设置箭头顶部位置
    this.updateArrowPosition(dragId, null, 
      parentBlock.y + parentBlock.height / 2 - this.canvas_div.offset().top + this.canvas_div.scrollTop());

    if (arrowx < 0) {
      this.createNegativeDirectionArrow(dragId, parentBlock, childBlock, arrowy);
    } else {
      this.createPositiveDirectionArrow(dragId, parentBlock, childBlock, arrowx, arrowy);
    }
  }

  /**
   * 创建负方向箭头（向左）
   * @param {number} dragId - 拖拽块ID
   * @param {Object} parentBlock - 父块对象
   * @param {Object} childBlock - 子块对象
   * @param {number} arrowy - 箭头Y坐标
   */
  createNegativeDirectionArrow(dragId, parentBlock, childBlock, arrowy) {
    const pathX = parentBlock.x - childBlock.x + 5;
    
    const svgContent = this.generateNegativeArrowSVG(pathX, arrowy);
    
    // 创建箭头元素
    $(`#drag-${dragId}`).after(
      `<div class="arrowblock">
        <input type="hidden" class="arrowid" value="${dragId}">
        ${svgContent}
      </div>`
    );

    // 设置箭头位置
    this.updateArrowPosition(dragId, 
      childBlock.x - 5 - this.canvas_div.offset().left + this.canvas_div.scrollLeft(), 
      null);
  }

  /**
   * 创建正方向箭头（向右）
   * @param {number} dragId - 拖拽块ID
   * @param {Object} parentBlock - 父块对象
   * @param {Object} childBlock - 子块对象
   * @param {number} arrowx - 箭头X坐标
   * @param {number} arrowy - 箭头Y坐标
   */
  createPositiveDirectionArrow(dragId, parentBlock, childBlock, arrowx, arrowy) {
    const svgContent = this.generatePositiveArrowSVG(arrowx, arrowy);
    
    // 更新现有箭头或创建新箭头
    const existingArrow = $(`.arrowid[value="${dragId}"]`).parent();
    if (existingArrow.length > 0) {
      existingArrow.html(`<input type="hidden" class="arrowid" value="${dragId}">${svgContent}`);
    } else {
      $(`#drag-${dragId}`).after(
        `<div class="arrowblock">
          <input type="hidden" class="arrowid" value="${dragId}">
          ${svgContent}
        </div>`
      );
    }

    // 设置箭头位置
    this.updateArrowPosition(dragId, 
      parentBlock.x - 20 - this.canvas_div.offset().left + this.canvas_div.scrollLeft(), 
      null);
  }

  /**
   * 生成负方向箭头的SVG内容
   * @param {number} pathX - 路径X坐标
   * @param {number} arrowy - 箭头Y坐标
   * @returns {string} SVG内容
   */
  generateNegativeArrowSVG(pathX, arrowy) {
    return `
      <svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M${pathX} 0L${pathX} ${this.paddingy / 2}L5 ${this.paddingy / 2}L5 ${arrowy}" 
              stroke="${this.strokeColor}" 
              stroke-width="${this.strokeWidth}"/>
        <path d="M0 ${arrowy - 5}H10L5 ${arrowy}L0 ${arrowy - 5}Z" 
              fill="${this.fillColor}"/>
      </svg>
    `;
  }

  /**
   * 生成正方向箭头的SVG内容
   * @param {number} arrowx - 箭头X坐标
   * @param {number} arrowy - 箭头Y坐标
   * @returns {string} SVG内容
   */
  generatePositiveArrowSVG(arrowx, arrowy) {
    return `
      <svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0L20 ${this.paddingy / 2}L${arrowx} ${this.paddingy / 2}L${arrowx} ${arrowy}" 
              stroke="${this.strokeColor}" 
              stroke-width="${this.strokeWidth}"/>
        <path d="M${arrowx - 5} ${arrowy - 5}H${arrowx + 5}L${arrowx} ${arrowy}L${arrowx - 5} ${arrowy - 5}Z" 
              fill="${this.fillColor}"/>
      </svg>
    `;
  }

  /**
   * 更新箭头位置和样式
   * @param {number} arrowId - 箭头ID
   * @param {Object} fromBlock - 起始块
   * @param {Object} toBlock - 目标块
   */
  updateArrowConnection(arrowId, fromBlock, toBlock) {
    const arrowElement = $(`.arrowid[value="${arrowId}"]`).parent();
    if (arrowElement.length === 0) return;

    const arrowx = toBlock.x - fromBlock.x + 20;
    const arrowy = toBlock.y - toBlock.height / 2 - (fromBlock.y + fromBlock.height / 2);

    // 重新计算并更新箭头
    if (arrowx < 0) {
      this.updateNegativeArrow(arrowId, fromBlock, toBlock, arrowy);
    } else {
      this.updatePositiveArrow(arrowId, fromBlock, toBlock, arrowx, arrowy);
    }
  }

  /**
   * 更新负方向箭头
   */
  updateNegativeArrow(arrowId, fromBlock, toBlock, arrowy) {
    const pathX = fromBlock.x - toBlock.x + 5;
    const svgContent = this.generateNegativeArrowSVG(pathX, arrowy);
    
    $(`.arrowid[value="${arrowId}"]`).parent().html(
      `<input type="hidden" class="arrowid" value="${arrowId}">${svgContent}`
    );
    
    this.updateArrowPosition(arrowId, 
      toBlock.x - 5 - this.canvas_div.offset().left, 
      fromBlock.y + fromBlock.height / 2 - this.canvas_div.offset().top);
  }

  /**
   * 更新正方向箭头
   */
  updatePositiveArrow(arrowId, fromBlock, toBlock, arrowx, arrowy) {
    const svgContent = this.generatePositiveArrowSVG(arrowx, arrowy);
    
    $(`.arrowid[value="${arrowId}"]`).parent().html(
      `<input type="hidden" class="arrowid" value="${arrowId}">${svgContent}`
    );
    
    this.updateArrowPosition(arrowId, 
      fromBlock.x - 20 - this.canvas_div.offset().left, 
      fromBlock.y + fromBlock.height / 2 - this.canvas_div.offset().top);
  }

  /**
   * 删除箭头
   * @param {number} arrowId - 箭头ID
   */
  removeArrow(arrowId) {
    $(`.arrowid[value="${arrowId}"]`).parent().remove();
  }

  /**
   * 获取箭头信息
   * @param {number} arrowId - 箭头ID
   * @returns {Object|null} 箭头信息
   */
  getArrowInfo(arrowId) {
    const arrowElement = $(`.arrowid[value="${arrowId}"]`).parent();
    if (arrowElement.length === 0) return null;

    return {
      id: arrowId,
      element: arrowElement,
      position: {
        left: arrowElement.offset().left,
        top: arrowElement.offset().top
      },
      size: {
        width: arrowElement.width(),
        height: arrowElement.height()
      }
    };
  }

  /**
   * 批量更新所有箭头
   * @param {Array} blocks - 块数组
   */
  updateAllArrows(blocks) {
    blocks.forEach(block => {
      if (block.parent !== -1) {
        const parentBlock = this.getBlockById(block.parent);
        if (parentBlock) {
          this.updateArrowConnection(block.id, parentBlock, block);
        }
      }
    });
  }

  /**
   * 设置箭头样式
   * @param {Object} styles - 样式配置
   */
  setArrowStyles(styles) {
    if (styles.strokeColor) this.strokeColor = styles.strokeColor;
    if (styles.strokeWidth) this.strokeWidth = styles.strokeWidth;
    if (styles.fillColor) this.fillColor = styles.fillColor;
  }

  /**
   * 获取当前箭头样式
   * @returns {Object} 样式配置
   */
  getArrowStyles() {
    return {
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      fillColor: this.fillColor
    };
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArrowRenderer;
} else if (typeof window !== 'undefined') {
  window.ArrowRenderer = ArrowRenderer;
}
