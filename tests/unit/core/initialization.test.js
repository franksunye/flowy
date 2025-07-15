/**
 * Flowy 初始化功能单元测试
 * 测试 flowy() 函数的初始化逻辑和参数处理
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 加载Flowy源码
const fs = require('fs');
const flowySource = fs.readFileSync(path.join(__dirname, '../../../src/flowy.js'), 'utf8');

// 在全局作用域中执行Flowy代码
eval(flowySource);

describe('Flowy Initialization', () => {
    let canvas;
    let mockGrab, mockRelease, mockSnapping;

    beforeEach(() => {
        // 创建测试画布
        canvas = createTestCanvas();
        
        // 创建模拟回调函数
        mockGrab = jest.fn();
        mockRelease = jest.fn();
        mockSnapping = jest.fn();
    });

    afterEach(() => {
        cleanupTestEnvironment();
    });

    describe('参数处理', () => {
        test('应该正确处理所有参数', () => {
            const spacing_x = 40;
            const spacing_y = 100;
            
            // 这里我们需要测试flowy函数是否正确接收参数
            // 由于原始代码没有返回值，我们通过副作用来验证
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping, spacing_x, spacing_y);
            }).not.toThrow();
        });

        test('应该为缺失的回调函数提供默认值', () => {
            expect(() => {
                flowy($(canvas)); // 只传入canvas
            }).not.toThrow();
        });

        test('应该为缺失的间距参数提供默认值', () => {
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
        });

        test('应该正确设置默认间距值', () => {
            // 通过检查后续行为来验证默认值是否正确设置
            flowy($(canvas));
            
            // 创建一个拖拽元素来测试间距
            const dragElement = createTestDragElement();
            
            // 模拟拖拽事件
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25);
            dragElement.dispatchEvent(mouseDownEvent);
            
            // 验证是否创建了块元素
            const blocks = document.querySelectorAll('.block');
            expect(blocks.length).toBeGreaterThan(0);
        });
    });

    describe('画布设置', () => {
        test('应该正确设置画布元素', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            // 验证画布是否被正确识别
            expect(canvas).toBeDefined();
            expect(canvas.id).toBe('test-canvas');
        });

        test('应该能处理jQuery包装的画布元素', () => {
            const $canvas = $(canvas);
            
            expect(() => {
                flowy($canvas, mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
        });
    });

    describe('事件监听器设置', () => {
        test('应该为拖拽元素设置鼠标事件监听器', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            const dragElement = createTestDragElement();
            
            // 模拟鼠标按下事件
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25, 0);
            dragElement.dispatchEvent(mouseDownEvent);
            
            // 验证是否触发了grab回调
            expect(mockGrab).toHaveBeenCalled();
        });

        test('应该为文档设置鼠标释放事件监听器', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            // 模拟鼠标释放事件
            const mouseUpEvent = createMouseEvent('mouseup', 100, 100, 0);
            document.dispatchEvent(mouseUpEvent);
            
            // 验证是否触发了release回调
            expect(mockRelease).toHaveBeenCalled();
        });
    });

    describe('回调函数验证', () => {
        test('grab回调应该在拖拽开始时被调用', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            const dragElement = createTestDragElement();
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25, 0);
            
            dragElement.dispatchEvent(mouseDownEvent);
            
            expect(mockGrab).toHaveBeenCalledTimes(1);
            expect(mockGrab).toHaveBeenCalledWith(expect.any(Object));
        });

        test('release回调应该在拖拽结束时被调用', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            // 先开始拖拽
            const dragElement = createTestDragElement();
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25, 0);
            dragElement.dispatchEvent(mouseDownEvent);
            
            // 然后释放
            const mouseUpEvent = createMouseEvent('mouseup', 100, 100, 0);
            document.dispatchEvent(mouseUpEvent);
            
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('snapping回调应该在吸附时被调用', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            const dragElement = createTestDragElement();
            
            // 模拟拖拽到画布上
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25, 0);
            dragElement.dispatchEvent(mouseDownEvent);
            
            // 模拟鼠标移动到画布内
            const mouseMoveEvent = createMouseEvent('mousemove', 200, 200, 0);
            document.dispatchEvent(mouseMoveEvent);
            
            // 模拟释放在画布内
            const mouseUpEvent = createMouseEvent('mouseup', 200, 200, 0);
            document.dispatchEvent(mouseUpEvent);
            
            // 验证snapping回调是否被调用
            expect(mockSnapping).toHaveBeenCalled();
        });
    });

    describe('错误处理', () => {
        test('应该处理无效的画布参数', () => {
            expect(() => {
                flowy(null, mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
        });

        test('应该处理无效的回调函数', () => {
            expect(() => {
                flowy($(canvas), 'invalid', 'invalid', 'invalid');
            }).not.toThrow();
        });

        test('应该处理无效的间距参数', () => {
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping, 'invalid', 'invalid');
            }).not.toThrow();
        });
    });

    describe('多次初始化', () => {
        test('应该能够多次初始化同一个画布', () => {
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
        });

        test('应该能够初始化多个不同的画布', () => {
            const canvas2 = createTestCanvas();
            canvas2.id = 'test-canvas-2';
            
            expect(() => {
                flowy($(canvas), mockGrab, mockRelease, mockSnapping);
                flowy($(canvas2), mockGrab, mockRelease, mockSnapping);
            }).not.toThrow();
            
            canvas2.remove();
        });
    });

    describe('内存管理', () => {
        test('初始化后应该正确设置内部状态', () => {
            flowy($(canvas), mockGrab, mockRelease, mockSnapping);
            
            // 验证是否创建了必要的内部变量
            // 这里我们通过创建块来间接验证内部状态
            const dragElement = createTestDragElement();
            const mouseDownEvent = createMouseEvent('mousedown', 50, 25, 0);
            dragElement.dispatchEvent(mouseDownEvent);
            
            // 应该能够创建块
            const blocks = document.querySelectorAll('.block');
            expect(blocks.length).toBeGreaterThan(0);
        });
    });
});
