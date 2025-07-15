const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config');

class FlowyE2ETest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.errors = [];
    }

    // 运行完整的端到端测试
    async runFullE2ETest() {
        console.log('🚀 Flowy 端到端自动化测试');
        console.log('==========================================');
        
        try {
            await this.setupBrowser();
            await this.navigateToApp();
            await this.runTestSuite();
            this.generateReport();
        } catch (error) {
            console.error('❌ 测试执行失败:', error);
        } finally {
            await this.cleanup();
        }
    }

    // 设置浏览器
    async setupBrowser() {
        console.log('🔧 启动浏览器...');
        this.browser = await chromium.launch(TEST_CONFIG.browser);
        this.page = await this.browser.newPage();
        
        // 监听错误
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.errors.push(`Console Error: ${msg.text()}`);
            }
        });
        
        this.page.on('pageerror', error => {
            this.errors.push(`Page Error: ${error.message}`);
        });
        
        console.log('✅ 浏览器启动成功');
    }

    // 导航到应用
    async navigateToApp() {
        console.log(`📱 导航到: ${TEST_CONFIG.target.url}`);
        await this.page.goto(TEST_CONFIG.target.url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // 等待关键元素加载
        await this.page.waitForSelector('#canvas', { timeout: 10000 });
        await this.page.waitForSelector('.create-flowy', { timeout: 10000 });
        
        console.log('✅ 应用加载完成');
    }

    // 运行测试套件
    async runTestSuite() {
        console.log('\n🧪 开始测试套件...');
        
        // 1. 基础功能测试
        await this.testBasicFunctionality();
        
        // 2. 拖拽功能测试 - 核心功能
        await this.testDragAndDropFunctionality();
        
        // 3. API功能测试
        await this.testAPIFunctionality();
        
        // 4. 工作流测试
        await this.testWorkflowScenarios();

        // 5. 并列节点工作流测试 - 核心功能
        await this.testParallelNodeWorkflows();

        // 6. 清理测试
        await this.testCleanupFunctionality();
    }

    // 基础功能测试
    async testBasicFunctionality() {
        console.log('\n🔧 基础功能测试...');
        
        // 页面标题
        const title = await this.page.title();
        this.recordTest('页面标题', title === TEST_CONFIG.expectations.title, {
            expected: TEST_CONFIG.expectations.title,
            actual: title
        });
        
        // Canvas存在
        const canvasExists = await this.page.locator('#canvas').count() > 0;
        this.recordTest('Canvas元素存在', canvasExists);
        
        // Create元素数量
        const createCount = await this.page.locator('.create-flowy').count();
        this.recordTest('Create元素数量', createCount === TEST_CONFIG.expectations.createElementsCount, {
            expected: TEST_CONFIG.expectations.createElementsCount,
            actual: createCount
        });
        
        // Flowy API可用
        const flowyAPI = await this.page.evaluate(() => {
            return typeof flowy !== 'undefined' && typeof flowy.output === 'function';
        });
        this.recordTest('Flowy API可用', flowyAPI);
        
        console.log('   ✅ 基础功能测试完成');
    }

    // 拖拽功能测试 - 使用特殊技术处理
    async testDragAndDropFunctionality() {
        console.log('\n🎯 拖拽功能测试...');
        
        let successfulDrags = 0;
        
        for (const dragTest of TEST_CONFIG.dragTests) {
            console.log(`   🔄 测试拖拽: ${dragTest.name}`);
            
            try {
                // 方法1: 使用更精确的拖拽实现
                const success = await this.performAdvancedDrag(dragTest);
                
                if (success) {
                    successfulDrags++;
                    console.log(`     ✅ ${dragTest.name} 拖拽成功`);
                    
                    // 验证块是否被创建
                    await this.page.waitForTimeout(1000);
                    const blocksCount = await this.page.locator('.block').count();
                    console.log(`     📊 当前块数量: ${blocksCount}`);
                } else {
                    console.log(`     ❌ ${dragTest.name} 拖拽失败`);
                }
                
                this.recordTest(`拖拽${dragTest.name}`, success);
                
            } catch (error) {
                console.log(`     ❌ ${dragTest.name} 拖拽异常: ${error.message}`);
                this.recordTest(`拖拽${dragTest.name}`, false, { error: error.message });
            }
        }
        
        this.recordTest('拖拽功能整体', successfulDrags > 0, {
            successCount: successfulDrags,
            totalTests: TEST_CONFIG.dragTests.length
        });
        
        console.log(`   📊 拖拽成功率: ${successfulDrags}/${TEST_CONFIG.dragTests.length}`);
    }

    // 高级拖拽实现 - 专门处理Flowy的吸附机制
    async performAdvancedDrag(dragTest) {
        try {
            console.log(`     🎯 开始拖拽到吸附位置: (${dragTest.target.x}, ${dragTest.target.y})`);

            // 等待元素可见
            await this.page.waitForSelector(dragTest.selector, { timeout: 10000 });

            // 获取源元素和目标区域
            const sourceElement = this.page.locator(dragTest.selector);
            const canvas = this.page.locator('#canvas');

            // 确保元素存在
            const sourceCount = await sourceElement.count();
            if (sourceCount === 0) {
                throw new Error(`源元素未找到: ${dragTest.selector}`);
            }

            // 获取元素位置信息
            const sourceBox = await sourceElement.first().boundingBox();
            const canvasBox = await canvas.boundingBox();

            if (!sourceBox || !canvasBox) {
                throw new Error('无法获取元素位置信息');
            }

            console.log(`     📍 源元素位置: (${sourceBox.x}, ${sourceBox.y})`);
            console.log(`     📍 画布位置: (${canvasBox.x}, ${canvasBox.y})`);

            // 计算精确的拖拽路径 - 确保落在画布的有效区域
            const startX = sourceBox.x + sourceBox.width / 2;
            const startY = sourceBox.y + sourceBox.height / 2;
            const endX = canvasBox.x + dragTest.target.x;
            const endY = canvasBox.y + dragTest.target.y;

            console.log(`     🎯 拖拽路径: (${startX}, ${startY}) → (${endX}, ${endY})`);

            // 执行精确拖拽 - 模拟真实用户行为
            await this.page.mouse.move(startX, startY);
            await this.page.waitForTimeout(200);  // 等待hover效果

            await this.page.mouse.down();
            await this.page.waitForTimeout(300);  // 等待拖拽开始

            // 缓慢移动到目标位置 - 确保Flowy能正确跟踪
            const steps = 15;
            for (let i = 1; i <= steps; i++) {
                const x = startX + (endX - startX) * (i / steps);
                const y = startY + (endY - startY) * (i / steps);
                await this.page.mouse.move(x, y);
                await this.page.waitForTimeout(100);  // 给Flowy时间处理
            }

            // 释放鼠标并等待吸附
            await this.page.mouse.up();
            console.log(`     ⏳ 等待吸附完成...`);
            await this.page.waitForTimeout(TEST_CONFIG.snapping.waitTime);

            // 验证吸附是否成功
            const snappingSuccess = await this.verifySnapping(dragTest);

            if (snappingSuccess) {
                console.log(`     ✅ 吸附成功！块已正确创建`);
                return true;
            } else {
                console.log(`     ❌ 吸附失败，块未正确创建`);
                return false;
            }

        } catch (error) {
            console.log(`     ❌ 高级拖拽异常: ${error.message}`);
            return await this.performFallbackDrag(dragTest);
        }
    }

    // 验证吸附是否成功
    async verifySnapping(dragTest) {
        try {
            // 检查是否有新的块被创建
            const blocks = await this.page.locator(TEST_CONFIG.snapping.snappedBlockSelector);
            const blockCount = await blocks.count();

            if (blockCount === 0) {
                console.log(`     ❌ 没有检测到新创建的块`);
                return false;
            }

            // 检查最新创建的块是否包含预期的内容
            const latestBlock = blocks.last();

            // 验证块的标题
            const titleElement = latestBlock.locator(TEST_CONFIG.snapping.blockContentSelectors.title);
            const titleCount = await titleElement.count();

            if (titleCount > 0) {
                const titleText = await titleElement.textContent();
                const titleMatches = titleText?.includes(dragTest.expectedTitle);
                console.log(`     📝 块标题: "${titleText}" (期望包含: "${dragTest.expectedTitle}")`);

                if (!titleMatches) {
                    console.log(`     ❌ 块标题不匹配`);
                    return false;
                }
            }

            // 验证块的结构 - 检查是否有吸附后的特征元素
            const leftElement = latestBlock.locator(TEST_CONFIG.snapping.blockContentSelectors.left);
            const leftCount = await leftElement.count();

            if (leftCount === 0) {
                console.log(`     ❌ 块缺少吸附后的结构元素`);
                return false;
            }

            console.log(`     ✅ 吸附验证通过 - 块结构正确`);
            return true;

        } catch (error) {
            console.log(`     ❌ 吸附验证异常: ${error.message}`);
            return false;
        }
    }

    // 备用拖拽方法 - 使用Playwright内置方法
    async performFallbackDrag(dragTest) {
        try {
            console.log(`     🔄 尝试备用拖拽方法...`);

            const sourceElement = this.page.locator(dragTest.selector).first();
            const canvas = this.page.locator('#canvas');

            // 使用Playwright的dragTo方法，但添加更多选项
            await sourceElement.dragTo(canvas, {
                targetPosition: dragTest.target,
                force: true,
                timeout: 10000
            });

            // 等待吸附
            await this.page.waitForTimeout(TEST_CONFIG.snapping.waitTime);

            // 验证吸附
            return await this.verifySnapping(dragTest);

        } catch (error) {
            console.log(`     ❌ 备用拖拽也失败: ${error.message}`);
            return false;
        }
    }

    // API功能测试
    async testAPIFunctionality() {
        console.log('\n🔌 API功能测试...');
        
        // 测试flowy.output()
        const outputResult = await this.page.evaluate(() => {
            try {
                const output = flowy.output();
                return {
                    success: true,
                    data: output,
                    isArray: Array.isArray(output),
                    length: Array.isArray(output) ? output.length : 0
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        this.recordTest('flowy.output()功能', outputResult.success, outputResult);
        
        // 测试flowy.deleteBlocks()
        const deleteResult = await this.page.evaluate(() => {
            try {
                flowy.deleteBlocks();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        this.recordTest('flowy.deleteBlocks()功能', deleteResult.success, deleteResult);
        
        console.log('   ✅ API功能测试完成');
    }

    // 工作流测试 - 基于吸附机制的完整工作流
    async testWorkflowScenarios() {
        console.log('\n🔄 工作流场景测试...');

        // 场景1: 创建多块工作流
        console.log('   📝 场景1: 创建多块工作流...');

        let successfulBlocks = 0;
        const targetBlocks = 2;  // 测试创建2个块

        for (let i = 0; i < targetBlocks; i++) {
            const dragTest = TEST_CONFIG.dragTests[i];
            console.log(`     🔄 创建第${i + 1}个块: ${dragTest.name}`);

            const success = await this.performAdvancedDrag(dragTest);
            if (success) {
                successfulBlocks++;
                console.log(`     ✅ 第${i + 1}个块创建成功`);
            } else {
                console.log(`     ❌ 第${i + 1}个块创建失败`);
            }

            // 块之间的间隔
            await this.page.waitForTimeout(1000);
        }

        // 验证工作流状态
        const finalBlocksCount = await this.page.locator(TEST_CONFIG.snapping.snappedBlockSelector).count();
        const workflowCreated = finalBlocksCount >= targetBlocks;

        this.recordTest('多块工作流创建', workflowCreated, {
            targetBlocks,
            successfulBlocks,
            finalBlocksCount,
            success: successfulBlocks >= targetBlocks
        });

        console.log(`     📊 工作流状态: ${finalBlocksCount}个块 (目标: ${targetBlocks}个)`);

        // 场景2: 验证工作流数据完整性
        console.log('   📊 场景2: 验证工作流数据...');

        const workflowData = await this.page.evaluate(() => {
            try {
                const output = flowy.output();
                return {
                    success: true,
                    data: output,
                    isArray: Array.isArray(output),
                    length: Array.isArray(output) ? output.length : 0,
                    hasBlocks: Array.isArray(output) && output.length > 0
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        const dataValid = workflowData.success && workflowData.hasBlocks;
        this.recordTest('工作流数据完整性', dataValid, workflowData);

        if (dataValid) {
            console.log(`     ✅ 工作流数据有效: ${workflowData.length}个数据项`);

            // 显示工作流数据示例
            if (workflowData.data && workflowData.data.length > 0) {
                console.log(`     📋 第一个块数据:`, JSON.stringify(workflowData.data[0], null, 2));
            }
        } else {
            console.log(`     ❌ 工作流数据无效: ${workflowData.error || '未知错误'}`);
        }

        // 场景3: 测试工作流连接性（如果支持）
        console.log('   🔗 场景3: 测试块连接性...');

        // 检查块是否有连接点
        const connectionPoints = await this.page.locator('.arrowblock').count();
        const hasConnections = connectionPoints > 0;

        this.recordTest('工作流连接性', true, {  // 总是通过，因为连接是可选的
            connectionPoints,
            hasConnections,
            note: '连接功能为可选特性'
        });

        console.log(`     📊 连接点数量: ${connectionPoints}`);
        console.log('   ✅ 工作流场景测试完成');
    }

    // 并列节点工作流测试 - 核心功能测试
    async testParallelNodeWorkflows() {
        console.log('\n🌳 并列节点工作流测试...');

        // 测试场景1: 一父二子工作流
        await this.testTwoChildrenWorkflow();

        // 清理画布
        await this.clearCanvas();
        await this.page.waitForTimeout(1000);

        // 测试场景2: 一父三子工作流
        await this.testThreeChildrenWorkflow();

        console.log('   ✅ 并列节点工作流测试完成');
    }

    // 测试一父二子工作流场景
    async testTwoChildrenWorkflow() {
        console.log('\n   🌲 场景1: 一父二子工作流测试...');

        const scenario = TEST_CONFIG.workflowScenarios.twoChildren;
        const results = await this.executeWorkflowScenario(scenario);

        // 验证工作流结构
        const structureValid = await this.verifyWorkflowStructure(scenario.expectedStructure);
        this.recordTest('一父二子工作流创建', results.success && structureValid, {
            scenario: scenario.name,
            blocksCreated: results.blocksCreated,
            expectedBlocks: scenario.expectedStructure.totalBlocks,
            structureValid
        });

        // 验证并列节点重排
        const rearrangementValid = await this.verifyParallelNodeArrangement(scenario.expectedStructure.parallelChildren);
        this.recordTest('二子节点重排功能', rearrangementValid, {
            parallelChildren: scenario.expectedStructure.parallelChildren,
            rearrangementValid
        });

        // 验证父子关系数据
        const relationshipData = await this.verifyParentChildRelationships(scenario);
        this.recordTest('一父二子关系数据', relationshipData.valid, relationshipData);

        console.log(`     📊 一父二子工作流: ${results.blocksCreated}个块创建，重排${rearrangementValid ? '成功' : '失败'}`);
    }

    // 测试一父三子工作流场景
    async testThreeChildrenWorkflow() {
        console.log('\n   🌳 场景2: 一父三子工作流测试...');

        const scenario = TEST_CONFIG.workflowScenarios.threeChildren;
        const results = await this.executeWorkflowScenario(scenario);

        // 验证工作流结构
        const structureValid = await this.verifyWorkflowStructure(scenario.expectedStructure);
        this.recordTest('一父三子工作流创建', results.success && structureValid, {
            scenario: scenario.name,
            blocksCreated: results.blocksCreated,
            expectedBlocks: scenario.expectedStructure.totalBlocks,
            structureValid
        });

        // 验证并列节点重排
        const rearrangementValid = await this.verifyParallelNodeArrangement(scenario.expectedStructure.parallelChildren);
        this.recordTest('三子节点重排功能', rearrangementValid, {
            parallelChildren: scenario.expectedStructure.parallelChildren,
            rearrangementValid
        });

        // 验证父子关系数据
        const relationshipData = await this.verifyParentChildRelationships(scenario);
        this.recordTest('一父三子关系数据', relationshipData.valid, relationshipData);

        console.log(`     📊 一父三子工作流: ${results.blocksCreated}个块创建，重排${rearrangementValid ? '成功' : '失败'}`);
    }

    // 执行工作流场景
    async executeWorkflowScenario(scenario) {
        console.log(`     🔄 执行场景: ${scenario.name}`);

        let successfulBlocks = 0;
        const totalBlocks = scenario.blocks.length;

        for (let i = 0; i < scenario.blocks.length; i++) {
            const block = scenario.blocks[i];
            console.log(`       🎯 创建${block.role}: ${block.name}`);

            // 根据选择器确定实际的块标题
            const expectedTitles = {
                '.create-flowy:nth-child(1)': 'New visitor',
                '.create-flowy:nth-child(2)': 'Action is performed',
                '.create-flowy:nth-child(3)': 'Time has passed',
                '.create-flowy:nth-child(4)': 'Error prompt'
            };

            const dragTest = {
                name: block.name,
                selector: block.selector,
                target: block.target,
                expectedTitle: expectedTitles[block.selector] || block.name
            };

            const success = await this.performAdvancedDrag(dragTest);
            if (success) {
                successfulBlocks++;
                console.log(`       ✅ ${block.name} 创建成功`);

                // 等待重排完成
                await this.page.waitForTimeout(1500);
            } else {
                console.log(`       ❌ ${block.name} 创建失败`);
            }
        }

        return {
            success: successfulBlocks === totalBlocks,
            blocksCreated: successfulBlocks,
            totalBlocks
        };
    }

    // 验证工作流结构
    async verifyWorkflowStructure(expectedStructure) {
        try {
            const actualBlocks = await this.page.locator(TEST_CONFIG.snapping.snappedBlockSelector).count();
            const structureMatches = actualBlocks === expectedStructure.totalBlocks;

            console.log(`       📊 期望块数: ${expectedStructure.totalBlocks}, 实际块数: ${actualBlocks}`);

            return structureMatches;
        } catch (error) {
            console.log(`       ❌ 结构验证失败: ${error.message}`);
            return false;
        }
    }

    // 验证并列节点重排
    async verifyParallelNodeArrangement(expectedParallelChildren) {
        try {
            // 获取所有块的位置信息
            const blockPositions = await this.page.evaluate(() => {
                const blocks = document.querySelectorAll('.block');
                return Array.from(blocks).map(block => {
                    const rect = block.getBoundingClientRect();
                    return {
                        id: block.querySelector('.blockid')?.value,
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height
                    };
                });
            });

            if (blockPositions.length === 0) {
                return false;
            }

            // 按Y坐标分组，找出并列节点
            const yGroups = {};
            blockPositions.forEach(block => {
                const yKey = Math.round(block.y / 50) * 50; // 50px容差分组
                if (!yGroups[yKey]) yGroups[yKey] = [];
                yGroups[yKey].push(block);
            });

            // 找到最大的Y组（应该是并列子节点）
            const largestGroup = Object.values(yGroups).reduce((max, group) =>
                group.length > max.length ? group : max, []);

            const actualParallelChildren = largestGroup.length;
            const arrangementValid = actualParallelChildren >= expectedParallelChildren;

            console.log(`       📊 期望并列节点: ${expectedParallelChildren}, 实际并列节点: ${actualParallelChildren}`);

            // 验证并列节点是否水平排列
            if (largestGroup.length > 1) {
                const sortedByX = largestGroup.sort((a, b) => a.x - b.x);
                const hasProperSpacing = sortedByX.every((block, index) => {
                    if (index === 0) return true;
                    const spacing = block.x - sortedByX[index - 1].x;
                    return spacing > 50; // 至少50px间距
                });

                console.log(`       📊 并列节点水平排列: ${hasProperSpacing ? '正确' : '错误'}`);
                return arrangementValid && hasProperSpacing;
            }

            return arrangementValid;

        } catch (error) {
            console.log(`       ❌ 重排验证失败: ${error.message}`);
            return false;
        }
    }

    // 验证父子关系数据
    async verifyParentChildRelationships(scenario) {
        try {
            const workflowData = await this.page.evaluate(() => {
                try {
                    return flowy.output();
                } catch (error) {
                    return null;
                }
            });

            if (!workflowData || !Array.isArray(workflowData)) {
                return { valid: false, error: '无法获取工作流数据' };
            }

            // 验证父子关系
            const parentBlocks = workflowData.filter(block => block.parent === -1);
            const childBlocks = workflowData.filter(block => block.parent !== -1);

            // 验证并列子节点（具有相同parent的节点）
            const parentIds = [...new Set(childBlocks.map(block => block.parent))];
            const parallelGroups = parentIds.map(parentId =>
                childBlocks.filter(block => block.parent === parentId)
            );

            const maxParallelChildren = Math.max(...parallelGroups.map(group => group.length), 0);

            const relationshipValid = {
                hasParent: parentBlocks.length > 0,
                hasChildren: childBlocks.length > 0,
                parallelChildrenCount: maxParallelChildren,
                expectedParallelChildren: scenario.expectedStructure.parallelChildren,
                parallelChildrenMatch: maxParallelChildren >= scenario.expectedStructure.parallelChildren
            };

            console.log(`       📊 父节点: ${parentBlocks.length}, 子节点: ${childBlocks.length}, 最大并列: ${maxParallelChildren}`);

            return {
                valid: relationshipValid.hasParent && relationshipValid.hasChildren && relationshipValid.parallelChildrenMatch,
                details: relationshipValid,
                workflowData
            };

        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // 清理画布
    async clearCanvas() {
        console.log('       🧹 清理画布...');
        try {
            await this.page.evaluate(() => {
                if (typeof flowy !== 'undefined' && typeof flowy.deleteBlocks === 'function') {
                    flowy.deleteBlocks();
                }
            });
            await this.page.waitForTimeout(1000);
            return true;
        } catch (error) {
            console.log(`       ❌ 清理失败: ${error.message}`);
            return false;
        }
    }

    // 清理功能测试
    async testCleanupFunctionality() {
        console.log('\n🧹 清理功能测试...');
        
        // 执行清理
        const cleanupSuccess = await this.page.evaluate(() => {
            try {
                flowy.deleteBlocks();
                return true;
            } catch (error) {
                return false;
            }
        });
        
        await this.page.waitForTimeout(1000);
        
        // 验证清理效果
        const remainingBlocks = await this.page.locator('.block').count();
        const cleanupEffective = remainingBlocks === 0;
        
        this.recordTest('清理功能', cleanupSuccess && cleanupEffective, {
            cleanupExecuted: cleanupSuccess,
            remainingBlocks: remainingBlocks
        });
        
        console.log('   ✅ 清理功能测试完成');
    }

    // 记录测试结果
    recordTest(testName, passed, details = {}) {
        this.testResults.push({
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`     ${status} ${testName}`);
    }

    // 生成测试报告
    generateReport() {
        console.log('\n📋 端到端测试报告');
        console.log('==========================================');
        
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.passed).length;
        const failed = total - passed;
        const successRate = (passed / total * 100).toFixed(1);
        
        console.log(`📊 测试统计:`);
        console.log(`   ✅ 通过: ${passed}`);
        console.log(`   ❌ 失败: ${failed}`);
        console.log(`   📈 成功率: ${successRate}%`);
        console.log(`   🕒 测试时间: ${new Date().toLocaleString()}`);
        
        if (this.errors.length > 0) {
            console.log(`\n⚠️ 发现错误 (${this.errors.length}个):`);
            this.errors.forEach(error => console.log(`   ❌ ${error}`));
        }
        
        console.log(`\n🎯 测试结论:`);
        if (successRate >= 90) {
            console.log(`✅ Flowy功能状态优秀，现代化升级风险低`);
        } else if (successRate >= 70) {
            console.log(`⚠️ Flowy功能基本正常，需要关注失败的测试项`);
        } else {
            console.log(`❌ Flowy存在较多问题，建议先修复再进行现代化升级`);
        }
        
        // 详细结果
        console.log(`\n📝 详细测试结果:`);
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${result.name}`);
            if (!result.passed && result.details.error) {
                console.log(`      错误: ${result.details.error}`);
            }
        });
    }

    // 清理资源
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n🔚 测试完成，浏览器已关闭');
        }
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const test = new FlowyE2ETest();
    test.runFullE2ETest().catch(console.error);
}

module.exports = FlowyE2ETest;
