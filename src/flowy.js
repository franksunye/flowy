// 统一模块加载器
function getModuleLoader() {
  if (typeof window !== 'undefined' && window.moduleLoader) {
    return window.moduleLoader;
  }
  if (typeof require !== 'undefined') {
    try {
      const ModuleLoader = require('./utils/module-loader.js');
      return ModuleLoader.instance || ModuleLoader.default || new ModuleLoader();
    } catch (e) {
      // 静默失败，使用降级加载
      return null;
    }
  }
  return null;
}

// 降级加载函数 (保持兼容性)
function getBlockManagerDirect() {
  if (typeof window !== 'undefined' && window.BlockManager) return new window.BlockManager();
  if (typeof require !== 'undefined') {
    try { return new (require('./core/block-manager.js'))(); } catch (e) { return null; }
  }
  return null;
}

function getSnapEngineDirect(paddingx, paddingy, snappingCallback) {
  if (typeof window !== 'undefined' && window.SnapEngine) return new window.SnapEngine(paddingx, paddingy, snappingCallback);
  if (typeof require !== 'undefined') {
    try { return new (require('./core/snap-engine.js'))(paddingx, paddingy, snappingCallback); } catch (e) { return null; }
  }
  return null;
}

function getDomUtilsDirect() {
  if (typeof window !== 'undefined' && window.DomUtils) return window.DomUtils;
  if (typeof require !== 'undefined') {
    try { return require('./utils/dom-utils.js'); } catch (e) { return null; }
  }
  return null;
}

function getDragStateManagerDirect() {
  if (typeof window !== 'undefined' && window.DragStateManager) return new window.DragStateManager();
  if (typeof require !== 'undefined') {
    try { return new (require('./core/drag-state-manager.js'))(); } catch (e) { return null; }
  }
  return null;
}

function getPositionCalculatorDirect() {
  if (typeof window !== 'undefined' && window.PositionCalculator) return new window.PositionCalculator();
  if (typeof require !== 'undefined') {
    try { return new (require('./services/position-calculator.js'))(); } catch (e) { return null; }
  }
  return null;
}

const flowy = function (canvas, grab, release, snapping, spacing_x, spacing_y) {
  if (!grab) {
    grab = function () {};
  }
  if (!release) {
    release = function () {};
  }
  if (!snapping) {
    snapping = function () {};
  }
  if (!spacing_x) {
    spacing_x = 20;
  }
  if (!spacing_y) {
    spacing_y = 80;
  }
  $(document).ready(function () {
    // 🚀 使用统一模块加载器
    const loader = getModuleLoader();
    let blockManager, snapEngine, domUtils, dragStateManager, positionCalculator;

    if (loader) {
      // 使用统一加载器批量加载模块
      const modules = loader.preloadFlowyModules({ spacing_x, spacing_y, snapping });
      blockManager = modules.BlockManager;
      snapEngine = modules.SnapEngine;
      domUtils = modules.DomUtils;
      dragStateManager = modules.DragStateManager;
      positionCalculator = modules.PositionCalculator;
    } else {
      // 降级到直接加载 (保持兼容性)
      blockManager = getBlockManagerDirect();
      snapEngine = getSnapEngineDirect(spacing_x, spacing_y, snapping);
      domUtils = getDomUtilsDirect();
      dragStateManager = getDragStateManagerDirect();
      positionCalculator = getPositionCalculatorDirect();
    }

    // 🎯 瘦身：验证核心服务
    if (!dragStateManager) {
      throw new Error('DragStateManager service is required but not available');
    }
    if (!positionCalculator) {
      throw new Error('PositionCalculator service is required but not available');
    }
    let blocks = [];
    let blockstemp = [];

    // 🎯 瘦身：直接使用blockManager获取数据
    const existingBlocks = blockManager.getAllBlocks();
    const existingTemp = blockManager.getTempBlocks();
    if (Array.isArray(existingBlocks)) {
      blocks = existingBlocks;
    }
    if (Array.isArray(existingTemp)) {
      blockstemp = existingTemp;
    }

    // 🎯 瘦身：暴露调试变量
    window.blocks = blocks;
    window.blockstemp = blockstemp;
    window.blockManager = blockManager;
    window.dragStateManager = dragStateManager;
    window.snapEngine = snapEngine;
    window.positionCalculator = positionCalculator;
    const canvas_div = canvas;

    // 🎯 瘦身：加载提炼的服务模块（带降级处理）
    let OffsetManager = null;
    let LayoutManager = null;
    let ArrowRenderer = null;
    let EventHandler = null;
    let InitializationManager = null;

    if (loader && typeof loader.loadModule === 'function') {
      try {
        OffsetManager = loader.loadModule('OffsetManager', 'src/services/offset-manager.js');
        LayoutManager = loader.loadModule('LayoutManager', 'src/services/layout-manager.js');
        ArrowRenderer = loader.loadModule('ArrowRenderer', 'src/services/arrow-renderer.js');
        EventHandler = loader.loadModule('EventHandler', 'src/core/event-handler.js');
        InitializationManager = loader.loadModule('InitializationManager', 'src/core/initialization-manager.js');
      } catch (e) {
        console.warn('Failed to load some modules, using fallback implementations:', e.message);
      }
    }
    function syncBlockReferences() {
        blocks = blockManager.getAllBlocks();
        blockstemp = blockManager.getTempBlocks();
    }

    function getBlockCount() {
      return blockManager ? blockManager.getBlockCount() : 0;
    }
    function getNextBlockId() {
      return blockManager ? blockManager.getNextBlockId() : 0;
    }

    // 🎯 瘦身：导入DOM操作辅助函数（带降级处理）
    const updateBlockPosition = domUtils && domUtils.updateBlockPosition ?
      domUtils.updateBlockPosition :
      function(blockId, x, y) {
        const element = $('.blockid[value=' + blockId + ']').parent();
        const css = {};
        if (x !== null) css.left = x + 'px';
        if (y !== null) css.top = y + 'px';
        element.css(css);
      };

    const updateArrowPosition = domUtils && domUtils.updateArrowPosition ?
      domUtils.updateArrowPosition :
      function(blockId, x, y) {
        const element = $('.arrowid[value=' + blockId + ']').parent();
        const css = {};
        if (x !== null) css.left = x + 'px';
        if (y !== null) css.top = y + 'px';
        element.css(css);
      };

    const getBlockElement = domUtils && domUtils.getBlockElement ?
      domUtils.getBlockElement :
      function(blockId) {
        return $('.blockid[value=' + blockId + ']').parent();
      };

    const getArrowElement = domUtils && domUtils.getArrowElement ?
      domUtils.getArrowElement :
      function(blockId) {
        return $('.arrowid[value=' + blockId + ']').parent();
      };

    // 🎯 瘦身：数组查询辅助函数
    function getBlockById(id) {
      return blocks.find(b => b.id == id);
    }

    function getChildrenByParent(parentId) {
      return blocks.filter(b => b.parent == parentId);
    }

    // 🎯 瘦身：位置计算辅助函数
    function calculateChildPosition(parentBlock, child, totalwidth, totalremove) {
      const baseX = parentBlock.x - totalwidth / 2 + totalremove;
      if (child.childwidth > child.width) {
        return {
          x: baseX + child.childwidth / 2,
          displayX: baseX + child.childwidth / 2 - child.width / 2
        };
      } else {
        return {
          x: baseX + child.width / 2,
          displayX: baseX
        };
      }
    }

    // 🎯 瘦身：简化块管理函数
    function clearAllBlocks() {
      blockManager.clearAll();
      syncBlockReferences();
    }

    function addBlock(blockData) {
      blockManager.addBlock(blockData);
    }

    function mergeTempBlocks() {
      blockManager.mergeTempBlocks();
      syncBlockReferences();
    }

    function removeBlockById(blockId) {
      blockManager.removeBlocks(function (block) {
        return block.id != blockId;
      });
      syncBlockReferences();
    }
    // 🎯 瘦身：统一使用模块化状态管理
    const paddingx = spacing_x;
    const paddingy = spacing_y;

    // 🎯 瘦身：简化辅助状态管理
    let offsetleft = 0;
    let offsetleftold = 0;
    let lastevent = false;
    // 🎯 瘦身：使用InitializationManager处理API和初始化
    if (InitializationManager) {
      const initManager = new InitializationManager({
        canvas: canvas_div,
        blockManager: blockManager,
        dragStateManager: dragStateManager,
        domUtils: domUtils,
        spacing_x: spacing_x,
        spacing_y: spacing_y,
        grab: grab,
        release: release,
        snapping: snapping
      });

      const flowyAPI = initManager.initialize();
      flowy.output = flowyAPI.output;
      flowy.deleteBlocks = flowyAPI.deleteBlocks;
      flowy.import = flowyAPI.import;
      flowy.getBlockCount = flowyAPI.getBlockCount;
      flowy.getNextBlockId = flowyAPI.getNextBlockId;
    } else {
      // 降级：直接设置API函数
      flowy.output = function () {
        // 如果没有blockManager，使用全局blocks数组
        const blocksToUse = blockManager ? blockManager.getAllBlocks() : (window.blocks || []);
        if (!blocksToUse || blocksToUse.length === 0) return [];

        const json_data = [];
        for (var i = 0; i < blocksToUse.length; i++) {
          const block = blocksToUse[i];
          json_data.push({
            id: block.id || i,
            parent: block.parent || -1,
            data: block.data || [],
          });
        }
        return json_data;
      };

      flowy.deleteBlocks = function () {
        // 清理blockManager
        if (blockManager && typeof blockManager.clearAll === 'function') {
          blockManager.clearAll();
        }

        // 清理全局blocks数组
        if (window.blocks) {
          window.blocks = [];
        }

        // 清理DOM
        if (canvas_div) {
          if (typeof canvas_div.html === 'function') {
            canvas_div.html("<div class='indicator invisible'></div>");
          } else if (canvas_div.innerHTML !== undefined) {
            canvas_div.innerHTML = "<div class='indicator invisible'></div>";
          }
        }

        // 重置ID计数器
        if (window.blockid !== undefined) {
          window.blockid = 0;
        }
      };

      flowy.getBlockCount = function() {
        if (blockManager && typeof blockManager.getBlockCount === 'function') {
          return blockManager.getBlockCount();
        }
        return window.blocks ? window.blocks.length : 0;
      };

      flowy.getNextBlockId = function() {
        if (blockManager && typeof blockManager.getNextBlockId === 'function') {
          return blockManager.getNextBlockId();
        }
        return window.blockid || 0;
      };
    }

    // 🎯 瘦身：使用EventHandler处理所有事件
    if (EventHandler) {
      const eventHandler = new EventHandler({
        canvas: canvas_div,
        dragStateManager: dragStateManager,
        blockManager: blockManager,
        snapEngine: snapEngine,
        positionCalculator: positionCalculator,
        domUtils: domUtils,
        grab: grab,
        release: release,
        snapping: snapping,
        spacing_x: spacing_x,
        spacing_y: spacing_y,
        updateBlockPosition: updateBlockPosition,
        updateArrowPosition: updateArrowPosition,
        getBlockElement: getBlockElement,
        getArrowElement: getArrowElement,
        getBlockById: getBlockById,
        getChildrenByParent: getChildrenByParent,
        calculateChildPosition: calculateChildPosition,
        addBlock: addBlock,
        mergeTempBlocks: mergeTempBlocks,
        syncBlockReferences: syncBlockReferences,
        getNextBlockId: getNextBlockId,
        rearrangeMe: rearrangeMe,
        checkOffset: checkOffset
      });

      eventHandler.initializeEventListeners();
    }

    // 🎯 确保indicator元素被创建
    if (canvas_div) {
      let indicator = null;
      if (typeof canvas_div.find === 'function') {
        // jQuery对象
        indicator = canvas_div.find('.indicator');
        if (indicator.length === 0) {
          canvas_div.append("<div class='indicator invisible'></div>");
        }
      } else if (canvas_div.querySelector && typeof canvas_div.querySelector === 'function') {
        // DOM元素
        indicator = canvas_div.querySelector('.indicator');
        if (!indicator) {
          const indicatorDiv = document.createElement('div');
          indicatorDiv.className = 'indicator invisible';
          canvas_div.appendChild(indicatorDiv);
        }
      } else if (canvas_div.nodeType === 1) {
        // 原生DOM元素但没有querySelector方法（可能是旧浏览器）
        const indicators = canvas_div.getElementsByClassName('indicator');
        if (indicators.length === 0) {
          const indicatorDiv = document.createElement('div');
          indicatorDiv.className = 'indicator invisible';
          canvas_div.appendChild(indicatorDiv);
        }
      } else {
        // 其他类型的对象，尝试使用jQuery
        try {
          const $canvas = $(canvas_div);
          if ($canvas.find('.indicator').length === 0) {
            $canvas.append("<div class='indicator invisible'></div>");
          }
        } catch (e) {
          console.warn('Failed to create indicator element:', e);
        }
      }
    }

    // 🎯 瘦身：使用OffsetManager替代checkOffset和fixOffset
    let offsetManager = null;
    if (OffsetManager) {
      offsetManager = new OffsetManager({
        canvas: canvas_div,
        updateBlockPosition: updateBlockPosition,
        updateArrowPosition: updateArrowPosition,
        getBlockElement: getBlockElement,
        getBlockById: getBlockById
      });
    }

    function checkOffset() {
      if (offsetManager) {
        offsetManager.checkOffset(blocks);
        const state = offsetManager.getOffsetState();
        offsetleft = state.offsetleft;
        offsetleftold = state.offsetleftold;
        lastevent = state.lastevent;
      }
    }

    function fixOffset() {
      if (offsetManager) {
        offsetManager.fixOffset(blocks);
        const state = offsetManager.getOffsetState();
        offsetleft = state.offsetleft;
        offsetleftold = state.offsetleftold;
        lastevent = state.lastevent;
      }
    }

    // 🎯 瘦身：使用LayoutManager替代rearrangeMe
    let layoutManager = null;
    if (LayoutManager) {
      layoutManager = new LayoutManager({
        canvas: canvas_div,
        updateBlockPosition: updateBlockPosition,
        updateArrowPosition: updateArrowPosition,
        getBlockById: getBlockById,
        getChildrenByParent: getChildrenByParent,
        calculateChildPosition: calculateChildPosition,
        spacing_x: spacing_x,
        spacing_y: spacing_y
      });
    }

    function rearrangeMe() {
      if (layoutManager) {
        layoutManager.rearrangeMe(blocks);
      }
    }
  });

  function blockGrabbed(block) {
    grab(block);
  }

  function blockReleased() {
    release();
  }

  function blockSnap(drag) {
    snapping(drag);
  }

  // 🎯 瘦身：简化状态清理函数
  function clearCanvasState() {
    $('.block').remove();
    $('.arrowblock').remove();
    $('.indicator').addClass('invisible');

    dragStateManager.reset();
    blockManager.clearAll();
    syncBlockReferences();
  }

  // 暴露清理函数到全局
  window.clearFlowyCanvas = clearCanvasState;
};

// 模块导出支持
if (typeof module !== 'undefined' && module.exports) {
  module.exports = flowy;
} else if (typeof window !== 'undefined') {
  window.flowy = flowy;
}
