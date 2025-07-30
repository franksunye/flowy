/**
 * 初始化管理器
 * 负责处理Flowy的初始化逻辑和API接口
 * 这是从 flowy.js 中提炼出来的初始化和接口逻辑
 */

class InitializationManager {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.blockManager = options.blockManager;
    this.dragStateManager = options.dragStateManager;
    this.domUtils = options.domUtils;
    this.spacing_x = options.spacing_x || 20;
    this.spacing_y = options.spacing_y || 80;
    
    // 回调函数
    this.grab = options.grab || function() {};
    this.release = options.release || function() {};
    this.snapping = options.snapping || function() {};
    
    // 状态变量
    this.offsetleft = 0;
    this.offsetleftold = 0;
    this.lastevent = false;
  }

  /**
   * 初始化Flowy实例
   */
  initialize() {
    this.setupCanvas();
    this.setupAPIFunctions();
    return this.createFlowyAPI();
  }

  /**
   * 设置画布
   */
  setupCanvas() {
    if (this.canvas && typeof this.canvas.append === 'function') {
      this.canvas.append("<div class='indicator invisible'></div>");
    }
  }

  /**
   * 创建Flowy API对象
   */
  createFlowyAPI() {
    const self = this;
    
    return {
      /**
       * 输出当前流程图数据
       */
      output: function() {
        return self.outputFlowData();
      },

      /**
       * 删除所有块
       */
      deleteBlocks: function() {
        return self.deleteAllBlocks();
      },

      /**
       * 导入流程图数据
       */
      import: function(data) {
        return self.importFlowData(data);
      },

      /**
       * 获取块数量
       */
      getBlockCount: function() {
        return self.blockManager ? self.blockManager.getBlockCount() : 0;
      },

      /**
       * 获取下一个块ID
       */
      getNextBlockId: function() {
        return self.blockManager ? self.blockManager.getNextBlockId() : 0;
      },

      /**
       * 获取所有块
       */
      getAllBlocks: function() {
        return self.blockManager ? self.blockManager.getAllBlocks() : [];
      },

      /**
       * 添加块
       */
      addBlock: function(blockData) {
        if (self.blockManager) {
          self.blockManager.addBlock(blockData);
        }
      },

      /**
       * 移除块
       */
      removeBlock: function(blockId) {
        if (self.blockManager) {
          self.blockManager.removeBlocks(function(block) {
            return block.id != blockId;
          });
        }
      },

      /**
       * 清空所有块
       */
      clearAllBlocks: function() {
        if (self.blockManager) {
          self.blockManager.clearAll();
        }
      }
    };
  }

  /**
   * 输出流程图数据
   */
  outputFlowData() {
    if (!this.blockManager) return undefined;

    const blocks = this.blockManager.getAllBlocks();
    if (blocks.length === 0) return undefined;

    const json_data = [];
    for (var i = 0; i < blocks.length; i++) {
      json_data.push({
        id: blocks[i].id,
        parent: blocks[i].parent,
        data: [],
      });
      
      // 提取块的输入数据
      $('.blockid[value=' + blocks[i].id + ']')
        .parent()
        .children('input')
        .each(function () {
          const json_name = $(this).attr('name');
          const json_value = $(this).val();
          json_data[i].data.push({
            name: json_name,
            value: json_value,
          });
        });
    }
    return json_data;
  }

  /**
   * 删除所有块
   */
  deleteAllBlocks() {
    if (this.blockManager) {
      this.blockManager.clearAll();
    }
    
    // 重新创建indicator元素
    this.recreateIndicator();
  }

  /**
   * 重新创建指示器元素
   */
  recreateIndicator() {
    if (this.domUtils) {
      try {
        const indicatorElement = this.domUtils.createElement('div', {
          'class': 'indicator invisible'
        });
        this.canvas.empty().append(indicatorElement);
      } catch (e) {
        this.canvas.html("<div class='indicator invisible'></div>");
      }
    } else {
      this.canvas.html("<div class='indicator invisible'></div>");
    }
  }

  /**
   * 导入流程图数据
   */
  importFlowData(data) {
    if (!this.blockManager || !Array.isArray(data)) return false;

    try {
      // 清空现有数据
      this.blockManager.clearAll();
      
      // 导入新数据
      data.forEach(item => {
        if (item.id !== undefined && item.parent !== undefined) {
          const blockData = {
            id: item.id,
            parent: item.parent,
            x: item.x || 0,
            y: item.y || 0,
            width: item.width || 100,
            height: item.height || 50,
            childwidth: item.childwidth || 0,
            data: item.data || []
          };
          this.blockManager.addBlock(blockData);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import flow data:', error);
      return false;
    }
  }

  /**
   * 验证块数据
   */
  validateBlockData(blockData) {
    return blockData && 
           typeof blockData.id !== 'undefined' && 
           typeof blockData.parent !== 'undefined';
  }

  /**
   * 获取画布信息
   */
  getCanvasInfo() {
    if (!this.canvas) return null;

    return {
      width: this.canvas.width(),
      height: this.canvas.height(),
      offset: this.canvas.offset(),
      scrollLeft: this.canvas.scrollLeft(),
      scrollTop: this.canvas.scrollTop()
    };
  }

  /**
   * 设置画布大小
   */
  setCanvasSize(width, height) {
    if (this.canvas) {
      this.canvas.css({
        width: width + 'px',
        height: height + 'px'
      });
    }
  }

  /**
   * 获取配置信息
   */
  getConfiguration() {
    return {
      spacing_x: this.spacing_x,
      spacing_y: this.spacing_y,
      canvas: this.canvas ? true : false,
      blockManager: this.blockManager ? true : false,
      dragStateManager: this.dragStateManager ? true : false
    };
  }

  /**
   * 更新配置
   */
  updateConfiguration(config) {
    if (config.spacing_x !== undefined) this.spacing_x = config.spacing_x;
    if (config.spacing_y !== undefined) this.spacing_y = config.spacing_y;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const blocks = this.blockManager ? this.blockManager.getAllBlocks() : [];
    
    return {
      totalBlocks: blocks.length,
      parentBlocks: blocks.filter(b => b.parent === -1).length,
      childBlocks: blocks.filter(b => b.parent !== -1).length,
      maxDepth: this.calculateMaxDepth(blocks),
      canvasSize: this.getCanvasInfo()
    };
  }

  /**
   * 计算最大深度
   */
  calculateMaxDepth(blocks) {
    let maxDepth = 0;
    
    const getDepth = (blockId, currentDepth = 0) => {
      const children = blocks.filter(b => b.parent === blockId);
      if (children.length === 0) {
        return currentDepth;
      }
      
      let maxChildDepth = currentDepth;
      children.forEach(child => {
        const childDepth = getDepth(child.id, currentDepth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      });
      
      return maxChildDepth;
    };
    
    const rootBlocks = blocks.filter(b => b.parent === -1);
    rootBlocks.forEach(root => {
      const depth = getDepth(root.id);
      maxDepth = Math.max(maxDepth, depth);
    });
    
    return maxDepth;
  }

  /**
   * 设置API函数
   */
  setupAPIFunctions() {
    // 这里可以设置一些全局的API函数
    // 目前主要通过返回的API对象来提供接口
  }
}

// 🔧 SLIM-002: 统一模块导出格式 - 支持ES模块和CommonJS
export default InitializationManager;

// 向后兼容：支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InitializationManager;
  module.exports.default = InitializationManager;
}
if (typeof window !== 'undefined') {
  window.InitializationManager = InitializationManager;
}
