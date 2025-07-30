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
   * @param {Array} modules - 模块配置数组 [{name, path, instance, args}]
   * @returns {Object} 加载结果对象
   */
  loadBatch(modules) {
    const results = {};
    const errors = [];

    for (const config of modules) {
      const { name, path, instance = true, args = [] } = config;
      try {
        results[name] = this.load(name, path, instance, args);
        if (!results[name]) {
          errors.push(`Failed to load ${name}`);
        }
      } catch (error) {
        errors.push(`Error loading ${name}: ${error.message}`);
      }
    }

    return { results, errors };
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

    // 🔧 SLIM-001: 修复模块路径解析问题
    // 使用绝对路径而非相对路径，确保在不同环境下都能正确解析
    const moduleConfigs = [
      { name: 'BlockManager', path: './src/core/block-manager.js' },
      { name: 'SnapEngine', path: './src/core/snap-engine.js', args: [spacing_x, spacing_y, snapping] },
      { name: 'DomUtils', path: './src/utils/dom-utils.js', instance: false },
      { name: 'DragStateManager', path: './src/core/drag-state-manager.js' },
      { name: 'PositionCalculator', path: './src/services/position-calculator.js' }
    ];

    const { results, errors } = this.loadBatch(moduleConfigs);

    if (errors.length > 0) {
      console.warn('ModuleLoader: Some modules failed to load:', errors);
      // 🔧 SLIM-001: 提供详细的错误信息用于调试
      console.warn('ModuleLoader: Failed module details:', errors.map(err => ({
        error: err,
        cwd: typeof process !== 'undefined' ? process.cwd() : 'browser',
        moduleConfigs: moduleConfigs
      })));
    }

    return results;
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
