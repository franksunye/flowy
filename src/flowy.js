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
  // 🔧 SLIM-001: 修复jQuery依赖问题 - 确保jQuery可用或使用降级方案
  const initializeFlowy = function() {
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

    // 🔧 SLIM-001: 改进核心服务验证和降级处理
    if (!dragStateManager) {
      console.warn('DragStateManager service not available, using fallback implementation');
      // 创建最小化的降级实现
      dragStateManager = {
        get: () => false,
        set: () => {},
        setState: () => {},
        getState: () => ({}),
        isDragging: () => false,
        isActiveDragging: () => false,
        isRearranging: () => false,
        startActiveDrag: () => {},
        startRearrange: () => {},
        endDrag: () => {},
        reset: () => {},
        updateDragOffset: () => {},
        getCurrentDragElement: () => null,
        getOriginalElement: () => null,
        getDragOffset: () => ({ x: 0, y: 0 })
      };
    }
    if (!positionCalculator) {
      console.warn('PositionCalculator service not available, using fallback implementation');
      // 创建最小化的降级实现
      positionCalculator = {
        calculateDragPosition: (mouseX, mouseY, offsetX, offsetY) => ({ x: mouseX - offsetX, y: mouseY - offsetY }),
        calculateRearrangeDragPosition: (mouseX, mouseY, scrollLeft) => ({ x: mouseX + scrollLeft, y: mouseY }),
        calculateCanvasPosition: (clientX, clientY, canvasRect) => ({ x: clientX - canvasRect.left, y: clientY - canvasRect.top }),
        calculateBlockCenter: (blockRect) => ({ x: blockRect.left + blockRect.width / 2, y: blockRect.top + blockRect.height / 2 }),
        calculateSnapPosition: () => ({ x: 0, y: 0 }),
        calculateChildrenLayout: () => [],
        calculateBlocksBounds: () => ({ left: 0, top: 0, right: 0, bottom: 0 }),
        calculateOffsetCorrection: () => ({ needsCorrection: false, offset: 0 }),
        getCacheStats: () => ({ size: 0, hits: 0, misses: 0 }),
        clearCache: () => {}
      };
    }
    let blocks = [];
    let blockstemp = [];

    // 🔧 SLIM-001: 修复blockManager为null的问题
    if (!blockManager) {
      console.warn('BlockManager service not available, using fallback implementation');
      // 创建最小化的降级实现
      blockManager = {
        getAllBlocks: () => [],
        getTempBlocks: () => [],
        addBlock: (block) => { if (window.blocks) window.blocks.push(block); },
        removeBlocks: (filterFn) => { if (window.blocks) window.blocks = window.blocks.filter(filterFn); },
        clearAll: () => { if (window.blocks) window.blocks = []; if (window.blockstemp) window.blockstemp = []; },
        mergeTempBlocks: () => {},
        getBlockCount: () => window.blocks ? window.blocks.length : 0,
        getNextBlockId: () => window.blockid || 0
      };
    }

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

    // 🔧 SLIM-001: 修复DOM操作辅助函数的jQuery依赖问题
    const updateBlockPosition = domUtils && domUtils.updateBlockPosition ?
      domUtils.updateBlockPosition :
      function(blockId, x, y) {
        try {
          let element;
          if (typeof $ !== 'undefined') {
            element = $('.blockid[value=' + blockId + ']').parent();
            const css = {};
            if (x !== null) css.left = x + 'px';
            if (y !== null) css.top = y + 'px';
            element.css(css);
          } else {
            // 原生DOM降级实现
            const blockInput = document.querySelector('.blockid[value="' + blockId + '"]');
            if (blockInput && blockInput.parentElement) {
              element = blockInput.parentElement;
              if (x !== null) element.style.left = x + 'px';
              if (y !== null) element.style.top = y + 'px';
            }
          }
        } catch (e) {
          console.warn('updateBlockPosition failed:', e);
        }
      };

    const updateArrowPosition = domUtils && domUtils.updateArrowPosition ?
      domUtils.updateArrowPosition :
      function(blockId, x, y) {
        try {
          let element;
          if (typeof $ !== 'undefined') {
            element = $('.arrowid[value=' + blockId + ']').parent();
            const css = {};
            if (x !== null) css.left = x + 'px';
            if (y !== null) css.top = y + 'px';
            element.css(css);
          } else {
            // 原生DOM降级实现
            const arrowInput = document.querySelector('.arrowid[value="' + blockId + '"]');
            if (arrowInput && arrowInput.parentElement) {
              element = arrowInput.parentElement;
              if (x !== null) element.style.left = x + 'px';
              if (y !== null) element.style.top = y + 'px';
            }
          }
        } catch (e) {
          console.warn('updateArrowPosition failed:', e);
        }
      };

    const getBlockElement = domUtils && domUtils.getBlockElement ?
      domUtils.getBlockElement :
      function(blockId) {
        try {
          if (typeof $ !== 'undefined') {
            return $('.blockid[value=' + blockId + ']').parent();
          } else {
            // 原生DOM降级实现
            const blockInput = document.querySelector('.blockid[value="' + blockId + '"]');
            return blockInput ? blockInput.parentElement : null;
          }
        } catch (e) {
          console.warn('getBlockElement failed:', e);
          return null;
        }
      };

    const getArrowElement = domUtils && domUtils.getArrowElement ?
      domUtils.getArrowElement :
      function(blockId) {
        try {
          if (typeof $ !== 'undefined') {
            return $('.arrowid[value=' + blockId + ']').parent();
          } else {
            // 原生DOM降级实现
            const arrowInput = document.querySelector('.arrowid[value="' + blockId + '"]');
            return arrowInput ? arrowInput.parentElement : null;
          }
        } catch (e) {
          console.warn('getArrowElement failed:', e);
          return null;
        }
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
        // 🔧 SLIM-001: 修复jQuery依赖问题 - 其他类型的对象处理
        try {
          if (typeof $ !== 'undefined') {
            // jQuery可用，尝试使用jQuery
            const $canvas = $(canvas_div);
            if ($canvas.find('.indicator').length === 0) {
              $canvas.append("<div class='indicator invisible'></div>");
            }
          } else {
            // jQuery不可用，尝试原生DOM方法
            console.warn('Canvas element type not recognized and jQuery not available, skipping indicator creation');
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
  };

  // 🔧 SLIM-001: 智能初始化 - 支持jQuery和原生DOM
  if (typeof $ !== 'undefined' && $.fn && $.fn.ready) {
    // jQuery可用，使用$(document).ready
    $(document).ready(initializeFlowy);
  } else if (typeof document !== 'undefined') {
    // jQuery不可用，使用原生DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeFlowy);
    } else {
      // 文档已经加载完成
      initializeFlowy();
    }
  } else {
    // 在Node.js环境中立即执行
    initializeFlowy();
  }

  function blockGrabbed(block) {
    grab(block);
  }

  function blockReleased() {
    release();
  }

  function blockSnap(drag) {
    snapping(drag);
  }

  // 🔧 SLIM-001: 修复状态清理函数的jQuery依赖
  function clearCanvasState() {
    try {
      if (typeof $ !== 'undefined') {
        // jQuery可用
        $('.block').remove();
        $('.arrowblock').remove();
        $('.indicator').addClass('invisible');
      } else {
        // 原生DOM降级实现
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => block.remove());

        const arrows = document.querySelectorAll('.arrowblock');
        arrows.forEach(arrow => arrow.remove());

        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach(indicator => indicator.classList.add('invisible'));
      }

      if (dragStateManager && typeof dragStateManager.reset === 'function') {
        dragStateManager.reset();
      }
      if (blockManager && typeof blockManager.clearAll === 'function') {
        blockManager.clearAll();
      }
      if (typeof syncBlockReferences === 'function') {
        syncBlockReferences();
      }
    } catch (e) {
      console.warn('clearCanvasState failed:', e);
    }
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
