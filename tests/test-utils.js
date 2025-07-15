const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config');

class TestUtils {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {};
        this.errors = [];
    }

    // 启动浏览器
    async setupBrowser() {
        console.log('🚀 启动浏览器...');
        this.browser = await chromium.launch(TEST_CONFIG.browser);
        this.page = await this.browser.newPage();
        
        // 监听控制台错误
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.errors.push({
                    type: 'console',
                    message: msg.text(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        // 监听页面错误
        this.page.on('pageerror', error => {
            this.errors.push({
                type: 'page',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });

        console.log('✅ 浏览器启动成功');
    }

    // 关闭浏览器
    async teardownBrowser() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔚 浏览器已关闭');
        }
    }

    // 导航到指定URL
    async navigateToUrl(url, timeout = 30000) {
        console.log(`📱 导航到: ${url}`);
        try {
            await this.page.goto(url, { 
                waitUntil: 'networkidle',
                timeout 
            });
            return true;
        } catch (error) {
            this.errors.push({
                type: 'navigation',
                message: `导航失败: ${error.message}`,
                url,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    // 等待元素出现
    async waitForElement(selector, timeout = 10000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch (error) {
            this.errors.push({
                type: 'element',
                message: `元素未找到: ${selector}`,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    // 检查元素是否存在
    async elementExists(selector) {
        try {
            const element = await this.page.locator(selector);
            const count = await element.count();
            return count > 0;
        } catch (error) {
            return false;
        }
    }

    // 获取元素数量
    async getElementCount(selector) {
        try {
            const elements = await this.page.locator(selector);
            return await elements.count();
        } catch (error) {
            return 0;
        }
    }

    // 执行拖拽操作
    async dragElement(sourceSelector, targetX, targetY) {
        try {
            const sourceElement = this.page.locator(sourceSelector).first();
            const canvas = this.page.locator('#canvas');
            
            await sourceElement.dragTo(canvas, {
                targetPosition: { x: targetX, y: targetY }
            });
            
            // 等待拖拽完成
            await this.page.waitForTimeout(1000);
            return true;
        } catch (error) {
            this.errors.push({
                type: 'drag',
                message: `拖拽失败: ${error.message}`,
                source: sourceSelector,
                target: `(${targetX}, ${targetY})`,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    // 执行JavaScript代码
    async evaluateScript(script) {
        try {
            return await this.page.evaluate(script);
        } catch (error) {
            this.errors.push({
                type: 'script',
                message: `脚本执行失败: ${error.message}`,
                script: script.toString(),
                timestamp: new Date().toISOString()
            });
            return null;
        }
    }

    // 检查Flowy API是否可用
    async checkFlowyAPI() {
        const result = await this.evaluateScript(() => {
            return {
                flowyExists: typeof flowy !== 'undefined',
                flowyOutput: typeof flowy !== 'undefined' && typeof flowy.output === 'function',
                flowyDeleteBlocks: typeof flowy !== 'undefined' && typeof flowy.deleteBlocks === 'function',
                jqueryExists: typeof $ !== 'undefined'
            };
        });
        return result;
    }

    // 获取页面基本信息
    async getPageInfo() {
        const title = await this.page.title();
        const url = this.page.url();
        return { title, url };
    }

    // 截图
    async takeScreenshot(name) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `tests/screenshots/${name}-${timestamp}.png`;
            await this.page.screenshot({ path: filename, fullPage: true });
            console.log(`📸 截图保存: ${filename}`);
            return filename;
        } catch (error) {
            console.log(`❌ 截图失败: ${error.message}`);
            return null;
        }
    }

    // 生成测试报告
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            results: this.results,
            errors: this.errors,
            errorCount: this.errors.length,
            hasErrors: this.errors.length > 0
        };
    }

    // 清理错误记录
    clearErrors() {
        this.errors = [];
    }

    // 记录测试结果
    recordResult(testName, result, details = {}) {
        this.results[testName] = {
            passed: result,
            details,
            timestamp: new Date().toISOString()
        };
    }

    // 等待指定时间
    async wait(ms) {
        await this.page.waitForTimeout(ms);
    }
}

module.exports = TestUtils;
