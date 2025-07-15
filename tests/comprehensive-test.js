const TestUtils = require('./test-utils');
const TEST_CONFIG = require('./test-config');

class ComprehensiveTest {
    constructor() {
        this.testUtils = new TestUtils();
        this.testResults = {};
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🧪 开始comprehensive测试套件');
        console.log('==========================================');

        await this.testUtils.setupBrowser();

        try {
            // 测试所有版本
            for (const [key, server] of Object.entries(TEST_CONFIG.servers)) {
                console.log(`\n🔍 测试 ${server.name}`);
                console.log(`📍 URL: http://localhost:${server.port}`);
                console.log(`📝 描述: ${server.description}`);
                
                const results = await this.testSingleVersion(server, key);
                this.testResults[key] = results;
                
                // 等待一段时间再测试下一个版本
                await this.testUtils.wait(2000);
            }

            // 生成对比报告
            this.generateComparisonReport();

        } finally {
            await this.testUtils.teardownBrowser();
        }
    }

    // 测试单个版本
    async testSingleVersion(server, versionKey) {
        const url = `http://localhost:${server.port}`;
        const results = {
            version: server.name,
            url,
            tests: {},
            summary: { passed: 0, failed: 0, total: 0 }
        };

        // 清理之前的错误
        this.testUtils.clearErrors();

        // 基础功能测试
        await this.runBasicTests(url, results);
        
        // 交互功能测试
        await this.runInteractionTests(url, results);
        
        // API功能测试
        await this.runAPITests(url, results);

        // 计算总结
        const tests = Object.values(results.tests);
        results.summary.total = tests.length;
        results.summary.passed = tests.filter(t => t.passed).length;
        results.summary.failed = tests.filter(t => !t.passed).length;
        results.summary.successRate = (results.summary.passed / results.summary.total * 100).toFixed(1);

        // 获取错误报告
        results.errors = this.testUtils.generateReport().errors;

        console.log(`📊 ${server.name} 测试完成:`);
        console.log(`   ✅ 通过: ${results.summary.passed}`);
        console.log(`   ❌ 失败: ${results.summary.failed}`);
        console.log(`   📈 成功率: ${results.summary.successRate}%`);

        return results;
    }

    // 基础功能测试
    async runBasicTests(url, results) {
        console.log('  🔧 基础功能测试...');

        // 测试1: 页面加载
        const pageLoaded = await this.testUtils.navigateToUrl(url);
        results.tests.pageLoad = { passed: pageLoaded, description: '页面加载' };

        if (!pageLoaded) return;

        // 测试2: 页面标题
        const pageInfo = await this.testUtils.getPageInfo();
        const titleCorrect = pageInfo.title === TEST_CONFIG.expectations.originalDemo.title;
        results.tests.pageTitle = { 
            passed: titleCorrect, 
            description: '页面标题',
            expected: TEST_CONFIG.expectations.originalDemo.title,
            actual: pageInfo.title
        };

        // 测试3: Canvas元素存在
        const canvasExists = await this.testUtils.elementExists('#canvas');
        results.tests.canvasExists = { passed: canvasExists, description: 'Canvas元素存在' };

        // 测试4: Create元素数量
        const createCount = await this.testUtils.getElementCount('.create-flowy');
        const createCountCorrect = createCount === TEST_CONFIG.expectations.originalDemo.createElementsCount;
        results.tests.createElementsCount = { 
            passed: createCountCorrect, 
            description: 'Create元素数量',
            expected: TEST_CONFIG.expectations.originalDemo.createElementsCount,
            actual: createCount
        };

        // 测试5: 必要的脚本加载
        const scriptsLoaded = await this.testUtils.checkFlowyAPI();
        results.tests.flowyAPI = { 
            passed: scriptsLoaded?.flowyExists || false, 
            description: 'Flowy API可用',
            details: scriptsLoaded
        };

        results.tests.jqueryAPI = { 
            passed: scriptsLoaded?.jqueryExists || false, 
            description: 'jQuery API可用',
            details: scriptsLoaded
        };
    }

    // 交互功能测试
    async runInteractionTests(url, results) {
        console.log('  🎯 交互功能测试...');

        // 测试1: 拖拽功能
        const dragSuccess = await this.testUtils.dragElement(
            '.create-flowy[data-type="1"]', 
            300, 
            200
        );
        results.tests.dragAndDrop = { passed: dragSuccess, description: '拖拽功能' };

        if (dragSuccess) {
            // 等待拖拽完成
            await this.testUtils.wait(2000);

            // 测试2: 块创建
            const blocksCreated = await this.testUtils.getElementCount('.block');
            const blockCreationSuccess = blocksCreated > 0;
            results.tests.blockCreation = { 
                passed: blockCreationSuccess, 
                description: '块创建',
                blocksCount: blocksCreated
            };

            // 测试3: 多个块创建
            if (blockCreationSuccess) {
                await this.testUtils.dragElement('.create-flowy[data-type="2"]', 500, 300);
                await this.testUtils.wait(1000);
                
                const totalBlocks = await this.testUtils.getElementCount('.block');
                const multipleBlocksSuccess = totalBlocks > 1;
                results.tests.multipleBlocks = { 
                    passed: multipleBlocksSuccess, 
                    description: '多块创建',
                    totalBlocks
                };
            }
        }
    }

    // API功能测试
    async runAPITests(url, results) {
        console.log('  🔌 API功能测试...');

        // 测试1: flowy.output()
        const outputResult = await this.testUtils.evaluateScript(() => {
            if (typeof flowy !== 'undefined' && typeof flowy.output === 'function') {
                try {
                    const output = flowy.output();
                    return {
                        success: true,
                        data: output,
                        type: typeof output,
                        isArray: Array.isArray(output)
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }
            return { success: false, error: 'flowy.output not available' };
        });

        results.tests.flowyOutput = { 
            passed: outputResult?.success || false, 
            description: 'flowy.output() API',
            details: outputResult
        };

        // 测试2: flowy.deleteBlocks()
        const deleteResult = await this.testUtils.evaluateScript(() => {
            if (typeof flowy !== 'undefined' && typeof flowy.deleteBlocks === 'function') {
                try {
                    flowy.deleteBlocks();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
            return { success: false, error: 'flowy.deleteBlocks not available' };
        });

        results.tests.flowyDeleteBlocks = { 
            passed: deleteResult?.success || false, 
            description: 'flowy.deleteBlocks() API',
            details: deleteResult
        };

        // 验证删除是否生效
        if (deleteResult?.success) {
            await this.testUtils.wait(1000);
            const remainingBlocks = await this.testUtils.getElementCount('.block');
            results.tests.blockDeletion = { 
                passed: remainingBlocks === 0, 
                description: '块删除功能',
                remainingBlocks
            };
        }
    }

    // 生成对比报告
    generateComparisonReport() {
        console.log('\n📊 版本对比分析报告');
        console.log('==========================================');

        const versions = Object.keys(this.testResults);
        const testNames = new Set();
        
        // 收集所有测试名称
        versions.forEach(version => {
            Object.keys(this.testResults[version].tests).forEach(testName => {
                testNames.add(testName);
            });
        });

        // 对比每个测试
        testNames.forEach(testName => {
            console.log(`\n🔍 ${testName}:`);
            let allPassed = true;
            
            versions.forEach(version => {
                const test = this.testResults[version].tests[testName];
                const status = test?.passed ? '✅' : '❌';
                const versionName = this.testResults[version].version;
                console.log(`  ${status} ${versionName}: ${test?.description || 'N/A'}`);
                
                if (!test?.passed) allPassed = false;
            });
            
            if (allPassed) {
                console.log(`  🎯 结论: 所有版本一致 ✅`);
            } else {
                console.log(`  ⚠️  结论: 存在版本差异 ❌`);
            }
        });

        // 总体结论
        console.log('\n🎯 总体结论:');
        versions.forEach(version => {
            const result = this.testResults[version];
            console.log(`📋 ${result.version}:`);
            console.log(`   成功率: ${result.summary.successRate}%`);
            console.log(`   通过: ${result.summary.passed}/${result.summary.total}`);
            if (result.errors.length > 0) {
                console.log(`   错误: ${result.errors.length}个`);
            }
        });
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const test = new ComprehensiveTest();
    test.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTest;
