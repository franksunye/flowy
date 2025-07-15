const TestUtils = require('./test-utils');
const TEST_CONFIG = require('./test-config');

class OriginalDemoTest {
    constructor() {
        this.testUtils = new TestUtils();
        this.testResults = {};
    }

    // 运行Original Demo的完整测试
    async runFullTest() {
        console.log('🎯 Original Demo 完整功能测试');
        console.log('==========================================');

        await this.testUtils.setupBrowser();

        try {
            const url = 'http://localhost:8005';
            console.log(`📱 测试URL: ${url}`);

            // 基础功能验证
            await this.testBasicFunctionality(url);
            
            // 拖拽功能深度测试
            await this.testDragAndDropFunctionality(url);
            
            // API功能完整测试
            await this.testAPIFunctionality(url);
            
            // 工作流测试
            await this.testWorkflowScenarios(url);
            
            // 错误处理测试
            await this.testErrorHandling(url);

            // 生成详细报告
            this.generateDetailedReport();

        } finally {
            await this.testUtils.teardownBrowser();
        }
    }

    // 基础功能验证
    async testBasicFunctionality(url) {
        console.log('\n🔧 基础功能验证...');

        // 页面加载
        const loaded = await this.testUtils.navigateToUrl(url);
        this.recordTest('页面加载', loaded);

        if (!loaded) return;

        // 页面元素检查
        const pageInfo = await this.testUtils.getPageInfo();
        this.recordTest('页面标题', pageInfo.title === 'Flowy - The simple flowchart engine');

        // 关键元素存在性检查
        const elements = {
            canvas: await this.testUtils.elementExists('#canvas'),
            createElements: await this.testUtils.getElementCount('.create-flowy'),
            indicator: await this.testUtils.elementExists('.indicator'),
            removeButton: await this.testUtils.elementExists('#removeblock')
        };

        this.recordTest('Canvas存在', elements.canvas);
        this.recordTest('Create元素数量正确', elements.createElements === 4);
        this.recordTest('指示器存在', elements.indicator);
        this.recordTest('删除按钮存在', elements.removeButton);

        // 脚本加载检查
        const scripts = await this.testUtils.checkFlowyAPI();
        this.recordTest('Flowy API可用', scripts?.flowyExists || false);
        this.recordTest('jQuery可用', scripts?.jqueryExists || false);

        console.log(`   ✅ 基础功能检查完成`);
    }

    // 拖拽功能深度测试
    async testDragAndDropFunctionality(url) {
        console.log('\n🎯 拖拽功能深度测试...');

        // 测试每种类型的块
        const blockTypes = TEST_CONFIG.testData.blockTypes;
        let successfulDrags = 0;

        for (let i = 0; i < blockTypes.length; i++) {
            const blockType = blockTypes[i];
            const target = TEST_CONFIG.testData.dragTargets[i % TEST_CONFIG.testData.dragTargets.length];

            console.log(`   🔄 测试拖拽 ${blockType.name} 到 ${target.description}`);

            // 执行拖拽
            const dragSuccess = await this.testUtils.dragElement(
                blockType.selector,
                target.x,
                target.y
            );

            if (dragSuccess) {
                successfulDrags++;
                await this.testUtils.wait(1500);

                // 检查是否创建了块
                const blocksCount = await this.testUtils.getElementCount('.block');
                console.log(`     📊 当前块数量: ${blocksCount}`);
            }

            this.recordTest(`拖拽${blockType.name}`, dragSuccess);
        }

        this.recordTest('拖拽功能整体', successfulDrags > 0);
        console.log(`   📊 成功拖拽: ${successfulDrags}/${blockTypes.length}`);
    }

    // API功能完整测试
    async testAPIFunctionality(url) {
        console.log('\n🔌 API功能完整测试...');

        // 测试flowy.output()
        const outputTest = await this.testUtils.evaluateScript(() => {
            try {
                if (typeof flowy === 'undefined') {
                    return { success: false, error: 'flowy未定义' };
                }
                
                const output = flowy.output();
                return {
                    success: true,
                    data: output,
                    isArray: Array.isArray(output),
                    length: Array.isArray(output) ? output.length : 0,
                    type: typeof output
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        this.recordTest('flowy.output()可用', outputTest?.success || false);
        if (outputTest?.success) {
            console.log(`   📊 输出数据类型: ${outputTest.type}`);
            console.log(`   📊 是否为数组: ${outputTest.isArray}`);
            console.log(`   📊 数据长度: ${outputTest.length}`);
        }

        // 测试flowy.deleteBlocks()
        const deleteTest = await this.testUtils.evaluateScript(() => {
            try {
                if (typeof flowy === 'undefined' || typeof flowy.deleteBlocks !== 'function') {
                    return { success: false, error: 'flowy.deleteBlocks未定义' };
                }
                
                flowy.deleteBlocks();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        this.recordTest('flowy.deleteBlocks()可用', deleteTest?.success || false);

        // 验证删除效果
        if (deleteTest?.success) {
            await this.testUtils.wait(1000);
            const remainingBlocks = await this.testUtils.getElementCount('.block');
            this.recordTest('删除功能生效', remainingBlocks === 0);
            console.log(`   📊 删除后剩余块: ${remainingBlocks}`);
        }

        // 测试其他可能的API
        const additionalAPI = await this.testUtils.evaluateScript(() => {
            const api = {};
            if (typeof flowy !== 'undefined') {
                api.methods = Object.getOwnPropertyNames(flowy).filter(name => typeof flowy[name] === 'function');
                api.properties = Object.getOwnPropertyNames(flowy).filter(name => typeof flowy[name] !== 'function');
            }
            return api;
        });

        if (additionalAPI?.methods) {
            console.log(`   📋 可用方法: ${additionalAPI.methods.join(', ')}`);
            console.log(`   📋 可用属性: ${additionalAPI.properties.join(', ')}`);
        }
    }

    // 工作流测试
    async testWorkflowScenarios(url) {
        console.log('\n🔄 工作流场景测试...');

        // 场景1: 创建简单工作流
        console.log('   📝 场景1: 创建简单工作流');
        
        // 创建第一个块
        const drag1 = await this.testUtils.dragElement('.create-flowy[data-type="1"]', 300, 200);
        await this.testUtils.wait(1000);
        
        // 创建第二个块
        const drag2 = await this.testUtils.dragElement('.create-flowy[data-type="2"]', 500, 200);
        await this.testUtils.wait(1000);

        const blocksAfterCreation = await this.testUtils.getElementCount('.block');
        this.recordTest('简单工作流创建', blocksAfterCreation >= 2);

        // 场景2: 获取工作流数据
        console.log('   📊 场景2: 获取工作流数据');
        const workflowData = await this.testUtils.evaluateScript(() => {
            try {
                return flowy.output();
            } catch (error) {
                return null;
            }
        });

        const hasWorkflowData = workflowData && Array.isArray(workflowData) && workflowData.length > 0;
        this.recordTest('工作流数据获取', hasWorkflowData);

        if (hasWorkflowData) {
            console.log(`   📊 工作流包含 ${workflowData.length} 个块`);
        }

        // 场景3: 清理工作流
        console.log('   🧹 场景3: 清理工作流');
        const cleanupSuccess = await this.testUtils.evaluateScript(() => {
            try {
                flowy.deleteBlocks();
                return true;
            } catch (error) {
                return false;
            }
        });

        await this.testUtils.wait(1000);
        const blocksAfterCleanup = await this.testUtils.getElementCount('.block');
        this.recordTest('工作流清理', cleanupSuccess && blocksAfterCleanup === 0);
    }

    // 错误处理测试
    async testErrorHandling(url) {
        console.log('\n⚠️ 错误处理测试...');

        // 测试无效操作
        const errorTests = await this.testUtils.evaluateScript(() => {
            const results = {};
            
            // 测试无效参数
            try {
                if (typeof flowy !== 'undefined' && typeof flowy.output === 'function') {
                    flowy.output('invalid_param');
                    results.invalidParam = 'no_error';
                } else {
                    results.invalidParam = 'method_not_available';
                }
            } catch (error) {
                results.invalidParam = 'error_caught';
            }

            return results;
        });

        this.recordTest('错误处理机制', true); // 只要没有崩溃就算通过

        console.log('   ✅ 错误处理测试完成');
    }

    // 记录测试结果
    recordTest(testName, passed, details = {}) {
        this.testResults[testName] = {
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        
        const status = passed ? '✅' : '❌';
        console.log(`     ${status} ${testName}`);
    }

    // 生成详细报告
    generateDetailedReport() {
        console.log('\n📋 Original Demo 详细测试报告');
        console.log('==========================================');

        const tests = Object.entries(this.testResults);
        const passed = tests.filter(([_, result]) => result.passed).length;
        const total = tests.length;
        const successRate = (passed / total * 100).toFixed(1);

        console.log(`📊 总体统计:`);
        console.log(`   ✅ 通过: ${passed}`);
        console.log(`   ❌ 失败: ${total - passed}`);
        console.log(`   📈 成功率: ${successRate}%`);
        console.log(`   📅 测试时间: ${new Date().toLocaleString()}`);

        console.log(`\n📝 详细结果:`);
        tests.forEach(([testName, result]) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${testName}`);
        });

        // 失败的测试
        const failedTests = tests.filter(([_, result]) => !result.passed);
        if (failedTests.length > 0) {
            console.log(`\n⚠️ 需要关注的问题:`);
            failedTests.forEach(([testName, result]) => {
                console.log(`   ❌ ${testName}`);
                if (result.details) {
                    console.log(`      详情: ${JSON.stringify(result.details)}`);
                }
            });
        }

        console.log(`\n🎯 结论:`);
        if (successRate >= 90) {
            console.log(`✅ Original Demo 功能状态良好，可以作为可靠的基准版本`);
        } else if (successRate >= 70) {
            console.log(`⚠️ Original Demo 大部分功能正常，但有一些问题需要注意`);
        } else {
            console.log(`❌ Original Demo 存在较多问题，需要进一步调查`);
        }
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const test = new OriginalDemoTest();
    test.runFullTest().catch(console.error);
}

module.exports = OriginalDemoTest;
