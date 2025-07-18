/**
 * 隔离测试环境
 * 为每个测试用例创建完全独立的 flowy 实例，消除测试间依赖
 */

const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');

class IsolatedFlowyTestEnvironment {
    constructor() {
        this.flowySource = fs.readFileSync(path.join(__dirname, '../../src/flowy.js'), 'utf8');
        this.instances = new Map();
    }

    /**
     * 为测试创建完全隔离的 flowy 实例
     * @param {string} testId - 测试的唯一标识符
     * @returns {Object} 隔离的测试环境
     */
    createIsolatedInstance(testId) {
        // 创建独立的 DOM 环境
        const dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head><title>Isolated Test ${testId}</title></head>
            <body></body>
            </html>
        `, {
            url: "http://localhost",
            pretendToBeVisual: true,
            resources: "usable"
        });

        const window = dom.window;
        const document = window.document;

        // 创建独立的 jQuery 模拟
        const $ = this.createIsolatedJQuery(document);

        // 在独立的上下文中执行 flowy 代码
        const context = {
            window,
            document,
            $,
            console: global.console,
            setTimeout: global.setTimeout,
            clearTimeout: global.clearTimeout
        };

        // 执行 flowy 源码，获得独立的 flowy 函数
        const flowyFunction = this.executeFlowyInContext(context);

        // 创建测试工具函数
        const testUtils = this.createTestUtils(document, $);

        const instance = {
            testId,
            dom,
            window,
            document,
            $,
            flowy: flowyFunction,
            ...testUtils,
            cleanup: () => this.cleanupInstance(testId)
        };

        this.instances.set(testId, instance);
        return instance;
    }

    /**
     * 在独立上下文中执行 flowy 代码
     */
    executeFlowyInContext(context) {
        // 创建一个函数来执行 flowy 源码
        const executeCode = new Function(
            'window', 'document', '$', 'console', 'setTimeout', 'clearTimeout',
            `
            ${this.flowySource}
            return flowy;
            `
        );

        return executeCode(
            context.window,
            context.document,
            context.$,
            context.console,
            context.setTimeout,
            context.clearTimeout
        );
    }

    /**
     * 创建独立的 jQuery 模拟
     */
    createIsolatedJQuery(document) {
        const $ = function(selector) {
            if (typeof selector === 'string') {
                const elements = document.querySelectorAll(selector);
                return createJQueryLikeObject(Array.from(elements));
            } else if (selector === document) {
                return createJQueryLikeObject([document]);
            } else if (selector && selector.nodeType) {
                return createJQueryLikeObject([selector]);
            } else if (selector === null || selector === undefined) {
                return createJQueryLikeObject([]);
            }
            return createJQueryLikeObject([]);
        };

        function createJQueryLikeObject(elements) {
            const obj = {
                length: elements.length,
                
                append(content) {
                    elements.forEach(el => {
                        if (el && el.nodeType === 1) {
                            if (typeof content === 'string') {
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = content;
                                while (tempDiv.firstChild) {
                                    el.appendChild(tempDiv.firstChild);
                                }
                            } else if (content && content.nodeType) {
                                el.appendChild(content);
                            }
                        }
                    });
                    return this;
                },

                ready(callback) {
                    if (typeof callback === 'function') {
                        // 立即执行回调，因为在测试环境中 DOM 总是准备好的
                        setTimeout(callback, 0);
                    }
                    return this;
                },

                // 添加其他必要的 jQuery 方法...
                addClass(className) {
                    elements.forEach(el => el && el.classList.add(className));
                    return this;
                },

                removeClass(className) {
                    elements.forEach(el => el && el.classList.remove(className));
                    return this;
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
                    }
                    return this;
                },

                // 事件处理方法
                on(event, selector, handler) {
                    if (typeof selector === 'function') {
                        handler = selector;
                        selector = null;
                    }

                    elements.forEach(el => {
                        if (el && el.addEventListener) {
                            if (selector) {
                                // 委托事件处理
                                el.addEventListener(event, function(e) {
                                    if (e.target.matches && e.target.matches(selector)) {
                                        handler.call(e.target, e);
                                    }
                                });
                            } else {
                                el.addEventListener(event, handler);
                            }
                        }
                    });
                    return this;
                },

                off(event, handler) {
                    elements.forEach(el => {
                        if (el && el.removeEventListener) {
                            el.removeEventListener(event, handler);
                        }
                    });
                    return this;
                },

                // DOM 查询方法
                find(selector) {
                    const found = [];
                    elements.forEach(el => {
                        if (el && el.querySelectorAll) {
                            found.push(...Array.from(el.querySelectorAll(selector)));
                        }
                    });
                    return createJQueryLikeObject(found);
                },

                parent() {
                    const parents = elements.map(el => el && el.parentNode).filter(Boolean);
                    return createJQueryLikeObject(parents);
                },

                children(selector) {
                    const children = [];
                    elements.forEach(el => {
                        if (el && el.children) {
                            const childArray = Array.from(el.children);
                            if (selector) {
                                children.push(...childArray.filter(child => child.matches && child.matches(selector)));
                            } else {
                                children.push(...childArray);
                            }
                        }
                    });
                    return createJQueryLikeObject(children);
                },

                // 属性方法
                attr(name, value) {
                    if (value !== undefined) {
                        elements.forEach(el => {
                            if (el && el.setAttribute) {
                                el.setAttribute(name, value);
                            }
                        });
                        return this;
                    } else {
                        return elements[0] && elements[0].getAttribute ? elements[0].getAttribute(name) : undefined;
                    }
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
                        return elements[0] && 'value' in elements[0] ? elements[0].value : undefined;
                    }
                },

                html(content) {
                    if (content !== undefined) {
                        elements.forEach(el => {
                            if (el && el.nodeType === 1) {
                                el.innerHTML = content;
                            }
                        });
                        return this;
                    } else {
                        return elements[0] && elements[0].innerHTML !== undefined ? elements[0].innerHTML : undefined;
                    }
                },

                // 遍历方法
                each(callback) {
                    elements.forEach((el, index) => {
                        if (el) {
                            callback.call(el, index, el);
                        }
                    });
                    return this;
                },

                // DOM 操作方法
                remove() {
                    elements.forEach(el => {
                        if (el && el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    });
                    return this;
                },

                clone() {
                    const cloned = elements.map(el => el ? el.cloneNode(true) : null).filter(Boolean);
                    return createJQueryLikeObject(cloned);
                },

                appendTo(target) {
                    const targetEl = typeof target === 'string' ?
                        document.querySelector(target) :
                        (target && target[0] ? target[0] : target);
                    if (targetEl) {
                        elements.forEach(el => el && targetEl.appendChild(el));
                    }
                    return this;
                }
            };

            // 添加数组索引访问
            for (let i = 0; i < elements.length; i++) {
                obj[i] = elements[i];
            }

            return obj;
        }

        return $;
    }

    /**
     * 创建测试工具函数
     */
    createTestUtils(document, $) {
        return {
            createTestCanvas() {
                const canvas = document.createElement('div');
                canvas.id = 'test-canvas-' + Date.now();
                canvas.style.width = '800px';
                canvas.style.height = '600px';
                canvas.style.position = 'relative';
                canvas.style.background = '#fafafa';
                document.body.appendChild(canvas);
                return canvas;
            },

            createMockCallbacks() {
                return {
                    grab: jest.fn(),
                    release: jest.fn(),
                    snapping: jest.fn()
                };
            }
        };
    }

    /**
     * 清理测试实例
     */
    cleanupInstance(testId) {
        const instance = this.instances.get(testId);
        if (instance) {
            // 清理 DOM
            if (instance.dom) {
                instance.dom.window.close();
            }
            this.instances.delete(testId);
        }
    }

    /**
     * 清理所有实例
     */
    cleanupAll() {
        for (const [testId] of this.instances) {
            this.cleanupInstance(testId);
        }
    }
}

module.exports = { IsolatedFlowyTestEnvironment };
