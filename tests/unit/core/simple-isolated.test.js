/**
 * 简化的隔离测试 - 验证基本概念
 */

const { IsolatedFlowyTestEnvironment } = require('../isolated-test-environment');

describe('简化隔离测试', () => {
    test('单个测试应该工作', async () => {
        const testEnv = new IsolatedFlowyTestEnvironment();
        const testInstance = testEnv.createIsolatedInstance('simple-test');
        
        try {
            const canvas = testInstance.createTestCanvas();
            const callbacks = testInstance.createMockCallbacks();
            
            // 初始化 flowy
            testInstance.flowy(testInstance.$(canvas), callbacks.grab, callbacks.release, callbacks.snapping);
            
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 验证初始化成功
            expect(typeof testInstance.flowy.output).toBe('function');
            expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
        } finally {
            testInstance.cleanup();
            testEnv.cleanupAll();
        }
    });

    test('第二个独立测试应该也工作', async () => {
        const testEnv = new IsolatedFlowyTestEnvironment();
        const testInstance = testEnv.createIsolatedInstance('simple-test-2');
        
        try {
            const canvas = testInstance.createTestCanvas();
            const callbacks = testInstance.createMockCallbacks();
            
            // 初始化 flowy
            testInstance.flowy(testInstance.$(canvas), callbacks.grab, callbacks.release, callbacks.snapping);
            
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 验证初始化成功
            expect(typeof testInstance.flowy.output).toBe('function');
            expect(typeof testInstance.flowy.deleteBlocks).toBe('function');
            
            // 验证indicator被添加
            const indicators = canvas.querySelectorAll('.indicator');
            expect(indicators.length).toBeGreaterThan(0);
        } finally {
            testInstance.cleanup();
            testEnv.cleanupAll();
        }
    });

    test('第三个独立测试验证真正的隔离', async () => {
        const testEnv = new IsolatedFlowyTestEnvironment();
        const testInstance = testEnv.createIsolatedInstance('simple-test-3');
        
        try {
            const canvas = testInstance.createTestCanvas();
            
            // 只传入canvas，测试默认参数
            testInstance.flowy(testInstance.$(canvas));
            
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 验证初始化成功
            expect(typeof testInstance.flowy.output).toBe('function');
        } finally {
            testInstance.cleanup();
            testEnv.cleanupAll();
        }
    });
});
