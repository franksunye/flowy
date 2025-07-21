/**
 * Flowy 拖拽性能测试
 * 测试拖拽操作的性能指标，确保重构不会降低性能
 */

const { chromium } = require('playwright');
const TEST_CONFIG = require('../test-config');

class DragPerformanceTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.performanceMetrics = {};
  }

  async runPerformanceTests() {
    console.log('🚀 Flowy 拖拽性能测试');
    console.log('==========================================');

    try {
      await this.setupBrowser();
      await this.navigateToApp();
      await this.runPerformanceTestSuite();
      this.generatePerformanceReport();
    } catch (error) {
      console.error('❌ 性能测试失败:', error);
    } finally {
      await this.cleanup();
    }
  }

  async setupBrowser() {
    console.log('🔧 启动浏览器...');
    this.browser = await chromium.launch({
      headless: true, // 性能测试使用无头模式
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    this.page = await this.browser.newPage();

    // 启用性能监控
    await this.page.coverage.startJSCoverage();

    console.log('✅ 浏览器启动成功');
  }

  async navigateToApp() {
    console.log(`📱 导航到: ${TEST_CONFIG.target.url}`);
    await this.page.goto(TEST_CONFIG.target.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await this.page.waitForSelector('#canvas', { timeout: 10000 });
    await this.page.waitForSelector('.create-flowy', { timeout: 10000 });

    console.log('✅ 应用加载完成');
  }

  async runPerformanceTestSuite() {
    console.log('\n🧪 开始性能测试套件...');

    // 1. 单次拖拽性能测试
    await this.testSingleDragPerformance();

    // 2. 连续拖拽性能测试
    await this.testContinuousDragPerformance();

    // 3. 大量块拖拽性能测试
    await this.testMassBlockDragPerformance();

    // 4. 内存使用测试
    await this.testMemoryUsage();

    // 5. 渲染性能测试
    await this.testRenderingPerformance();
  }

  async testSingleDragPerformance() {
    console.log('\n🎯 单次拖拽性能测试...');

    const iterations = 10;
    const dragTimes = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();

      // 执行拖拽操作
      await this.performSingleDrag();

      const endTime = Date.now();
      const dragTime = endTime - startTime;
      dragTimes.push(dragTime);

      console.log(`   拖拽 ${i + 1}: ${dragTime}ms`);

      // 清理画布
      await this.clearCanvas();
      await this.page.waitForTimeout(100);
    }

    const avgDragTime = dragTimes.reduce((a, b) => a + b, 0) / dragTimes.length;
    const maxDragTime = Math.max(...dragTimes);
    const minDragTime = Math.min(...dragTimes);

    this.performanceMetrics.singleDrag = {
      average: avgDragTime,
      max: maxDragTime,
      min: minDragTime,
      samples: dragTimes,
    };

    console.log(`   📊 平均拖拽时间: ${avgDragTime.toFixed(2)}ms`);
    console.log(`   📊 最大拖拽时间: ${maxDragTime}ms`);
    console.log(`   📊 最小拖拽时间: ${minDragTime}ms`);
  }

  async testContinuousDragPerformance() {
    console.log('\n🔄 连续拖拽性能测试...');

    const blockCount = 5;
    const startTime = Date.now();

    // 连续创建多个块
    for (let i = 0; i < blockCount; i++) {
      await this.performSingleDrag(i * 150 + 200, i * 100 + 150);
      await this.page.waitForTimeout(50); // 短暂间隔
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTimePerBlock = totalTime / blockCount;

    this.performanceMetrics.continuousDrag = {
      totalTime,
      blockCount,
      averagePerBlock: avgTimePerBlock,
    };

    console.log(`   📊 总时间: ${totalTime}ms`);
    console.log(`   📊 平均每块: ${avgTimePerBlock.toFixed(2)}ms`);

    await this.clearCanvas();
  }

  async testMassBlockDragPerformance() {
    console.log('\n🏗️ 大量块拖拽性能测试...');

    const blockCount = 20;
    const startTime = Date.now();

    // 创建大量块
    for (let i = 0; i < blockCount; i++) {
      const x = (i % 5) * 150 + 200;
      const y = Math.floor(i / 5) * 100 + 150;
      await this.performSingleDrag(x, y);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 测试在大量块存在时的拖拽性能
    const additionalDragStart = Date.now();
    await this.performSingleDrag(400, 500);
    const additionalDragTime = Date.now() - additionalDragStart;

    this.performanceMetrics.massBlockDrag = {
      creationTime: totalTime,
      blockCount,
      additionalDragTime,
    };

    console.log(`   📊 创建${blockCount}个块用时: ${totalTime}ms`);
    console.log(`   📊 在大量块环境下拖拽用时: ${additionalDragTime}ms`);

    await this.clearCanvas();
  }

  async testMemoryUsage() {
    console.log('\n💾 内存使用测试...');

    // 获取初始内存使用
    const initialMetrics = await this.page.metrics();

    // 创建多个块
    for (let i = 0; i < 10; i++) {
      await this.performSingleDrag(i * 100 + 200, 200);
    }

    // 获取创建块后的内存使用
    const afterCreationMetrics = await this.page.metrics();

    // 清理块
    await this.clearCanvas();

    // 获取清理后的内存使用
    const afterCleanupMetrics = await this.page.metrics();

    this.performanceMetrics.memory = {
      initial: initialMetrics.JSHeapUsedSize,
      afterCreation: afterCreationMetrics.JSHeapUsedSize,
      afterCleanup: afterCleanupMetrics.JSHeapUsedSize,
      creationIncrease:
        afterCreationMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize,
      cleanupEfficiency:
        (afterCreationMetrics.JSHeapUsedSize -
          afterCleanupMetrics.JSHeapUsedSize) /
        (afterCreationMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize),
    };

    console.log(
      `   📊 初始内存: ${(initialMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   📊 创建后内存: ${(afterCreationMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   📊 清理后内存: ${(afterCleanupMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   📊 清理效率: ${(this.performanceMetrics.memory.cleanupEfficiency * 100).toFixed(1)}%`
    );
  }

  async testRenderingPerformance() {
    console.log('\n🎨 渲染性能测试...');

    // 启用性能追踪
    await this.page.tracing.start({ screenshots: false, snapshots: false });

    // 执行拖拽操作
    await this.performSingleDrag();

    // 停止追踪
    const traceBuffer = await this.page.tracing.stop();

    // 分析渲染性能（简化版本）
    this.performanceMetrics.rendering = {
      traceSize: traceBuffer.length,
      hasTrace: traceBuffer.length > 0,
    };

    console.log(
      `   📊 追踪数据大小: ${(traceBuffer.length / 1024).toFixed(2)}KB`
    );

    await this.clearCanvas();
  }

  async performSingleDrag(targetX = 200, targetY = 200) {
    const sourceElement = this.page.locator('.create-flowy:nth-child(1)');
    const canvas = this.page.locator('#canvas');

    const sourceBox = await sourceElement.first().boundingBox();
    const canvasBox = await canvas.boundingBox();

    if (!sourceBox || !canvasBox) {
      throw new Error('无法获取元素位置信息');
    }

    const startX = sourceBox.x + sourceBox.width / 2;
    const startY = sourceBox.y + sourceBox.height / 2;
    const endX = canvasBox.x + targetX;
    const endY = canvasBox.y + targetY;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY);
    await this.page.mouse.up();

    await this.page.waitForTimeout(500); // 等待吸附完成
  }

  async clearCanvas() {
    await this.page.evaluate(() => {
      if (
        typeof flowy !== 'undefined' &&
        typeof flowy.deleteBlocks === 'function'
      ) {
        flowy.deleteBlocks();
      }
    });
    await this.page.waitForTimeout(200);
  }

  generatePerformanceReport() {
    console.log('\n📋 性能测试报告');
    console.log('==========================================');

    const metrics = this.performanceMetrics;

    // 性能基准检查
    const benchmarks = {
      singleDragMax: 1000, // 单次拖拽不超过1秒
      averageDragMax: 500, // 平均拖拽不超过500ms
      memoryLeakThreshold: 0.1, // 内存泄漏阈值10%
    };

    console.log('📊 性能指标:');

    if (metrics.singleDrag) {
      const avgPass = metrics.singleDrag.average <= benchmarks.averageDragMax;
      const maxPass = metrics.singleDrag.max <= benchmarks.singleDragMax;

      console.log(
        `   ✅ 单次拖拽平均时间: ${metrics.singleDrag.average.toFixed(2)}ms ${avgPass ? '✅' : '❌'}`
      );
      console.log(
        `   ✅ 单次拖拽最大时间: ${metrics.singleDrag.max}ms ${maxPass ? '✅' : '❌'}`
      );
    }

    if (metrics.memory) {
      const memoryLeakPass =
        metrics.memory.cleanupEfficiency >= 1 - benchmarks.memoryLeakThreshold;
      console.log(
        `   💾 内存清理效率: ${(metrics.memory.cleanupEfficiency * 100).toFixed(1)}% ${memoryLeakPass ? '✅' : '❌'}`
      );
    }

    console.log('\n🎯 性能结论:');
    const allTestsPass = this.checkAllBenchmarks(benchmarks);
    if (allTestsPass) {
      console.log('✅ 所有性能测试通过，可以安全进行重构');
    } else {
      console.log('❌ 部分性能测试未通过，需要优化后再进行重构');
    }
  }

  checkAllBenchmarks(benchmarks) {
    const metrics = this.performanceMetrics;

    if (metrics.singleDrag) {
      if (metrics.singleDrag.average > benchmarks.averageDragMax) {
        return false;
      }
      if (metrics.singleDrag.max > benchmarks.singleDragMax) {
        return false;
      }
    }

    if (metrics.memory) {
      if (
        metrics.memory.cleanupEfficiency <
        1 - benchmarks.memoryLeakThreshold
      ) {
        return false;
      }
    }

    return true;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🔚 性能测试完成，浏览器已关闭');
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const test = new DragPerformanceTest();
  test.runPerformanceTests().catch(console.error);
}

module.exports = DragPerformanceTest;
