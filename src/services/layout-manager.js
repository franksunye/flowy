/**
 * 布局管理器
 * 负责处理块的重新排列逻辑：rearrangeMe 算法
 * 这是从 flowy.js 中提炼出来的重排算法
 */

class LayoutManager {
  constructor(options = {}) {
    this.canvas_div = options.canvas;
    this.updateBlockPosition = options.updateBlockPosition;
    this.updateArrowPosition = options.updateArrowPosition;
    this.getBlockById = options.getBlockById;
    this.getChildrenByParent = options.getChildrenByParent;
    this.calculateChildPosition = options.calculateChildPosition;
    
    // 间距参数
    this.paddingx = options.spacing_x || 20;
    this.paddingy = options.spacing_y || 80;
  }

  /**
   * 重新排列所有块的位置
   * @param {Array} blocks - 块数组
   */
  rearrangeMe(blocks) {
    const result = blocks.map(a => a.parent);
    
    for (var z = 0; z < result.length; z++) {
      if (result[z] == -1) {
        z++;
      }
      
      let totalwidth = 0;
      let totalremove = 0;
      const maxheight = 0;

      // 获取当前父块的所有子块
      const currentChildren = this.getChildrenByParent(result[z]);

      // 计算子块的总宽度
      for (var w = 0; w < currentChildren.length; w++) {
        var children = currentChildren[w];

        // 计算孙子块的宽度
        const grandChildren = blocks.filter(id => id.parent == children.id);
        if (grandChildren.length == 0) {
          children.childwidth = 0;
        } else {
          let childTotalWidth = 0;
          for (let gc = 0; gc < grandChildren.length; gc++) {
            const grandChild = grandChildren[gc];
            const grandChildWidth = grandChild.childwidth > grandChild.width ? 
                                   grandChild.childwidth : grandChild.width;
            childTotalWidth += grandChildWidth;
            if (gc < grandChildren.length - 1) {
              childTotalWidth += this.paddingx;
            }
          }
          children.childwidth = childTotalWidth;
        }

        // 累加总宽度
        if (children.childwidth > children.width) {
          if (w == currentChildren.length - 1) {
            totalwidth += children.childwidth;
          } else {
            totalwidth += children.childwidth + this.paddingx;
          }
        } else {
          if (w == currentChildren.length - 1) {
            totalwidth += children.width;
          } else {
            totalwidth += children.width + this.paddingx;
          }
        }
      }

      // 更新父块的childwidth
      if (result[z] != -1) {
        const parentBlock = this.getBlockById(result[z]);
        if (parentBlock) {
          parentBlock.childwidth = totalwidth;
        }
      }
      
      // 重新排列子块位置
      this.arrangeChildren(currentChildren, result[z], totalwidth);
    }
  }

  /**
   * 排列子块位置
   * @param {Array} children - 子块数组
   * @param {number} parentId - 父块ID
   * @param {number} totalwidth - 总宽度
   */
  arrangeChildren(children, parentId, totalwidth) {
    let totalremove = 0;
    const parentBlock = this.getBlockById(parentId);
    
    for (var w = 0; w < children.length; w++) {
      var child = children[w];
      
      if (parentId != -1) {
        this.updateBlockPosition(child.id, null, parentBlock.y + this.paddingy);
        parentBlock.y = parentBlock.y + this.paddingy;
      }
      
      // 计算子块位置
      const position = this.calculateChildPosition(parentBlock, child, totalwidth, totalremove);
      this.updateBlockPosition(child.id, position.displayX - this.canvas_div.offset().left, null);
      child.x = position.x;
      totalremove += (child.childwidth > child.width ? child.childwidth : child.width) + this.paddingx;
      
      // 处理箭头
      this.updateArrowForChild(child, parentBlock);
    }
  }

  /**
   * 更新子块的箭头
   * @param {Object} child - 子块对象
   * @param {Object} parentBlock - 父块对象
   */
  updateArrowForChild(child, parentBlock) {
    const arrowhelp = this.getBlockById(child.id);
    const arrowx = arrowhelp.x - parentBlock.x + 20;
    const arrowy = arrowhelp.y - arrowhelp.height / 2 - (parentBlock.y + parentBlock.height / 2);
    
    this.updateArrowPosition(child.id, null, parentBlock.y + parentBlock.height / 2 - this.canvas_div.offset().top);
    
    if (arrowx < 0) {
      // 负方向箭头
      this.createNegativeArrow(child, parentBlock, arrowhelp, arrowy);
    } else {
      // 正方向箭头
      this.createPositiveArrow(child, parentBlock, arrowx, arrowy);
    }
  }

  /**
   * 创建负方向箭头
   */
  createNegativeArrow(child, parentBlock, arrowhelp, arrowy) {
    $('.arrowid[value=' + child.id + ']')
      .parent()
      .css('left', arrowhelp.x - 5 - this.canvas_div.offset().left + 'px');
    
    $('.arrowid[value=' + child.id + ']')
      .parent()
      .html(
        '<input type="hidden" class="arrowid" value="' +
          child.id +
          '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' +
          (parentBlock.x - arrowhelp.x + 5) +
          ' 0L' +
          (parentBlock.x - arrowhelp.x + 5) +
          ' ' +
          this.paddingy / 2 +
          'L5 ' +
          this.paddingy / 2 +
          'L5 ' +
          arrowy +
          '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' +
          (arrowy - 5) +
          'H10L5 ' +
          arrowy +
          'L0 ' +
          (arrowy - 5) +
          'Z" fill="#C5CCD0"/></svg>'
      );
  }

  /**
   * 创建正方向箭头
   */
  createPositiveArrow(child, parentBlock, arrowx, arrowy) {
    this.updateArrowPosition(child.id, parentBlock.x - 20 - this.canvas_div.offset().left, null);
    
    $('.arrowid[value=' + child.id + ']')
      .parent()
      .html(
        '<input type="hidden" class="arrowid" value="' +
          child.id +
          '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0L20 ' +
          this.paddingy / 2 +
          'L' +
          arrowx +
          ' ' +
          this.paddingy / 2 +
          'L' +
          arrowx +
          ' ' +
          arrowy +
          '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' +
          (arrowx - 5) +
          ' ' +
          (arrowy - 5) +
          'H' +
          (arrowx + 5) +
          'L' +
          arrowx +
          ' ' +
          arrowy +
          'L' +
          (arrowx - 5) +
          ' ' +
          (arrowy - 5) +
          'Z" fill="#C5CCD0"/></svg>'
      );
  }

  /**
   * 计算块的布局信息
   * @param {Array} blocks - 块数组
   * @returns {Object} 布局信息
   */
  calculateLayoutInfo(blocks) {
    const layoutInfo = {
      totalWidth: 0,
      totalHeight: 0,
      blockCount: blocks.length,
      parentCount: 0,
      childCount: 0
    };

    blocks.forEach(block => {
      if (block.parent === -1) {
        layoutInfo.parentCount++;
      } else {
        layoutInfo.childCount++;
      }
      
      layoutInfo.totalWidth = Math.max(layoutInfo.totalWidth, block.x + block.width / 2);
      layoutInfo.totalHeight = Math.max(layoutInfo.totalHeight, block.y + block.height / 2);
    });

    return layoutInfo;
  }

  /**
   * 验证布局的一致性
   * @param {Array} blocks - 块数组
   * @returns {Object} 验证结果
   */
  validateLayout(blocks) {
    const issues = [];
    
    blocks.forEach(block => {
      // 检查父子关系
      if (block.parent !== -1) {
        const parent = blocks.find(b => b.id === block.parent);
        if (!parent) {
          issues.push(`Block ${block.id} has invalid parent ${block.parent}`);
        }
      }
      
      // 检查位置合理性
      if (block.x < 0 || block.y < 0) {
        issues.push(`Block ${block.id} has negative position`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
} else if (typeof window !== 'undefined') {
  window.LayoutManager = LayoutManager;
}
