#!/usr/bin/env node

/**
 * 生成详细的功能一致性验证报告
 * 
 * 这个脚本会：
 * 1. 运行完整的回归测试
 * 2. 生成详细的HTML报告
 * 3. 包含截图对比
 * 4. 提供可视化的差异分析
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DetailedVerificationReport {
  constructor() {
    this.reportData = {
      timestamp: new Date().toISOString(),
      testResults: [],
      screenshots: [],
      summary: {}
    };
  }

  async generateReport() {
    console.log('📊 生成详细验证报告...');
    
    const browser = await chromium.launch({ headless: true });
    
    try {
      const originalPage = await browser.newPage();
      const refactorPage = await browser.newPage();

      // 加载页面
      await this.loadPages(originalPage, refactorPage);
      
      // 执行测试序列
      await this.runTestSequence(originalPage, refactorPage);
      
      // 生成HTML报告
      await this.generateHTMLReport();
      
      console.log('✅ 详细验证报告生成完成！');
      console.log('📄 报告位置: tests/regression/report.html');
      
    } finally {
      await browser.close();
    }
  }

  async loadPages(originalPage, refactorPage) {
    const originalPath = path.resolve(__dirname, '../../docs/src-demo/index.html');
    const refactorPath = path.resolve(__dirname, '../../docs/refactor-demo/index.html');

    await originalPage.goto(`file://${originalPath}`);
    await refactorPage.goto(`file://${refactorPath}`);
    
    await Promise.all([
      originalPage.waitForTimeout(2000),
      refactorPage.waitForTimeout(2000)
    ]);
  }

  async runTestSequence(originalPage, refactorPage) {
    const testSteps = [
      { name: '初始状态', action: () => this.captureInitialState(originalPage, refactorPage) },
      { name: '第一个块拖拽', action: () => this.testFirstBlockDrag(originalPage, refactorPage) },
      { name: '第二个块吸附', action: () => this.testSecondBlockSnap(originalPage, refactorPage) },
      { name: '第三个块连接', action: () => this.testThirdBlockConnection(originalPage, refactorPage) },
      { name: '删除所有块', action: () => this.testDeletion(originalPage, refactorPage) },
      { name: '删除后重新拖拽', action: () => this.testRedragAfterDeletion(originalPage, refactorPage) },
      { name: '最终状态验证', action: () => this.captureFinalState(originalPage, refactorPage) }
    ];

    for (const step of testSteps) {
      console.log(`  🧪 执行: ${step.name}`);
      try {
        const result = await step.action();
        this.reportData.testResults.push({
          name: step.name,
          status: 'PASS',
          result: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.reportData.testResults.push({
          name: step.name,
          status: 'FAIL',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`    ❌ ${step.name}: ${error.message}`);
      }
    }
  }

  async captureInitialState(originalPage, refactorPage) {
    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('initial', originalScreenshot, refactorScreenshot);
    
    return {
      originalBlocks: await this.getBlockCount(originalPage),
      refactorBlocks: await this.getBlockCount(refactorPage)
    };
  }

  async testFirstBlockDrag(originalPage, refactorPage) {
    await Promise.all([
      this.dragBlock(originalPage, { x: 200, y: 200 }),
      this.dragBlock(refactorPage, { x: 200, y: 200 })
    ]);

    await Promise.all([
      originalPage.waitForTimeout(1000),
      refactorPage.waitForTimeout(1000)
    ]);

    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('first-block', originalScreenshot, refactorScreenshot);

    const originalBlocks = await this.getBlockCount(originalPage);
    const refactorBlocks = await this.getBlockCount(refactorPage);

    if (originalBlocks !== refactorBlocks) {
      throw new Error(`块数量不一致: 原始=${originalBlocks}, 重构=${refactorBlocks}`);
    }

    return { originalBlocks, refactorBlocks };
  }

  async testSecondBlockSnap(originalPage, refactorPage) {
    await Promise.all([
      this.dragBlock(originalPage, { x: 200, y: 300 }),
      this.dragBlock(refactorPage, { x: 200, y: 300 })
    ]);

    await Promise.all([
      originalPage.waitForTimeout(1000),
      refactorPage.waitForTimeout(1000)
    ]);

    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('second-block-snap', originalScreenshot, refactorScreenshot);

    const originalPos = await this.getSecondBlockPosition(originalPage);
    const refactorPos = await this.getSecondBlockPosition(refactorPage);

    const yDiff = Math.abs(originalPos.top - refactorPos.top);
    if (yDiff > 5) {
      throw new Error(`吸附位置不一致: 差异=${yDiff}px`);
    }

    return { originalPos, refactorPos, yDiff };
  }

  async testThirdBlockConnection(originalPage, refactorPage) {
    await Promise.all([
      this.dragBlock(originalPage, { x: 200, y: 400 }),
      this.dragBlock(refactorPage, { x: 200, y: 400 })
    ]);

    await Promise.all([
      originalPage.waitForTimeout(1000),
      refactorPage.waitForTimeout(1000)
    ]);

    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('third-block-connection', originalScreenshot, refactorScreenshot);

    return {
      originalBlocks: await this.getBlockCount(originalPage),
      refactorBlocks: await this.getBlockCount(refactorPage),
      originalConnections: await this.getConnectionCount(originalPage),
      refactorConnections: await this.getConnectionCount(refactorPage)
    };
  }

  async testDeletion(originalPage, refactorPage) {
    await Promise.all([
      this.deleteAllBlocks(originalPage),
      this.deleteAllBlocks(refactorPage)
    ]);

    await Promise.all([
      originalPage.waitForTimeout(1000),
      refactorPage.waitForTimeout(1000)
    ]);

    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('after-deletion', originalScreenshot, refactorScreenshot);

    const originalBlocks = await this.getBlockCount(originalPage);
    const refactorBlocks = await this.getBlockCount(refactorPage);

    if (originalBlocks !== 0 || refactorBlocks !== 0) {
      throw new Error(`删除失败: 原始=${originalBlocks}, 重构=${refactorBlocks}`);
    }

    return { originalBlocks, refactorBlocks };
  }

  async testRedragAfterDeletion(originalPage, refactorPage) {
    // 重新拖拽两个块
    await Promise.all([
      this.dragBlock(originalPage, { x: 200, y: 200 }),
      this.dragBlock(refactorPage, { x: 200, y: 200 })
    ]);

    await Promise.all([
      originalPage.waitForTimeout(500),
      refactorPage.waitForTimeout(500)
    ]);

    await Promise.all([
      this.dragBlock(originalPage, { x: 200, y: 300 }),
      this.dragBlock(refactorPage, { x: 200, y: 300 })
    ]);

    await Promise.all([
      originalPage.waitForTimeout(1000),
      refactorPage.waitForTimeout(1000)
    ]);

    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('redrag-after-deletion', originalScreenshot, refactorScreenshot);

    const originalPos = await this.getSecondBlockPosition(originalPage);
    const refactorPos = await this.getSecondBlockPosition(refactorPage);

    const yDiff = Math.abs(originalPos.top - refactorPos.top);
    if (yDiff > 5) {
      throw new Error(`删除后吸附失败: 差异=${yDiff}px`);
    }

    return { originalPos, refactorPos, yDiff };
  }

  async captureFinalState(originalPage, refactorPage) {
    const originalScreenshot = await originalPage.screenshot({ fullPage: true });
    const refactorScreenshot = await refactorPage.screenshot({ fullPage: true });
    
    await this.saveScreenshots('final-state', originalScreenshot, refactorScreenshot);

    const originalOutput = await this.getFlowyOutput(originalPage);
    const refactorOutput = await this.getFlowyOutput(refactorPage);

    return {
      originalOutput,
      refactorOutput,
      dataConsistent: JSON.stringify(originalOutput) === JSON.stringify(refactorOutput)
    };
  }

  async saveScreenshots(stepName, originalScreenshot, refactorScreenshot) {
    const screenshotDir = path.join(__dirname, 'screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });

    const originalPath = path.join(screenshotDir, `${stepName}-original.png`);
    const refactorPath = path.join(screenshotDir, `${stepName}-refactor.png`);

    await fs.writeFile(originalPath, originalScreenshot);
    await fs.writeFile(refactorPath, refactorScreenshot);

    this.reportData.screenshots.push({
      step: stepName,
      original: `screenshots/${stepName}-original.png`,
      refactor: `screenshots/${stepName}-refactor.png`
    });
  }

  async generateHTMLReport() {
    const passCount = this.reportData.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.reportData.testResults.filter(r => r.status === 'FAIL').length;
    
    this.reportData.summary = {
      total: this.reportData.testResults.length,
      passed: passCount,
      failed: failCount,
      successRate: (passCount / this.reportData.testResults.length) * 100
    };

    const html = this.generateHTMLContent();
    const reportPath = path.join(__dirname, 'report.html');
    await fs.writeFile(reportPath, html);
  }

  generateHTMLContent() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flowy 功能一致性验证报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card.success { background: #d4edda; color: #155724; }
        .summary-card.warning { background: #fff3cd; color: #856404; }
        .summary-card.danger { background: #f8d7da; color: #721c24; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
        .test-result.pass { border-left-color: #28a745; background: #d4edda; }
        .test-result.fail { border-left-color: #dc3545; background: #f8d7da; }
        .screenshot-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
        .screenshot-item { text-align: center; }
        .screenshot-item img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Flowy 功能一致性验证报告</h1>
            <p class="timestamp">生成时间: ${this.reportData.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card ${this.reportData.summary.successRate === 100 ? 'success' : 'warning'}">
                <h3>总体成功率</h3>
                <h2>${this.reportData.summary.successRate.toFixed(1)}%</h2>
            </div>
            <div class="summary-card success">
                <h3>通过测试</h3>
                <h2>${this.reportData.summary.passed}</h2>
            </div>
            <div class="summary-card ${this.reportData.summary.failed > 0 ? 'danger' : 'success'}">
                <h3>失败测试</h3>
                <h2>${this.reportData.summary.failed}</h2>
            </div>
            <div class="summary-card">
                <h3>总测试数</h3>
                <h2>${this.reportData.summary.total}</h2>
            </div>
        </div>

        <h2>📋 详细测试结果</h2>
        ${this.reportData.testResults.map(test => `
            <div class="test-result ${test.status.toLowerCase()}">
                <h3>${test.status === 'PASS' ? '✅' : '❌'} ${test.name}</h3>
                <p class="timestamp">${test.timestamp}</p>
                ${test.error ? `<p><strong>错误:</strong> ${test.error}</p>` : ''}
                ${test.result ? `<pre>${JSON.stringify(test.result, null, 2)}</pre>` : ''}
            </div>
        `).join('')}

        <h2>📸 截图对比</h2>
        ${this.reportData.screenshots.map(screenshot => `
            <div class="screenshot-comparison">
                <div class="screenshot-item">
                    <h4>原始版本 (${screenshot.step})</h4>
                    <img src="${screenshot.original}" alt="原始版本 ${screenshot.step}">
                </div>
                <div class="screenshot-item">
                    <h4>重构版本 (${screenshot.step})</h4>
                    <img src="${screenshot.refactor}" alt="重构版本 ${screenshot.step}">
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  // 辅助方法
  async dragBlock(page, position) {
    const firstBlock = await page.locator('.create-flowy').first();
    await firstBlock.dragTo(page.locator('#canvas'), { targetPosition: position });
  }

  async getBlockCount(page) {
    return await page.evaluate(() => document.querySelectorAll('.block').length);
  }

  async getConnectionCount(page) {
    return await page.evaluate(() => document.querySelectorAll('.arrowblock').length);
  }

  async getSecondBlockPosition(page) {
    return await page.evaluate(() => {
      const blocks = document.querySelectorAll('.block');
      if (blocks.length >= 2) {
        const block = blocks[1];
        return {
          left: parseInt(block.style.left) || block.getBoundingClientRect().left,
          top: parseInt(block.style.top) || block.getBoundingClientRect().top
        };
      }
      return null;
    });
  }

  async deleteAllBlocks(page) {
    const firstBlock = await page.locator('.block').first();
    if (await firstBlock.count() > 0) {
      await firstBlock.click();
      await page.waitForTimeout(500);
      
      const deleteButton = await page.locator('#removeblock');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.waitForTimeout(500);
      }
    }
  }

  async getFlowyOutput(page) {
    return await page.evaluate(() => {
      try {
        if (typeof window.flowy !== 'undefined' && window.flowy.output) {
          return window.flowy.output();
        }
        return null;
      } catch (e) {
        return 'error: ' + e.message;
      }
    });
  }
}

// 执行报告生成
if (import.meta.url === `file://${process.argv[1]}`) {
  const reporter = new DetailedVerificationReport();
  reporter.generateReport().catch(console.error);
}

export default DetailedVerificationReport;
