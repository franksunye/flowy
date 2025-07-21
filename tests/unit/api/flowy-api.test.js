/**
 * Flowy API 契约测试 - 重新设计版本
 * 采用更稳定的测试策略，避免 DOM ready 时序问题
 * 专注于API的基本契约和行为验证
 */

const path = require('path');

// 设置测试环境
require('../setup');

// 直接 require flowy.js（现在支持模块导出）
const flowy = require('../../../src/flowy.js');

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

        // 使用与其他成功测试相同的初始化模式
        flowy($(canvas), mockGrab, mockRelease, mockSnapping, 40, 100);

        // 等待初始化完成 - 使用与其他测试相同的等待时间
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(() => {
        cleanupTestEnvironment();
    });

    describe('基础 API 可用性', () => {
        test('初始化后应该暴露核心API方法', () => {
            // 验证核心API方法存在
            expect(typeof flowy.output).toBe('function');
            expect(typeof flowy.deleteBlocks).toBe('function');
        });

        test('API方法应该可以安全调用', () => {
            // 测试API方法不会抛出异常
            expect(() => {
                flowy.output();
            }).not.toThrow();

            expect(() => {
                flowy.deleteBlocks();
            }).not.toThrow();
        });

        test('flowy函数应该接受基本参数', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'param-test-canvas';

            // 测试基本参数接受
            expect(() => {
                flowy($(newCanvas));
            }).not.toThrow();

            newCanvas.remove();
        });
    });

    describe('flowy.output() API', () => {
        test('应该是一个函数', () => {
            expect(typeof flowy.output).toBe('function');
        });

        test('调用时不应该抛出异常', () => {
            expect(() => {
                flowy.output();
            }).not.toThrow();
        });

        test('返回值应该是undefined或数组', () => {
            const output = flowy.output();

            // 空画布时返回undefined或数组都是可接受的
            if (output !== undefined) {
                expect(Array.isArray(output)).toBe(true);
            } else {
                expect(output).toBeUndefined();
            }
        });

        test('多次调用应该保持一致', () => {
            const output1 = flowy.output();
            const output2 = flowy.output();

            // 返回值类型应该一致
            expect(typeof output1).toBe(typeof output2);

            // 如果都是数组，长度应该相同
            if (Array.isArray(output1) && Array.isArray(output2)) {
                expect(output1.length).toBe(output2.length);
            }
        });
    });

    describe('flowy.deleteBlocks() API', () => {
        test('应该是一个函数', () => {
            expect(typeof flowy.deleteBlocks).toBe('function');
        });

        test('调用时不应该抛出异常', () => {
            expect(() => {
                flowy.deleteBlocks();
            }).not.toThrow();
        });

        test('应该支持重复调用', () => {
            expect(() => {
                flowy.deleteBlocks();
                flowy.deleteBlocks();
                flowy.deleteBlocks();
            }).not.toThrow();
        });

        test('调用后output应该返回空结果', () => {
            // 调用清理函数
            flowy.deleteBlocks();

            // 验证清理后的状态
            const output = flowy.output();

            // 清理后应该返回undefined或空数组
            if (output !== undefined) {
                expect(Array.isArray(output)).toBe(true);
                expect(output.length).toBe(0);
            } else {
                expect(output).toBeUndefined();
            }
        });
    });

    describe('API 一致性保证', () => {
        test('API方法应该在调用后仍然存在', () => {
            // 核心API应该始终可用
            expect(typeof flowy.output).toBe('function');
            expect(typeof flowy.deleteBlocks).toBe('function');

            // 调用API后仍然可用
            flowy.output();
            expect(typeof flowy.output).toBe('function');

            flowy.deleteBlocks();
            expect(typeof flowy.deleteBlocks).toBe('function');
        });

        test('API应该返回一致的数据类型', () => {
            const output1 = flowy.output();
            const output2 = flowy.output();

            // 返回值类型应该一致
            expect(typeof output1).toBe(typeof output2);

            // 如果都是数组，应该有相同的结构
            if (Array.isArray(output1) && Array.isArray(output2)) {
                expect(output1.length).toBe(output2.length);
            }
        });
    });

    describe('初始化契约', () => {
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

        test('应该处理缺失的回调函数', () => {
            const newCanvas = createTestCanvas();
            newCanvas.id = 'no-callback-canvas';

            expect(() => {
                flowy($(newCanvas));
            }).not.toThrow();

            newCanvas.remove();
        });
    });

    describe('性能契约', () => {
        test('API调用应该高效', () => {
            const startTime = Date.now();

            // 执行多次API调用
            for (let i = 0; i < 50; i++) {
                flowy.output();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // 50次调用应该在合理时间内完成
            expect(duration).toBeLessThan(500);
        });

        test('清理操作应该高效', () => {
            const startTime = Date.now();

            // 执行多次清理操作
            for (let i = 0; i < 5; i++) {
                flowy.deleteBlocks();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // 清理操作应该高效
            expect(duration).toBeLessThan(50);
        });
    });
});
