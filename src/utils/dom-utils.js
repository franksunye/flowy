/**
 * DOM工具模块
 * 封装所有DOM操作，提供统一的DOM操作接口
 * 这是重构的第一步，提取最基础的DOM操作功能
 */

/**
 * DOM工具类
 * 提供常用的DOM操作方法，兼容jQuery风格的API
 */
class DomUtils {
    /**
     * 选择器方法，兼容jQuery的$()函数
     * @param {string|Element|jQuery} selector - 选择器
     * @returns {jQuery} jQuery对象
     */
    static $(selector) {
        // 直接使用全局的jQuery，保持完全兼容
        return window.$ ? window.$(selector) : selector;
    }

    /**
     * 创建元素
     * @param {string} tagName - 标签名
     * @param {Object} attributes - 属性对象
     * @param {string} content - 内容
     * @returns {jQuery} 创建的元素
     */
    static createElement(tagName, attributes = {}, content = '') {
        const element = document.createElement(tagName);
        
        // 设置属性
        Object.keys(attributes).forEach(key => {
            if (key === 'class') {
                element.className = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // 设置内容
        if (content) {
            element.innerHTML = content;
        }
        
        return this.$(element);
    }

    /**
     * 添加CSS类
     * @param {jQuery|Element} element - 元素
     * @param {string} className - 类名
     */
    static addClass(element, className) {
        return this.$(element).addClass(className);
    }

    /**
     * 移除CSS类
     * @param {jQuery|Element} element - 元素
     * @param {string} className - 类名
     */
    static removeClass(element, className) {
        return this.$(element).removeClass(className);
    }

    /**
     * 检查是否有CSS类
     * @param {jQuery|Element} element - 元素
     * @param {string} className - 类名
     * @returns {boolean}
     */
    static hasClass(element, className) {
        return this.$(element).hasClass(className);
    }

    /**
     * 设置CSS样式
     * @param {jQuery|Element} element - 元素
     * @param {string|Object} property - 属性名或属性对象
     * @param {string} value - 属性值
     */
    static css(element, property, value) {
        return this.$(element).css(property, value);
    }

    /**
     * 获取元素位置
     * @param {jQuery|Element} element - 元素
     * @returns {Object} {left, top}
     */
    static offset(element) {
        return this.$(element).offset();
    }

    /**
     * 获取元素内部宽度
     * @param {jQuery|Element} element - 元素
     * @returns {number}
     */
    static innerWidth(element) {
        return this.$(element).innerWidth();
    }

    /**
     * 获取元素内部高度
     * @param {jQuery|Element} element - 元素
     * @returns {number}
     */
    static innerHeight(element) {
        return this.$(element).innerHeight();
    }

    /**
     * 克隆元素
     * @param {jQuery|Element} element - 元素
     * @returns {jQuery}
     */
    static clone(element) {
        return this.$(element).clone();
    }

    /**
     * 添加内容到元素
     * @param {jQuery|Element} element - 元素
     * @param {string|Element|jQuery} content - 内容
     */
    static append(element, content) {
        return this.$(element).append(content);
    }

    /**
     * 将元素添加到目标
     * @param {jQuery|Element} element - 元素
     * @param {jQuery|Element} target - 目标
     */
    static appendTo(element, target) {
        return this.$(element).appendTo(target);
    }

    /**
     * 获取子元素
     * @param {jQuery|Element} element - 元素
     * @param {string} selector - 选择器
     * @returns {jQuery}
     */
    static children(element, selector) {
        return this.$(element).children(selector);
    }

    /**
     * 获取父元素
     * @param {jQuery|Element} element - 元素
     * @returns {jQuery}
     */
    static parent(element) {
        return this.$(element).parent();
    }

    /**
     * 查找元素
     * @param {jQuery|Element} element - 元素
     * @param {string} selector - 选择器
     * @returns {jQuery}
     */
    static find(element, selector) {
        return this.$(element).find(selector);
    }

    /**
     * 获取或设置属性
     * @param {jQuery|Element} element - 元素
     * @param {string} name - 属性名
     * @param {string} value - 属性值
     * @returns {string|jQuery}
     */
    static attr(element, name, value) {
        return this.$(element).attr(name, value);
    }

    /**
     * 获取或设置值
     * @param {jQuery|Element} element - 元素
     * @param {string} value - 值
     * @returns {string|jQuery}
     */
    static val(element, value) {
        return this.$(element).val(value);
    }

    /**
     * 遍历元素
     * @param {jQuery|Element} element - 元素
     * @param {Function} callback - 回调函数
     */
    static each(element, callback) {
        return this.$(element).each(callback);
    }

    /**
     * 移除元素
     * @param {jQuery|Element} element - 元素
     */
    static remove(element) {
        return this.$(element).remove();
    }

    /**
     * 绑定事件
     * @param {jQuery|Element} element - 元素
     * @param {string} event - 事件名
     * @param {string|Function} selector - 选择器或处理函数
     * @param {Function} handler - 处理函数
     */
    static on(element, event, selector, handler) {
        return this.$(element).on(event, selector, handler);
    }

    /**
     * 解绑事件
     * @param {jQuery|Element} element - 元素
     * @param {string} event - 事件名
     * @param {Function} handler - 处理函数
     */
    static off(element, event, handler) {
        return this.$(element).off(event, handler);
    }

    /**
     * 获取滚动位置
     * @param {jQuery|Element} element - 元素
     * @returns {number}
     */
    static scrollLeft(element) {
        return this.$(element).scrollLeft();
    }

    /**
     * 获取滚动位置
     * @param {jQuery|Element} element - 元素
     * @returns {number}
     */
    static scrollTop(element) {
        return this.$(element).scrollTop();
    }

    /**
     * 过滤元素
     * @param {Array} array - 数组
     * @param {Function} callback - 过滤函数
     * @returns {Array}
     */
    static grep(array, callback) {
        return window.$ && window.$.grep ? window.$.grep(array, callback) : array.filter(callback);
    }

    /**
     * 合并数组
     * @param {Array} first - 第一个数组
     * @param {Array} second - 第二个数组
     * @returns {Array}
     */
    static merge(first, second) {
        return window.$ && window.$.merge ? window.$.merge(first, second) : [...first, ...second];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomUtils;
} else if (typeof window !== 'undefined') {
    window.DomUtils = DomUtils;
}
