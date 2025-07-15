const { chromium } = require('playwright');

async function simpleTest() {
    console.log('🚀 启动简单测试...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('📱 测试原始demo版本...');
        await page.goto('http://localhost:8005');
        await page.waitForLoadState('networkidle');
        
        // 检查页面标题
        const title = await page.title();
        console.log(`📄 页面标题: ${title}`);
        
        // 检查canvas是否存在
        const canvas = await page.locator('#canvas');
        const canvasExists = await canvas.count() > 0;
        console.log(`🎨 Canvas存在: ${canvasExists}`);
        
        // 检查create元素
        const createElements = await page.locator('.create-flowy');
        const createCount = await createElements.count();
        console.log(`🔧 Create元素数量: ${createCount}`);
        
        // 等待用户观察
        console.log('⏳ 等待5秒以便观察...');
        await page.waitForTimeout(5000);
        
        console.log('✅ 原始demo测试完成');
        
        console.log('📱 测试src版本...');
        await page.goto('http://localhost:8006');
        await page.waitForLoadState('networkidle');
        
        // 检查页面标题
        const title2 = await page.title();
        console.log(`📄 页面标题: ${title2}`);
        
        // 检查canvas是否存在
        const canvas2 = await page.locator('#canvas');
        const canvasExists2 = await canvas2.count() > 0;
        console.log(`🎨 Canvas存在: ${canvasExists2}`);
        
        // 检查create元素
        const createElements2 = await page.locator('.create-flowy');
        const createCount2 = await createElements2.count();
        console.log(`🔧 Create元素数量: ${createCount2}`);
        
        // 等待用户观察
        console.log('⏳ 等待5秒以便观察...');
        await page.waitForTimeout(5000);
        
        console.log('✅ src版本测试完成');
        
    } catch (error) {
        console.log(`❌ 测试失败: ${error.message}`);
    } finally {
        await browser.close();
        console.log('🎯 测试结束');
    }
}

simpleTest().catch(console.error);
