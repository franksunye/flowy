/**
 * 位置偏移管理器
 * 负责处理块的位置修正逻辑：checkOffset 和 fixOffset
 * 这是从 flowy.js 中提炼出来的位置修正算法
 */

class OffsetManager {
  constructor(options = {}) {
    this.canvas_div = options.canvas;
    this.updateBlockPosition = options.updateBlockPosition;
    this.updateArrowPosition = options.updateArrowPosition;
    this.getBlockElement = options.getBlockElement;
    this.getBlockById = options.getBlockById;
    
    // 状态变量
    this.offsetleft = 0;
    this.offsetleftold = 0;
    this.lastevent = false;
  }

  /**
   * 检查块是否超出画布左边界，如果是则进行修正
   * @param {Array} blocks - 块数组
   */
  checkOffset(blocks) {
    this.offsetleft = blocks.map(a => a.x);
    const widths = blocks.map(a => a.width);
    const mathmin = this.offsetleft.map((item, index) => {
      return item - widths[index] / 2;
    });
    this.offsetleft = Math.min.apply(Math, mathmin);
    
    if (this.offsetleft < this.canvas_div.offset().left) {
      this.lastevent = true;
      const blocko = blocks.map(a => a.id);
      
      // 修正所有块的位置
      for (var w = 0; w < blocks.length; w++) {
        const currentBlock = this.getBlockById(blocko[w]);
        this.updateBlockPosition(
          currentBlock.id, 
          currentBlock.x - currentBlock.width / 2 - this.offsetleft + 20, 
          null
        );

        // 修正箭头位置
        if (currentBlock.parent != -1) {
          const parentBlock = this.getBlockById(currentBlock.parent);
          const arrowx = currentBlock.x - parentBlock.x;
          if (arrowx < 0) {
            this.updateArrowPosition(
              blocko[w], 
              currentBlock.x - this.offsetleft + 20 - 5, 
              null
            );
          } else {
            this.updateArrowPosition(
              blocko[w], 
              parentBlock.x - 20 - this.offsetleft + 20, 
              null
            );
          }
        }
      }
      
      // 更新块的实际位置数据
      for (var w = 0; w < blocks.length; w++) {
        const blockElement = $('.blockid[value=' + blocks[w].id + ']').parent();
        if (blockElement.length > 0 && blockElement.offset()) {
          blocks[w].x = blockElement.offset().left + 
                       this.canvas_div.offset().left - 
                       blockElement.innerWidth() / 2 - 40;
        }
      }
      
      this.offsetleftold = this.offsetleft;
    }
  }

  /**
   * 修正位置偏移
   * @param {Array} blocks - 块数组
   */
  fixOffset(blocks) {
    if (this.offsetleftold < this.canvas_div.offset().left) {
      this.lastevent = false;
      const blocko = blocks.map(a => a.id);
      
      // 修正所有块的位置
      for (var w = 0; w < blocks.length; w++) {
        const currentBlock = this.getBlockById(blocko[w]);
        const blockEl = this.getBlockElement(currentBlock.id);

        this.updateBlockPosition(
          currentBlock.id, 
          currentBlock.x - currentBlock.width / 2 - this.offsetleftold - 20, 
          null
        );
        currentBlock.x = blockEl.offset().left + currentBlock.width / 2;

        // 修正箭头位置
        if (currentBlock.parent != -1) {
          const parentBlock = this.getBlockById(currentBlock.parent);
          const arrowx = currentBlock.x - parentBlock.x;
          if (arrowx < 0) {
            this.updateArrowPosition(
              blocko[w], 
              currentBlock.x - 5 - this.canvas_div.offset().left, 
              null
            );
          } else {
            this.updateArrowPosition(
              blocko[w], 
              parentBlock.x - 20 - this.canvas_div.offset().left, 
              null
            );
          }
        }
      }
      
      this.offsetleftold = 0;
    }
  }

  /**
   * 获取当前偏移状态
   */
  getOffsetState() {
    return {
      offsetleft: this.offsetleft,
      offsetleftold: this.offsetleftold,
      lastevent: this.lastevent
    };
  }

  /**
   * 重置偏移状态
   */
  resetOffsetState() {
    this.offsetleft = 0;
    this.offsetleftold = 0;
    this.lastevent = false;
  }

  /**
   * 设置偏移状态
   */
  setOffsetState(state) {
    if (state.offsetleft !== undefined) this.offsetleft = state.offsetleft;
    if (state.offsetleftold !== undefined) this.offsetleftold = state.offsetleftold;
    if (state.lastevent !== undefined) this.lastevent = state.lastevent;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OffsetManager;
} else if (typeof window !== 'undefined') {
  window.OffsetManager = OffsetManager;
}
