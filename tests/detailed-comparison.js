const { chromium } = require('playwright');

async function testVersion(url, versionName) {
    console.log(`\n🧪 测试 ${versionName} - ${url}`);
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1500
    });
    
    const page = await browser.newPage();
    const results = {};
    
    try {
        // 1. 页面加载测试
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        results.pageLoaded = true;
        console.log('✅ 页面加载成功');
        
        // 2. 基础元素检查
        const canvas = await page.locator('#canvas');
        const createElements = await page.locator('.create-flowy');
        
        results.canvasExists = await canvas.count() > 0;
        results.createElementsCount = await createElements.count();
        
        console.log(`📊 Canvas存在: ${results.canvasExists}`);
        console.log(`📊 Create元素数量: ${results.createElementsCount}`);
        
        // 3. 拖拽功能测试
        if (results.createElementsCount > 0) {
            console.log('🔄 测试拖拽功能...');
            
            const firstElement = createElements.first();
            const canvasBox = await canvas.boundingBox();
            
            // 拖拽到画布中心
            await firstElement.dragTo(canvas, {
                targetPosition: { 
                    x: canvasBox.width / 2, 
                    y: canvasBox.height / 2 
                }
            });
            
            await page.waitForTimeout(2000);
            
            // 检查是否创建了块
            const blocks = await page.locator('.block');
            results.blocksCreated = await blocks.count();
            console.log(`📊 创建的块数量: ${results.blocksCreated}`);
            
            // 4. 测试flowy.output()函数
            console.log('🔄 测试输出功能...');
            const output = await page.evaluate(() => {
                if (typeof flowy !== 'undefined' && typeof flowy.output === 'function') {
                    return flowy.output();
                }
                return null;
            });
            
            results.outputWorks = output !== null;
            results.outputData = output;
            console.log(`📊 输出功能: ${results.outputWorks ? '正常' : '失败'}`);
            if (output) {
                console.log(`📊 输出数据: ${JSON.stringify(output, null, 2)}`);
            }
            
            // 5. 测试删除功能
            console.log('🔄 测试删除功能...');
            const deleteButton = await page.locator('text=Delete blocks');
            if (await deleteButton.count() > 0) {
                await deleteButton.click();
                await page.waitForTimeout(1000);
                
                const blocksAfterDelete = await page.locator('.block');
                results.deleteWorks = await blocksAfterDelete.count() === 0;
                console.log(`📊 删除功能: ${results.deleteWorks ? '正常' : '失败'}`);
            }
        }
        
        // 6. 检查控制台错误
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(1000);
        results.consoleErrors = errors;
        
        if (errors.length > 0) {
            console.log('❌ 控制台错误:');
            errors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ 无控制台错误');
        }
        
        console.log(`✅ ${versionName} 测试完成`);
        
    } catch (error) {
        console.log(`❌ ${versionName} 测试失败: ${error.message}`);
        results.error = error.message;
    } finally {
        await browser.close();
    }
    
    return results;
}

async function runDetailedComparison() {
    console.log('🚀 开始详细功能对比测试');
    
    // 测试原始demo版本
    const originalResults = await testVersion('http://localhost:8005', 'Original Demo (工作基准)');
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试src版本
    const srcResults = await testVersion('http://localhost:8006', 'Src Version (待验证)');
    
    // 对比分析
    console.log('\n📊 对比分析结果:');
    console.log('==========================================');
    
    const compareField = (field, description) => {
        const original = originalResults[field];
        const src = srcResults[field];
        const match = JSON.stringify(original) === JSON.stringify(src);
        console.log(`${description}: ${match ? '✅ 一致' : '❌ 不同'}`);
        if (!match) {
            console.log(`  原版: ${JSON.stringify(original)}`);
            console.log(`  Src版: ${JSON.stringify(src)}`);
        }
    };
    
    compareField('pageLoaded', '页面加载');
    compareField('canvasExists', 'Canvas存在');
    compareField('createElementsCount', 'Create元素数量');
    compareField('blocksCreated', '块创建功能');
    compareField('outputWorks', '输出功能');
    compareField('deleteWorks', '删除功能');
    compareField('consoleErrors', '控制台错误');
    
    console.log('\n🎯 结论:');
    const allMatch = ['pageLoaded', 'canvasExists', 'createElementsCount', 'blocksCreated', 'outputWorks', 'deleteWorks']
        .every(field => JSON.stringify(originalResults[field]) === JSON.stringify(srcResults[field]));
    
    if (allMatch && originalResults.consoleErrors.length === 0 && srcResults.consoleErrors.length === 0) {
        console.log('✅ src/flowy.js 与 demo版本功能完全一致！');
        console.log('✅ src/ 目录确实是demo的源代码');
        console.log('✅ 可以安全地基于src/目录进行开发');
    } else {
        console.log('❌ 存在功能差异，需要进一步调查');
        console.log('❌ 建议以demo版本为准进行开发');
    }
}

runDetailedComparison().catch(console.error);
