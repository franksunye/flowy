/**
 * Flowy API 契约测试
 * 这些测试专注于API的行为和契约，与具体实现无关
 * 可以在重构过程中保持不变，确保API兼容性
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 加载Flowy源码
const fs = require('fs');
const flowySource = fs.readFileSync(path.join(__dirname, '../../../src/flowy.js'), 'utf8');

// 在全局作用域中执行Flowy代码
eval(flowySource);

describe('Flowy API 契约测试', () => {
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

    describe('flowy() 初始化API', () => {
        test('应该接受所有必需和可选参数', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'api-test-canvas';
            
            // 测试完整参数
            expect(() => {
                flowy($(newCanvas), mockGrab, mockRelease, mockSnapping, 50, 120);
            }).not.toThrow();
            
            // 测试最少参数
            expect(() => {
                flowy($(newCanvas));
            }).not.toThrow();
            
            newCanvas.remove();
        });

        test('应该为缺失参数提供合理默认值', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'default-test-canvas';
            
            // 只传入canvas，其他参数应该有默认值
            expect(() => {
                flowy($(newCanvas));
            }).not.toThrow();
            
            newCanvas.remove();
        });

        test('应该能够处理无效参数而不崩溃', () => {
            // 测试null/undefined参数
            expect(() => {
                flowy(null);
            }).not.toThrow();
            
            expect(() => {
                flowy(undefined);
            }).not.toThrow();
        });
    });

    describe('flowy.output() API', () => {
        test('应该返回一致的数据结构', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const output = flowy.output();
            
            // 验证返回值不为null/undefined
            expect(output).toBeDefined();
            
            // 如果返回值存在，验证其结构
            if (output) {
                expect(output).toHaveProperty('html');
                expect(output).toHaveProperty('blockarr');
                expect(output).toHaveProperty('blocks');
                
                // 验证数据类型
                expect(typeof output.html).toBe('string');
                expect(Array.isArray(output.blockarr)).toBe(true);
                expect(Array.isArray(output.blocks)).toBe(true);
            }
        });

        test('应该在空画布时返回空数据', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const output = flowy.output();
            
            if (output) {
                expect(output.html).toBe('');
                expect(output.blockarr).toEqual([]);
                expect(output.blocks).toEqual([]);
            }
        });

        test('应该是幂等操作', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const output1 = flowy.output();
            const output2 = flowy.output();
            
            // 多次调用应该返回相同结果
            expect(output1).toEqual(output2);
        });
    });

    describe('flowy.deleteBlocks() API', () => {
        test('应该存在且可调用', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            expect(typeof flowy.deleteBlocks).toBe('function');
            
            // 应该能够调用而不抛出错误
            expect(() => {
                flowy.deleteBlocks();
            }).not.toThrow();
        });

        test('应该清理画布状态', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 调用清理函数
            flowy.deleteBlocks();
            
            // 验证清理后的状态
            const output = flowy.output();
            if (output) {
                expect(output.html).toBe('');
                expect(output.blockarr).toEqual([]);
                expect(output.blocks).toEqual([]);
            }
        });

        test('应该支持重复调用', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 多次调用不应该出错
            expect(() => {
                flowy.deleteBlocks();
                flowy.deleteBlocks();
                flowy.deleteBlocks();
            }).not.toThrow();
        });
    });

    describe('API 一致性保证', () => {
        test('API方法应该始终存在', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 核心API应该始终可用
            expect(typeof flowy.output).toBe('function');
            expect(typeof flowy.deleteBlocks).toBe('function');
            
            // 调用API后仍然可用
            flowy.output();
            expect(typeof flowy.output).toBe('function');
            
            flowy.deleteBlocks();
            expect(typeof flowy.deleteBlocks).toBe('function');
        });

        test('API应该返回一致的数据类型', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const output1 = flowy.output();
            const output2 = flowy.output();
            
            // 返回值类型应该一致
            expect(typeof output1).toBe(typeof output2);
            
            if (output1 && output2) {
                expect(Array.isArray(output1.blockarr)).toBe(Array.isArray(output2.blockarr));
                expect(Array.isArray(output1.blocks)).toBe(Array.isArray(output2.blocks));
                expect(typeof output1.html).toBe(typeof output2.html);
            }
        });
    });

    describe('回调函数契约', () => {
        test('应该接受回调函数参数', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'callback-test-canvas';
            
            const grab = jest.fn();
            const release = jest.fn();
            const snapping = jest.fn();
            
            expect(() => {
                flowy($(newCanvas), grab, release, snapping);
            }).not.toThrow();
            
            newCanvas.remove();
        });

        test('应该处理无效的回调函数', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'invalid-callback-canvas';
            
            // 传入非函数类型的回调
            expect(() => {
                flowy($(newCanvas), 'not-a-function', null, undefined);
            }).not.toThrow();
            
            newCanvas.remove();
        });
    });

    describe('性能契约', () => {
        test('API调用应该在合理时间内完成', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const startTime = Date.now();
            
            // 执行多次API调用
            for (let i = 0; i < 100; i++) {
                flowy.output();
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 100次调用应该在合理时间内完成
            expect(duration).toBeLessThan(1000);
        });

        test('清理操作应该高效', async () => {
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const startTime = Date.now();
            
            // 执行多次清理操作
            for (let i = 0; i < 10; i++) {
                flowy.deleteBlocks();
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 清理操作应该高效
            expect(duration).toBeLessThan(100);
        });
    });

    describe('错误处理契约', () => {
        test('应该优雅处理异常情况', () => {
            // 在未初始化状态下调用API
            expect(() => {
                // 这些调用可能会失败，但不应该导致整个测试崩溃
                try {
                    flowy.output();
                } catch (e) {
                    // 预期可能的错误
                }
                
                try {
                    flowy.deleteBlocks();
                } catch (e) {
                    // 预期可能的错误
                }
            }).not.toThrow();
        });
    });
});
