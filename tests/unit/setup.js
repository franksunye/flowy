/**
 * 单元测试环境设置
 * 为Flowy单元测试提供必要的DOM环境和工具函数
 */

// 模拟浏览器环境
const { JSDOM } = require('jsdom');

// 创建模拟的DOM环境
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Flowy Test Environment</title>
    <style>
        .create-flowy {
            width: 100px;
            height: 50px;
            background: #f0f0f0;
            cursor: pointer;
        }
        .block {
            position: absolute;
            width: 100px;
            height: 50px;
            background: #e0e0e0;
        }
        .dragging {
            opacity: 0.7;
            z-index: 1000;
        }
        #canvas {
            width: 800px;
            height: 600px;
            background: #fafafa;
            position: relative;
        }
    </style>
</head>
<body>
    <div class="create-flowy" data-type="1">New visitor</div>
    <div class="create-flowy" data-type="2">Action performed</div>
    <div class="create-flowy" data-type="3">Time passed</div>
    <div class="create-flowy" data-type="4">Error prompt</div>
    <div id="canvas"></div>
</body>
</html>
`, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
});

// 设置全局变量
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// 模拟jQuery (简化版本，仅包含测试需要的功能)
global.$ = function(selector) {
    if (typeof selector === 'string') {
        const elements = document.querySelectorAll(selector);
        return createJQueryLikeObject(elements);
    } else if (selector === document) {
        return createJQueryLikeObject([document]);
    } else if (selector && selector.nodeType) {
        return createJQueryLikeObject([selector]);
    }
    return createJQueryLikeObject([]);
};

function createJQueryLikeObject(elements) {
    const obj = {
        length: elements.length,
        
        // 基础选择器方法
        eq(index) {
            return createJQueryLikeObject([elements[index]]);
        },
        
        first() {
            return createJQueryLikeObject([elements[0]]);
        },
        
        last() {
            return createJQueryLikeObject([elements[elements.length - 1]]);
        },
        
        // DOM操作方法
        addClass(className) {
            elements.forEach(el => el && el.classList.add(className));
            return this;
        },
        
        removeClass(className) {
            elements.forEach(el => el && el.classList.remove(className));
            return this;
        },
        
        hasClass(className) {
            return elements.some(el => el && el.classList.contains(className));
        },
        
        css(property, value) {
            if (typeof property === 'object') {
                elements.forEach(el => {
                    if (el && el.style) {
                        Object.assign(el.style, property);
                    }
                });
            } else if (value !== undefined) {
                elements.forEach(el => {
                    if (el && el.style) {
                        el.style[property] = value;
                    }
                });
            } else {
                const el = elements[0];
                return el && el.style ? el.style[property] : '';
            }
            return this;
        },
        
        // 位置和尺寸方法
        offset() {
            const el = elements[0];
            if (!el) return { left: 0, top: 0 };
            return {
                left: el.offsetLeft || 0,
                top: el.offsetTop || 0
            };
        },
        
        // 内容操作方法
        clone() {
            const cloned = elements.map(el => el ? el.cloneNode(true) : null);
            return createJQueryLikeObject(cloned);
        },
        
        append(content) {
            elements.forEach(el => {
                if (el) {
                    if (typeof content === 'string') {
                        el.innerHTML += content;
                    } else if (content && content.nodeType) {
                        el.appendChild(content);
                    } else if (content && typeof content === 'object' && content.length) {
                        // 处理jQuery对象或NodeList
                        Array.from(content).forEach(node => {
                            if (node && node.nodeType) {
                                el.appendChild(node);
                            }
                        });
                    }
                }
            });
            return this;
        },

        // html方法 - 获取或设置元素的innerHTML
        html(content) {
            if (content === undefined) {
                return elements[0] ? elements[0].innerHTML : '';
            }

            elements.forEach(el => {
                if (el) {
                    el.innerHTML = content;
                }
            });
            return this;
        },
        
        appendTo(target) {
            const targetEl = typeof target === 'string' ? 
                document.querySelector(target) : target;
            if (targetEl) {
                elements.forEach(el => el && targetEl.appendChild(el));
            }
            return this;
        },
        
        // 事件方法
        on(event, selector, handler) {
            if (typeof selector === 'function') {
                handler = selector;
                selector = null;
            }

            elements.forEach(el => {
                if (el && el.addEventListener) {
                    if (selector) {
                        // 事件委托
                        el.addEventListener(event, function(e) {
                            // 检查事件目标或其父元素是否匹配选择器
                            let target = e.target;
                            while (target && target !== el) {
                                if (target.matches && target.matches(selector)) {
                                    handler.call(target, e);
                                    return;
                                }
                                target = target.parentElement;
                            }
                        });
                    } else {
                        el.addEventListener(event, handler);
                    }
                }
            });
            return this;
        },

        // ready方法 - 模拟jQuery的ready功能
        ready(callback) {
            if (typeof callback === 'function') {
                // 如果DOM已经加载完成，立即执行回调
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', callback);
                } else {
                    // DOM已经准备好，立即执行
                    setTimeout(callback, 0);
                }
            }
            return this;
        },
        
        // 数据方法
        children(selector) {
            const children = [];
            elements.forEach(el => {
                if (el && el.children) {
                    Array.from(el.children).forEach(child => {
                        if (!selector || child.matches(selector)) {
                            children.push(child);
                        }
                    });
                }
            });
            return createJQueryLikeObject(children);
        },
        
        val(value) {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el && 'value' in el) {
                        el.value = value;
                    }
                });
                return this;
            } else {
                const el = elements[0];
                return el && 'value' in el ? el.value : '';
            }
        },
        
        // 数组方法
        filter(callback) {
            const filtered = elements.filter(callback);
            return createJQueryLikeObject(filtered);
        },
        
        map(callback) {
            const mapped = elements.map(callback);
            return createJQueryLikeObject(mapped);
        }
    };
    
    // 添加数组索引访问
    elements.forEach((el, index) => {
        obj[index] = el;
    });
    
    return obj;
}

// 工具函数：创建测试用的画布
global.createTestCanvas = function() {
    const canvas = document.createElement('div');
    canvas.id = 'test-canvas';
    canvas.style.width = '800px';
    canvas.style.height = '600px';
    canvas.style.position = 'relative';
    canvas.style.background = '#fafafa';
    document.body.appendChild(canvas);
    return canvas;
};

// 工具函数：创建测试用的拖拽元素
global.createTestDragElement = function(type = '1', text = 'Test Block') {
    const element = document.createElement('div');
    element.className = 'create-flowy';
    element.setAttribute('data-type', type);
    element.textContent = text;
    element.style.width = '100px';
    element.style.height = '50px';
    element.style.background = '#f0f0f0';
    element.style.cursor = 'pointer';
    document.body.appendChild(element);
    return element;
};

// 工具函数：模拟鼠标事件
global.createMouseEvent = function(type, x = 0, y = 0, button = 0) {
    return new dom.window.MouseEvent(type, {
        clientX: x,
        clientY: y,
        button: button,
        which: button + 1,
        bubbles: true,
        cancelable: true
    });
};

// 工具函数：清理测试环境
global.cleanupTestEnvironment = function() {
    // 清理动态创建的元素
    const dynamicElements = document.querySelectorAll('.block, .test-element');
    dynamicElements.forEach(el => el.remove());
    
    // 重置画布
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.innerHTML = '';
    }
    
    // 清理测试画布
    const testCanvas = document.getElementById('test-canvas');
    if (testCanvas) {
        testCanvas.remove();
    }
};

// 在每个测试后自动清理
if (typeof afterEach !== 'undefined') {
    afterEach(() => {
        cleanupTestEnvironment();
    });
}

module.exports = {
    dom,
    createTestCanvas: global.createTestCanvas,
    createTestDragElement: global.createTestDragElement,
    createMouseEvent: global.createMouseEvent,
    cleanupTestEnvironment: global.cleanupTestEnvironment
};
