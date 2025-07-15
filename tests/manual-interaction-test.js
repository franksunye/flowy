const TestUtils = require('./test-utils');

class ManualInteractionTest {
    constructor() {
        this.testUtils = new TestUtils();
    }

    // 手动交互测试 - 需要用户参与
    async runManualTest() {
        console.log('🎯 Manual Interaction Test for Original Demo');
        console.log('==========================================');
        console.log('⚠️  这个测试需要您手动操作浏览器');
        console.log('📋 请按照提示进行操作，然后按Enter继续');

        await this.testUtils.setupBrowser();

        try {
            const url = 'http://localhost:8005';
            console.log(`📱 打开: ${url}`);

            // 导航到页面
            await this.testUtils.navigateToUrl(url);
            
            // 基础检查
            await this.performBasicChecks();
            
            // 手动交互指导
            await this.guideManualInteraction();
            
            // 验证结果
            await this.verifyResults();

        } finally {
            console.log('\n🔚 测试完成，浏览器将保持打开状态供您继续测试');
            console.log('💡 您可以手动关闭浏览器窗口');
            // 不自动关闭浏览器，让用户手动测试
        }
    }

    // 基础检查
    async performBasicChecks() {
        console.log('\n🔧 执行基础检查...');

        const checks = {
            pageTitle: await this.testUtils.getPageInfo(),
            canvasExists: await this.testUtils.elementExists('#canvas'),
            createElements: await this.testUtils.getElementCount('.create-flowy'),
            flowyAPI: await this.testUtils.checkFlowyAPI()
        };

        console.log(`✅ 页面标题: ${checks.pageTitle.title}`);
        console.log(`✅ Canvas存在: ${checks.canvasExists}`);
        console.log(`✅ Create元素数量: ${checks.createElements}`);
        console.log(`✅ Flowy API可用: ${checks.flowyAPI?.flowyExists}`);
        console.log(`✅ jQuery可用: ${checks.flowyAPI?.jqueryExists}`);

        return checks;
    }

    // 手动交互指导
    async guideManualInteraction() {
        console.log('\n🎯 手动交互测试指导');
        console.log('==========================================');
        
        const instructions = [
            '1. 🖱️  尝试拖拽左侧的 "Action Block" 到画布中央',
            '2. 🖱️  尝试拖拽 "Condition Block" 到画布的另一个位置',
            '3. 🔗 尝试连接两个块（如果支持）',
            '4. 📊 观察是否有视觉反馈和动画效果',
            '5. 🗑️  尝试点击 "Delete blocks" 按钮清理画布'
        ];

        for (const instruction of instructions) {
            console.log(instruction);
            await this.waitForUserInput();
        }
    }

    // 等待用户输入
    async waitForUserInput() {
        return new Promise((resolve) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('   ✅ 完成后按Enter继续... ', () => {
                rl.close();
                resolve();
            });
        });
    }

    // 验证结果
    async verifyResults() {
        console.log('\n📊 验证测试结果...');

        // 检查是否有块被创建
        const blocksCount = await this.testUtils.getElementCount('.block');
        console.log(`📊 当前画布上的块数量: ${blocksCount}`);

        // 测试API功能
        const outputResult = await this.testUtils.evaluateScript(() => {
            try {
                const output = flowy.output();
                return {
                    success: true,
                    data: output,
                    length: Array.isArray(output) ? output.length : 0
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        if (outputResult?.success) {
            console.log(`✅ flowy.output() 工作正常`);
            console.log(`📊 输出数据长度: ${outputResult.length}`);
            if (outputResult.length > 0) {
                console.log(`📋 输出数据示例:`, JSON.stringify(outputResult.data[0], null, 2));
            }
        } else {
            console.log(`❌ flowy.output() 失败: ${outputResult?.error}`);
        }

        // 生成最终报告
        this.generateManualTestReport(blocksCount, outputResult);
    }

    // 生成手动测试报告
    generateManualTestReport(blocksCount, outputResult) {
        console.log('\n📋 手动测试报告');
        console.log('==========================================');

        console.log('🎯 测试结果总结:');
        console.log(`   📊 创建的块数量: ${blocksCount}`);
        console.log(`   🔌 API功能: ${outputResult?.success ? '正常' : '异常'}`);
        
        if (blocksCount > 0) {
            console.log('   ✅ 拖拽功能: 工作正常（有块被创建）');
        } else {
            console.log('   ⚠️  拖拽功能: 可能存在问题（没有块被创建）');
        }

        console.log('\n💡 建议:');
        if (blocksCount > 0 && outputResult?.success) {
            console.log('   ✅ Original Demo 功能完整，可以作为可靠的基准版本');
            console.log('   ✅ 可以安全地进行现代化升级工作');
        } else {
            console.log('   ⚠️  建议进一步调查拖拽功能的实现细节');
            console.log('   ⚠️  可能需要分析Flowy的事件处理机制');
        }

        console.log('\n🔍 下一步行动:');
        console.log('   1. 如果功能正常，可以开始编写单元测试');
        console.log('   2. 分析Flowy的核心算法和数据结构');
        console.log('   3. 建立现代化的构建和测试流程');
        console.log('   4. 逐步重构代码以支持现代JavaScript特性');
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const test = new ManualInteractionTest();
    test.runManualTest().catch(console.error);
}

module.exports = ManualInteractionTest;
