/**
 * 模块加载器 - 用于在浏览器中加载重构的模块化代码
 * 这个文件负责按正确的顺序加载所有模块，并确保它们在全局作用域中可用
 */

(function() {
    'use strict';
    
    // 模块加载状态跟踪
    const moduleStatus = {
        'dom-utils': false,
        'block-manager': false,
        'flowy': false
    };
    
    let loadedModules = 0;
    const totalModules = Object.keys(moduleStatus).length;
    
    // 回调函数，当所有模块加载完成时调用
    let onAllModulesLoaded = null;
    
    /**
     * 动态加载脚本
     * @param {string} src - 脚本路径
     * @param {string} moduleName - 模块名称
     * @param {Function} callback - 加载完成回调
     */
    function loadScript(src, moduleName, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // 确保按顺序执行
        
        script.onload = function() {
            moduleStatus[moduleName] = true;
            loadedModules++;

            if (callback) callback();

            // 检查是否所有模块都已加载
            if (loadedModules === totalModules && onAllModulesLoaded) {
                onAllModulesLoaded();
            }
        };

        script.onerror = function() {
            // 静默处理错误
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * 按依赖顺序加载所有模块
     */
    function loadModules() {
        // 1. 首先加载 DOM 工具模块（无依赖）
        loadScript('../../src/utils/dom-utils.js', 'dom-utils', function() {

            // 2. 然后加载块管理模块（依赖 DOM 工具）
            loadScript('../../src/core/block-manager.js', 'block-manager', function() {

                // 3. 最后加载主 Flowy 模块（依赖前两个模块）
                loadScript('../../src/flowy.js', 'flowy', function() {
                    // 确保 flowy 在全局作用域中可用
                    if (typeof window.flowy === 'undefined' && typeof flowy !== 'undefined') {
                        window.flowy = flowy;
                    }
                });
            });
        });
    }
    
    /**
     * 设置所有模块加载完成的回调
     * @param {Function} callback - 回调函数
     */
    function onReady(callback) {
        if (loadedModules === totalModules) {
            // 如果已经全部加载完成，立即执行
            callback();
        } else {
            // 否则设置回调
            onAllModulesLoaded = callback;
        }
    }
    
    /**
     * 获取模块加载状态
     * @returns {Object} 加载状态对象
     */
    function getStatus() {
        return {
            loaded: loadedModules,
            total: totalModules,
            modules: { ...moduleStatus },
            isComplete: loadedModules === totalModules
        };
    }
    
    // 将加载器暴露到全局作用域
    window.FlowyModuleLoader = {
        load: loadModules,
        onReady: onReady,
        getStatus: getStatus
    };
    
    // 自动开始加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadModules);
    } else {
        loadModules();
    }
    
})();
