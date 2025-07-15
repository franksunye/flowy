const { chromium } = require('playwright');

async function testFlowyFunctionality(url, testName) {
    console.log(`\n🧪 Testing ${testName} at ${url}`);
    
    const browser = await chromium.launch({
        headless: false,  // 显示浏览器窗口以便观察
        slowMo: 1000,     // 减慢操作速度以便观察
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'  // 使用系统Chrome
    });
    
    const page = await browser.newPage();
    
    try {
        // 导航到页面
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 页面加载完成');
        
        // 测试1: 检查基础元素是否存在
        const canvas = await page.locator('#canvas');
        const createElements = await page.locator('.create-flowy');
        
        console.log(`📊 Canvas存在: ${await canvas.count() > 0}`);
        console.log(`📊 Create元素数量: ${await createElements.count()}`);
        
        // 测试2: 测试拖拽功能
        console.log('🔄 测试拖拽功能...');
        
        if (await createElements.count() > 0) {
            const firstElement = createElements.first();
            const canvasBox = await canvas.boundingBox();
            
            // 拖拽第一个元素到画布中心
            await firstElement.dragTo(canvas, {
                targetPosition: { 
                    x: canvasBox.width / 2, 
                    y: canvasBox.height / 2 
                }
            });
            
            await page.waitForTimeout(2000); // 等待动画完成
            
            // 检查是否有块被创建
            const blocks = await page.locator('.block');
            console.log(`📊 创建的块数量: ${await blocks.count()}`);
        }
        
        // 测试3: 测试flowy.output()函数
        console.log('🔄 测试输出功能...');
        
        const output = await page.evaluate(() => {
            if (typeof flowy !== 'undefined' && typeof flowy.output === 'function') {
                return flowy.output();
            }
            return null;
        });
        
        console.log(`📊 输出结果: ${output ? JSON.stringify(output, null, 2) : '无输出'}`);
        
        // 测试4: 检查控制台错误
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(1000);
        
        if (errors.length > 0) {
            console.log('❌ 控制台错误:');
            errors.forEach(error => console.log(`   ${error}`));
        } else {
            console.log('✅ 无控制台错误');
        }
        
        // 测试5: 测试删除功能
        console.log('🔄 测试删除功能...');
        
        const deleteButton = await page.locator('text=Delete blocks');
        if (await deleteButton.count() > 0) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
            
            const blocksAfterDelete = await page.locator('.block');
            console.log(`📊 删除后的块数量: ${await blocksAfterDelete.count()}`);
        }
        
        console.log(`✅ ${testName} 测试完成`);
        
    } catch (error) {
        console.log(`❌ ${testName} 测试失败: ${error.message}`);
    } finally {
        await browser.close();
    }
}

async function runComparison() {
    console.log('🚀 开始Flowy功能对比测试');
    
    // 测试原始demo版本
    await testFlowyFunctionality('http://localhost:8005', 'Original Demo (工作基准版本)');
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试src版本
    await testFlowyFunctionality('http://localhost:8006', 'Src Version (待验证版本)');
    
    console.log('\n🎯 测试完成！请查看上述结果进行对比分析。');
}

// 运行测试
runComparison().catch(console.error);
