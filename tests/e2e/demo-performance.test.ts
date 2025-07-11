import { test, expect } from '@playwright/test';
import { DemoPage } from './pages/demo-page';

/**
 * 🚀 Flowy Demo 性能测试
 *
 * 测试覆盖范围：
 * 1. 页面加载性能
 * 2. 大量节点创建性能
 * 3. 撤销重做性能
 * 4. 内存使用情况
 * 5. 响应时间测试
 */

test.describe('🚀 Flowy Demo - 性能测试', () => {
  let demoPage: DemoPage;

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page);
  });

  test('⚡ 页面加载性能测试', async ({ page }) => {
    // 开始性能监控
    const startTime = Date.now();

    await demoPage.goto();
    await demoPage.waitForPageLoad();

    const loadTime = Date.now() - startTime;

    // 验证页面在合理时间内加载完成（< 3秒）
    expect(loadTime).toBeLessThan(3000);

    // 验证关键元素都已加载
    await expect(demoPage.canvas).toBeVisible();
    await expect(demoPage.statusPanel).toBeVisible();
    await expect(demoPage.undoButton).toBeVisible();

    console.log(`页面加载时间: ${loadTime}ms`);
  });

  test('🎨 批量节点创建性能测试', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    const nodeCount = 10; // 创建10个节点
    const startTime = Date.now();

    // 批量创建节点
    for (let i = 0; i < nodeCount; i++) {
      const x = 300 + (i % 5) * 150;
      const y = 200 + Math.floor(i / 5) * 100;
      await demoPage.dragCreateNode(i % 4, x, y);
    }

    const creationTime = Date.now() - startTime;

    // 验证所有节点都创建成功
    const actualNodes = await demoPage.getNodesInCanvas();
    expect(actualNodes).toBe(nodeCount);

    // 验证创建时间合理（< 15秒）
    expect(creationTime).toBeLessThan(15000);

    // 验证状态面板正确更新
    const status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe(nodeCount.toString());

    console.log(`创建 ${nodeCount} 个节点耗时: ${creationTime}ms`);
    console.log(`平均每个节点: ${creationTime / nodeCount}ms`);
  });

  test('🔄 撤销重做性能测试', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    // 先创建一些节点
    const nodeCount = 5;
    for (let i = 0; i < nodeCount; i++) {
      await demoPage.dragCreateNode(i % 4, 300 + i * 100, 200);
    }

    // 测试撤销性能
    const undoStartTime = Date.now();
    for (let i = 0; i < nodeCount; i++) {
      await demoPage.clickUndo();
    }
    const undoTime = Date.now() - undoStartTime;

    // 验证所有节点都被撤销
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    // 测试重做性能
    const redoStartTime = Date.now();
    for (let i = 0; i < nodeCount; i++) {
      await demoPage.clickRedo();
    }
    const redoTime = Date.now() - redoStartTime;

    // 验证所有节点都被重做
    expect(await demoPage.getNodesInCanvas()).toBe(nodeCount);

    // 验证性能指标
    expect(undoTime).toBeLessThan(5000); // 撤销应该很快
    expect(redoTime).toBeLessThan(5000); // 重做应该很快

    console.log(`撤销 ${nodeCount} 个操作耗时: ${undoTime}ms`);
    console.log(`重做 ${nodeCount} 个操作耗时: ${redoTime}ms`);
  });

  test('⌨️ 键盘快捷键响应性能', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    // 创建测试数据
    await demoPage.dragCreateNode(0, 400, 200);
    await demoPage.dragCreateNode(1, 600, 300);

    // 测试键盘撤销性能
    const keyboardUndoStart = Date.now();
    await demoPage.keyboardUndo();
    const keyboardUndoTime = Date.now() - keyboardUndoStart;

    // 测试键盘重做性能
    const keyboardRedoStart = Date.now();
    await demoPage.keyboardRedo();
    const keyboardRedoTime = Date.now() - keyboardRedoStart;

    // 键盘操作应该非常快（< 1秒）
    expect(keyboardUndoTime).toBeLessThan(1000);
    expect(keyboardRedoTime).toBeLessThan(1000);

    console.log(`键盘撤销响应时间: ${keyboardUndoTime}ms`);
    console.log(`键盘重做响应时间: ${keyboardRedoTime}ms`);
  });

  test('📊 状态面板更新性能', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    const updateCount = 8;
    const startTime = Date.now();

    // 执行多次操作，观察状态面板更新性能
    for (let i = 0; i < updateCount; i++) {
      await demoPage.dragCreateNode(i % 4, 300 + i * 80, 200);

      // 验证状态面板实时更新
      const status = await demoPage.getStatusData();
      expect(status.nodeCount).toBe((i + 1).toString());
    }

    const totalTime = Date.now() - startTime;

    // 验证状态更新不会显著影响性能
    expect(totalTime).toBeLessThan(20000); // 20秒内完成

    console.log(`${updateCount} 次状态更新总耗时: ${totalTime}ms`);
    console.log(`平均每次更新: ${totalTime / updateCount}ms`);
  });

  test('💾 数据导出性能测试', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    // 创建较多数据用于导出测试
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      await demoPage.dragCreateNode(
        i % 4,
        300 + (i % 4) * 120,
        200 + Math.floor(i / 4) * 100
      );
    }

    // 测试导出性能
    const exportStartTime = Date.now();
    const download = await demoPage.exportData();
    const exportTime = Date.now() - exportStartTime;

    // 验证导出成功
    expect(download.suggestedFilename()).toBe('flowy-diagram.json');

    // 导出应该很快（< 2秒）
    expect(exportTime).toBeLessThan(2000);

    console.log(`导出 ${nodeCount} 个节点耗时: ${exportTime}ms`);
  });

  test('🔄 内存使用稳定性测试', async ({ page }) => {
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    // 执行大量操作来测试内存稳定性
    const cycles = 3;
    const nodesPerCycle = 5;

    for (let cycle = 0; cycle < cycles; cycle++) {
      console.log(`执行第 ${cycle + 1} 轮内存测试...`);

      // 创建节点
      for (let i = 0; i < nodesPerCycle; i++) {
        await demoPage.dragCreateNode(i % 4, 300 + i * 100, 200);
      }

      // 撤销所有操作
      for (let i = 0; i < nodesPerCycle; i++) {
        await demoPage.clickUndo();
      }

      // 重做所有操作
      for (let i = 0; i < nodesPerCycle; i++) {
        await demoPage.clickRedo();
      }

      // 最终清理
      for (let i = 0; i < nodesPerCycle; i++) {
        await demoPage.clickUndo();
      }

      // 验证状态重置
      expect(await demoPage.getNodesInCanvas()).toBe(0);
      const status = await demoPage.getStatusData();
      expect(status.nodeCount).toBe('0');
    }

    console.log(`完成 ${cycles} 轮内存稳定性测试`);
  });

  test('📱 响应式性能测试', async ({ page }) => {
    // 测试不同屏幕尺寸下的性能
    const viewports = [
      { width: 1920, height: 1080, name: '桌面大屏' },
      { width: 1366, height: 768, name: '桌面标准' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手机' },
    ];

    for (const viewport of viewports) {
      console.log(
        `测试 ${viewport.name} (${viewport.width}x${viewport.height})`
      );

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      const startTime = Date.now();
      await demoPage.goto();
      await demoPage.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      // 在不同屏幕尺寸下都应该快速加载
      expect(loadTime).toBeLessThan(4000);

      // 验证关键功能在不同尺寸下都可用
      await demoPage.closeFeatureModal();
      await demoPage.dragCreateNode(
        0,
        Math.min(400, viewport.width - 200),
        200
      );
      expect(await demoPage.getNodesInCanvas()).toBe(1);

      console.log(`${viewport.name} 加载时间: ${loadTime}ms`);
    }
  });
});
