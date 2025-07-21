/**
 * Flowy 工作流行为测试
 * 这些测试专注于用户可见的行为，与具体实现无关
 * 在重构过程中应该保持这些行为不变
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 直接 require flowy.js（现在支持模块导出）
const flowy = require('../../../src/flowy.js');

describe('Flowy 工作流行为测试', () => {
    let canvas;
    let mockGrab, mockRelease, mockSnapping;

    beforeEach(async () => {
        // 创建测试画布
        canvas = createTestCanvas();
        
        // 创建模拟回调函数
        mockGrab = jest.fn();
        mockRelease = jest.fn();
        mockSnapping = jest.fn();
        
        // 初始化Flowy
        flowy($(canvas), mockGrab, mockRelease, mockSnapping, 40, 100);
        
        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(() => {
        cleanupTestEnvironment();
    });

    describe('初始化行为', () => {
        test('初始化后应该创建必要的UI元素', async () => {
            // 等待DOM更新
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 检查是否创建了indicator元素
            const indicators = document.querySelectorAll('.indicator');
            expect(indicators.length).toBeGreaterThan(0);
        });

        test('初始化后API应该可用', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 核心API应该可用
            expect(typeof flowy.output).toBe('function');
            expect(typeof flowy.deleteBlocks).toBe('function');
        });

        test('初始状态应该是空的工作流', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));

            const output = flowy.output();

            // 初始状态应该是undefined或空数组
            if (output) {
                expect(Array.isArray(output)).toBe(true);
                expect(output.length).toBe(0);
            } else {
                expect(output).toBeUndefined();
            }
        });
    });

    describe('拖拽元素管理', () => {
        test('应该能够识别拖拽元素', () => {
            // 创建拖拽元素
            const dragElement = createTestDragElement('1', 'Test Block');
            
            // 验证元素属性
            expect(dragElement.classList.contains('create-flowy')).toBe(true);
            expect(dragElement.getAttribute('data-type')).toBe('1');
            expect(dragElement.textContent).toBe('Test Block');
        });

        test('应该支持多种类型的拖拽元素', () => {
            const types = ['1', '2', '3', '4'];
            const elements = [];
            
            types.forEach(type => {
                const element = createTestDragElement(type, `Block ${type}`);
                elements.push(element);
                
                expect(element.getAttribute('data-type')).toBe(type);
                expect(element.textContent).toBe(`Block ${type}`);
            });
        });
    });

    describe('画布交互行为', () => {
        test('画布应该有正确的尺寸和样式', () => {
            expect(canvas).toBeDefined();
            expect(canvas.style.width).toBe('800px');
            expect(canvas.style.height).toBe('600px');
            expect(canvas.style.position).toBe('relative');
        });

        test('画布应该能够容纳工作流元素', () => {
            // 画布应该是一个容器
            expect(canvas.nodeType).toBe(1); // 1 = ELEMENT_NODE
            expect(canvas.tagName.toLowerCase()).toBe('div');
        });
    });

    describe('工作流状态管理', () => {
        test('应该能够获取当前工作流状态', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));

            const output = flowy.output();

            // 输出应该是undefined或数组
            if (output) {
                expect(Array.isArray(output)).toBe(true);

                // 如果有数据，验证数组元素结构
                if (output.length > 0) {
                    expect(output[0]).toHaveProperty('id');
                    expect(output[0]).toHaveProperty('parent');
                    expect(output[0]).toHaveProperty('data');
                }
            } else {
                expect(output).toBeUndefined();
            }
        });

        test('应该能够清理工作流状态', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));

            // 清理前获取状态
            const beforeCleanup = flowy.output();

            // 执行清理
            flowy.deleteBlocks();

            // 清理后获取状态
            const afterCleanup = flowy.output();

            // 清理后应该返回undefined或空数组
            if (afterCleanup) {
                expect(Array.isArray(afterCleanup)).toBe(true);
                expect(afterCleanup.length).toBe(0);
            } else {
                expect(afterCleanup).toBeUndefined();
            }
        });
    });

    describe('间距和布局行为', () => {
        test('应该使用指定的间距参数', () => {
            // 创建使用自定义间距的实例
            const customCanvas = createTestCanvas();
            customCanvas.id = 'custom-spacing-canvas';
            
            const customSpacingX = 60;
            const customSpacingY = 120;
            
            expect(() => {
                flowy($(customCanvas), mockGrab, mockRelease, mockSnapping, customSpacingX, customSpacingY);
            }).not.toThrow();
            
            customCanvas.remove();
        });

        test('应该使用默认间距当参数未提供时', () => {
            const defaultCanvas = createTestCanvas();
            defaultCanvas.id = 'default-spacing-canvas';
            
            expect(() => {
                flowy($(defaultCanvas), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
            
            defaultCanvas.remove();
        });
    });

    describe('回调函数行为', () => {
        test('应该接受回调函数', () => {
            const callbackCanvas = createTestCanvas();
            callbackCanvas.id = 'callback-canvas';
            
            const grab = jest.fn();
            const release = jest.fn();
            const snapping = jest.fn();
            
            expect(() => {
                flowy($(callbackCanvas), grab, release, snapping);
            }).not.toThrow();
            
            callbackCanvas.remove();
        });

        test('应该在没有回调函数时正常工作', () => {
            const noCallbackCanvas = createTestCanvas();
            noCallbackCanvas.id = 'no-callback-canvas';
            
            expect(() => {
                flowy($(noCallbackCanvas));
            }).not.toThrow();
            
            noCallbackCanvas.remove();
        });
    });

    describe('多实例行为', () => {
        test('应该支持多个画布实例', () => {
            const canvas1 = createTestCanvas();
            const canvas2 = createTestCanvas();
            canvas1.id = 'multi-canvas-1';
            canvas2.id = 'multi-canvas-2';
            
            expect(() => {
                flowy($(canvas1), mockGrab, mockRelease, mockSnapping);
                flowy($(canvas2), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
            
            canvas1.remove();
            canvas2.remove();
        });

        test('应该支持重新初始化同一画布', () => {
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
        });
    });

    describe('错误恢复行为', () => {
        test('应该从无效操作中恢复', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 尝试一些可能无效的操作
            expect(() => {
                flowy.deleteBlocks();
                flowy.output();
                flowy.deleteBlocks();
            }).not.toThrow();
        });

        test('应该处理DOM变化', () => {
            // 移除和重新添加画布
            const parent = canvas.parentNode;
            parent.removeChild(canvas);
            parent.appendChild(canvas);
            
            // 应该仍然能够工作
            expect(() => {
                flowy.output();
            }).not.toThrow();
        });
    });

    describe('性能行为', () => {
        test('初始化应该快速完成', () => {
            const startTime = Date.now();
            
            const perfCanvas = createTestCanvas();
            perfCanvas.id = 'perf-canvas';
            
            flowy($(perfCanvas));
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 初始化应该在合理时间内完成
            expect(duration).toBeLessThan(100);
            
            perfCanvas.remove();
        });

        test('API调用应该高效', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const startTime = Date.now();
            
            // 执行多次API调用
            for (let i = 0; i < 50; i++) {
                flowy.output();
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // API调用应该高效
            expect(duration).toBeLessThan(500);
        });
    });
});
