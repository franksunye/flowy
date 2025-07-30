/**
 * 统一模块加载器 - Flowy模块化架构核心工具
 * 
 * 功能:
 * - 统一浏览器和Node.js环境的模块加载逻辑
 * - 支持优雅降级和错误处理
 * - 减少重复的模块加载代码
 * 
 * 使用方式:
 * const loader = new ModuleLoader();
 * const blockManager = loader.load('BlockManager', './core/block-manager.js');
 */

class ModuleLoader {
  constructor() {
    this.cache = new Map(); // 模块缓存
    this.loadedModules = new Set(); // 已加载模块追踪
  }

  /**
   * 统一模块加载方法
   * @param {string} moduleName - 模块名称 (如 'BlockManager')
   * @param {string} modulePath - 模块路径 (如 './core/block-manager.js')
   * @param {boolean} createInstance - 是否创建实例 (默认true)
   * @param {Array} constructorArgs - 构造函数参数 (默认[])
   * @returns {Object|null} 模块实例或null
   */
  load(moduleName, modulePath, createInstance = true, constructorArgs = []) {
    // 检查缓存
    const cacheKey = `${moduleName}_${createInstance}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let ModuleClass = null;
    let moduleInstance = null;

    try {
      // 1. 尝试从全局window对象加载 (浏览器环境)
      if (typeof window !== 'undefined' && window[moduleName]) {
        ModuleClass = window[moduleName];
        this.loadedModules.add(`${moduleName}:window`);
      }
      // 2. 尝试从require加载 (Node.js环境)
      else if (typeof require !== 'undefined') {
        try {
          // 🔧 SLIM-001: 尝试多个路径解析策略
          const pathsToTry = [
            modulePath,
            modulePath.replace('./src/', './'),
            modulePath.replace('./', './src/'),
            `../${modulePath}`,
            `./${modulePath}`,
            // 添加更多Node.js环境的路径尝试
            require.resolve ? (() => {
              try { return require.resolve(modulePath); } catch { return null; }
            })() : null,
            // 尝试从项目根目录开始的绝对路径
            modulePath.startsWith('./') ? modulePath.substring(2) : modulePath,
            // 尝试相对于当前工作目录
            process.cwd ? `${process.cwd()}/${modulePath.replace('./', '')}` : null
          ].filter(Boolean);

          let loadSuccess = false;
          for (const pathToTry of pathsToTry) {
            try {
              ModuleClass = require(pathToTry);
              this.loadedModules.add(`${moduleName}:require:${pathToTry}`);
              loadSuccess = true;
              break;
            } catch (pathError) {
              // 继续尝试下一个路径
              continue;
            }
          }

          if (!loadSuccess) {
            console.warn(`ModuleLoader: Failed to require ${moduleName} from any of:`, pathsToTry);
            return null;
          }
        } catch (requireError) {
          console.warn(`ModuleLoader: Failed to require ${moduleName} from ${modulePath}:`, requireError.message);
          return null;
        }
      }
      // 3. 都不可用
      else {
        console.warn(`ModuleLoader: No loading mechanism available for ${moduleName}`);
        return null;
      }

      // 创建实例或返回类
      if (createInstance && ModuleClass) {
        if (typeof ModuleClass === 'function') {
          moduleInstance = new ModuleClass(...constructorArgs);
        } else {
          // 如果不是构造函数，直接返回
          moduleInstance = ModuleClass;
        }
      } else {
        moduleInstance = ModuleClass;
      }

      // 缓存结果
      this.cache.set(cacheKey, moduleInstance);
      return moduleInstance;

    } catch (error) {
      console.error(`ModuleLoader: Failed to load ${moduleName}:`, error);
      return null;
    }
  }

  /**
   * 加载工具类模块 (不创建实例)
   * @param {string} moduleName - 模块名称
   * @param {string} modulePath - 模块路径
   * @returns {Object|null} 工具类或null
   */
  loadUtils(moduleName, modulePath) {
    return this.load(moduleName, modulePath, false);
  }

  /**
   * 批量加载模块
   * @param {Array} modules - 模块配置数组 [{name, path, instance, args, fallback}]
   * @returns {Object} 加载结果对象
   */
  loadBatch(modules) {
    const results = {};
    const errors = [];
    const warnings = [];

    for (const config of modules) {
      const { name, path, instance = true, args = [], fallback = null } = config;
      try {
        results[name] = this.load(name, path, instance, args);
        if (!results[name]) {
          // 🔧 SLIM-003: 尝试使用降级实现
          if (fallback && typeof fallback === 'function') {
            try {
              results[name] = fallback();
              warnings.push(`${name} loaded using fallback implementation`);
            } catch (fallbackError) {
              errors.push(`Failed to load ${name} and fallback failed: ${fallbackError.message}`);
            }
          } else {
            errors.push(`Failed to load ${name} and no fallback provided`);
          }
        }
      } catch (error) {
        // 🔧 SLIM-003: 增强错误处理，尝试降级
        if (fallback && typeof fallback === 'function') {
          try {
            results[name] = fallback();
            warnings.push(`${name} loaded using fallback after error: ${error.message}`);
          } catch (fallbackError) {
            errors.push(`Error loading ${name}: ${error.message}, fallback also failed: ${fallbackError.message}`);
          }
        } else {
          errors.push(`Error loading ${name}: ${error.message}`);
        }
      }
    }

    return { results, errors, warnings };
  }

  /**
   * 检查模块是否已加载
   * @param {string} moduleName - 模块名称
   * @returns {boolean} 是否已加载
   */
  isLoaded(moduleName) {
    return Array.from(this.loadedModules).some(key => key.startsWith(moduleName));
  }

  /**
   * 获取加载统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      loadedModules: Array.from(this.loadedModules),
      cacheKeys: Array.from(this.cache.keys())
    };
  }

  /**
   * 🔧 SLIM-003: 模块健康检查
   * @param {Array} moduleNames - 要检查的模块名称数组
   * @returns {Object} 健康检查结果
   */
  healthCheck(moduleNames = ['BlockManager', 'SnapEngine', 'DomUtils', 'DragStateManager', 'PositionCalculator']) {
    const results = {
      healthy: [],
      unhealthy: [],
      missing: [],
      fallback: [],
      overall: 'unknown'
    };

    for (const moduleName of moduleNames) {
      const isLoaded = this.isLoaded(moduleName);
      const cacheKey = `${moduleName}_true`;
      const cachedInstance = this.cache.get(cacheKey);

      if (isLoaded && cachedInstance) {
        // 检查实例是否有基本方法
        if (this.validateModuleInstance(moduleName, cachedInstance)) {
          results.healthy.push(moduleName);
        } else {
          results.unhealthy.push(moduleName);
        }
      } else if (cachedInstance) {
        // 有缓存但未标记为已加载，可能是降级实现
        results.fallback.push(moduleName);
      } else {
        results.missing.push(moduleName);
      }
    }

    // 计算整体健康状态
    const totalModules = moduleNames.length;
    const healthyCount = results.healthy.length;
    const fallbackCount = results.fallback.length;

    if (healthyCount === totalModules) {
      results.overall = 'excellent';
    } else if (healthyCount + fallbackCount === totalModules) {
      results.overall = 'good';
    } else if (healthyCount + fallbackCount >= totalModules * 0.7) {
      results.overall = 'fair';
    } else {
      results.overall = 'poor';
    }

    return results;
  }

  /**
   * 验证模块实例是否有效
   * @param {string} moduleName - 模块名称
   * @param {Object} instance - 模块实例
   * @returns {boolean} 是否有效
   */
  validateModuleInstance(moduleName, instance) {
    if (!instance) return false;

    const requiredMethods = {
      'BlockManager': ['getAllBlocks', 'addBlock', 'clearAll'],
      'SnapEngine': ['detectSnapping', 'calculateSnapBounds'],
      'DragStateManager': ['get', 'set', 'isDragging'],
      'PositionCalculator': ['calculateDragPosition', 'calculateCanvasPosition'],
      'DomUtils': ['updateBlockPosition', 'getBlockElement']
    };

    const required = requiredMethods[moduleName];
    if (!required) return true; // 未知模块，假设有效

    return required.every(method => typeof instance[method] === 'function');
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.clear();
    this.loadedModules.clear();
  }

  /**
   * 预加载核心模块 (Flowy专用)
   * @param {Object} config - 配置对象 {spacing_x, spacing_y, snapping}
   * @returns {Object} 预加载的模块实例
   */
  preloadFlowyModules(config = {}) {
    const { spacing_x = 20, spacing_y = 80, snapping = () => {} } = config;

    // 🔧 SLIM-003: 增强模块加载错误处理 - 添加降级实现
    const moduleConfigs = [
      {
        name: 'BlockManager',
        path: './src/core/block-manager.js',
        fallback: () => this.createBlockManagerFallback()
      },
      {
        name: 'SnapEngine',
        path: './src/core/snap-engine.js',
        args: [spacing_x, spacing_y, snapping],
        fallback: () => this.createSnapEngineFallback(spacing_x, spacing_y, snapping)
      },
      {
        name: 'DomUtils',
        path: './src/utils/dom-utils.js',
        instance: false,
        fallback: () => this.createDomUtilsFallback()
      },
      {
        name: 'DragStateManager',
        path: './src/core/drag-state-manager.js',
        fallback: () => this.createDragStateManagerFallback()
      },
      {
        name: 'PositionCalculator',
        path: './src/services/position-calculator.js',
        fallback: () => this.createPositionCalculatorFallback()
      }
    ];

    const { results, errors, warnings } = this.loadBatch(moduleConfigs);

    // 🔧 SLIM-003: 改进错误和警告报告
    if (warnings && warnings.length > 0) {
      console.warn('ModuleLoader: Some modules using fallback implementations:', warnings);
    }

    if (errors.length > 0) {
      console.error('ModuleLoader: Critical module loading failures:', errors);
      // 提供详细的错误信息用于调试
      console.error('ModuleLoader: Failed module details:', {
        errors: errors,
        environment: typeof process !== 'undefined' ? 'node' : 'browser',
        cwd: typeof process !== 'undefined' ? process.cwd() : 'browser',
        moduleConfigs: moduleConfigs.map(config => ({ name: config.name, path: config.path }))
      });
    }

    return results;
  }

  /**
   * 🔧 SLIM-003: 降级实现方法 - 当模块加载失败时提供最小功能
   */

  /**
   * 创建BlockManager降级实现
   * @returns {Object} 最小化的BlockManager实现
   */
  createBlockManagerFallback() {
    return {
      blocks: [],
      blockstemp: [],
      getAllBlocks: function() { return this.blocks; },
      getTempBlocks: function() { return this.blockstemp; },
      setBlocks: function(blocks) { this.blocks = blocks; },
      setTempBlocks: function(blockstemp) { this.blockstemp = blockstemp; },
      addBlock: function(block) { this.blocks.push(block); },
      addTempBlock: function(block) { this.blockstemp.push(block); },
      removeBlocks: function(filterFn) { this.blocks = this.blocks.filter(filterFn); },
      clearAll: function() { this.blocks = []; this.blockstemp = []; },
      mergeTempBlocks: function() { this.blocks = [...this.blocks, ...this.blockstemp]; this.blockstemp = []; },
      getBlockCount: function() { return this.blocks.length; },
      getNextBlockId: function() { return this.blocks.length > 0 ? Math.max(...this.blocks.map(b => b.id || 0)) + 1 : 0; },
      createBlock: function(options = {}) {
        return { parent: -1, childwidth: 0, id: this.getNextBlockId(), x: 0, y: 0, width: 100, height: 50, ...options };
      },
      isValidBlock: function(block) { return block && typeof block.id === 'number'; },
      getStats: function() { return { totalBlocks: this.blocks.length, tempBlocks: this.blockstemp.length }; },
      reset: function() { this.clearAll(); }
    };
  }

  /**
   * 创建SnapEngine降级实现
   * @param {number} paddingx - X轴间距
   * @param {number} paddingy - Y轴间距
   * @param {Function} snappingCallback - 吸附回调
   * @returns {Object} 最小化的SnapEngine实现
   */
  createSnapEngineFallback(paddingx = 20, paddingy = 80, snappingCallback = () => {}) {
    return {
      paddingx: paddingx,
      paddingy: paddingy,
      snappingCallback: snappingCallback,
      isIndicatorVisible: false,
      calculateSnapBounds: function(targetBlock) {
        return {
          xMin: targetBlock.x - targetBlock.width / 2 - this.paddingx,
          xMax: targetBlock.x + targetBlock.width / 2 + this.paddingx,
          yMin: targetBlock.y - targetBlock.height / 2,
          yMax: targetBlock.y + targetBlock.height
        };
      },
      isInSnapRange: function(xpos, ypos, bounds) {
        return xpos >= bounds.xMin && xpos <= bounds.xMax && ypos >= bounds.yMin && ypos <= bounds.yMax;
      },
      detectSnapping: function(xpos, ypos, blocks) { return null; }, // 简化实现
      setIndicatorVisible: function(visible) { this.isIndicatorVisible = visible; },
      getStatus: function() { return { isIndicatorVisible: this.isIndicatorVisible, paddingx: this.paddingx, paddingy: this.paddingy }; }
    };
  }

  /**
   * 创建DragStateManager降级实现
   * @returns {Object} 最小化的DragStateManager实现
   */
  createDragStateManagerFallback() {
    const state = { dragging: false, activeDragging: false, rearranging: false };
    return {
      state: state,
      get: function(key) { return this.state[key]; },
      set: function(key, value) { this.state[key] = value; },
      setState: function(newState) { Object.assign(this.state, newState); },
      getState: function() { return { ...this.state }; },
      isDragging: function() { return this.state.dragging; },
      isActiveDragging: function() { return this.state.activeDragging; },
      isRearranging: function() { return this.state.rearranging; },
      startActiveDrag: function() { this.state.activeDragging = true; this.state.dragging = true; },
      startRearrange: function() { this.state.rearranging = true; this.state.dragging = true; },
      endDrag: function() { this.state.dragging = false; this.state.activeDragging = false; this.state.rearranging = false; },
      reset: function() { this.state = { dragging: false, activeDragging: false, rearranging: false }; },
      updateDragOffset: function() {},
      getCurrentDragElement: function() { return null; },
      getOriginalElement: function() { return null; },
      getDragOffset: function() { return { x: 0, y: 0 }; },
      getSummary: function() { return this.getState(); }
    };
  }

  /**
   * 创建PositionCalculator降级实现
   * @returns {Object} 最小化的PositionCalculator实现
   */
  createPositionCalculatorFallback() {
    return {
      calculateDragPosition: function(mouseX, mouseY, offsetX, offsetY) {
        return { x: mouseX - offsetX, y: mouseY - offsetY };
      },
      calculateRearrangeDragPosition: function(mouseX, mouseY, scrollLeft) {
        return { x: mouseX + scrollLeft, y: mouseY };
      },
      calculateCanvasPosition: function(clientX, clientY, canvasRect) {
        return { x: clientX - canvasRect.left, y: clientY - canvasRect.top };
      },
      calculateBlockCenter: function(blockRect) {
        return { x: blockRect.left + blockRect.width / 2, y: blockRect.top + blockRect.height / 2 };
      },
      calculateSnapPosition: function() { return { x: 0, y: 0 }; },
      calculateChildrenLayout: function() { return []; },
      calculateBlocksBounds: function() { return { left: 0, top: 0, right: 0, bottom: 0 }; },
      calculateOffsetCorrection: function() { return { needsCorrection: false, offset: 0 }; },
      getCacheStats: function() { return { size: 0, hits: 0, misses: 0 }; },
      clearCache: function() {}
    };
  }

  /**
   * 创建DomUtils降级实现
   * @returns {Object} 最小化的DomUtils实现
   */
  createDomUtilsFallback() {
    return {
      updateBlockPosition: function(blockId, x, y) {
        try {
          const blockInput = document.querySelector('.blockid[value="' + blockId + '"]');
          if (blockInput && blockInput.parentElement) {
            if (x !== null) blockInput.parentElement.style.left = x + 'px';
            if (y !== null) blockInput.parentElement.style.top = y + 'px';
          }
        } catch (e) { /* 静默失败 */ }
      },
      updateArrowPosition: function(blockId, x, y) {
        try {
          const arrowInput = document.querySelector('.arrowid[value="' + blockId + '"]');
          if (arrowInput && arrowInput.parentElement) {
            if (x !== null) arrowInput.parentElement.style.left = x + 'px';
            if (y !== null) arrowInput.parentElement.style.top = y + 'px';
          }
        } catch (e) { /* 静默失败 */ }
      },
      getBlockElement: function(blockId) {
        try {
          const blockInput = document.querySelector('.blockid[value="' + blockId + '"]');
          return blockInput ? blockInput.parentElement : null;
        } catch (e) { return null; }
      },
      getArrowElement: function(blockId) {
        try {
          const arrowInput = document.querySelector('.arrowid[value="' + blockId + '"]');
          return arrowInput ? arrowInput.parentElement : null;
        } catch (e) { return null; }
      }
    };
  }
}

// 创建全局单例实例
const moduleLoader = new ModuleLoader();

// 🔧 SLIM-002: 统一模块导出格式 - 支持ES模块和CommonJS
export default ModuleLoader;
export { moduleLoader };

// 向后兼容：支持CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModuleLoader;
  module.exports.instance = moduleLoader;
  module.exports.default = ModuleLoader;
  module.exports.moduleLoader = moduleLoader;
}
if (typeof window !== 'undefined') {
  window.ModuleLoader = ModuleLoader;
  window.moduleLoader = moduleLoader;
}
