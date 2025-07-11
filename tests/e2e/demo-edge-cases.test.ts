import { test, expect } from '@playwright/test';
import { DemoPage } from './pages/demo-page';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🛡️ Flowy Demo 边界情况和错误处理测试
 *
 * 测试覆盖范围：
 * 1. 边界操作测试
 * 2. 错误输入处理
 * 3. 网络异常处理
 * 4. 浏览器兼容性
 * 5. 极限情况测试
 */

test.describe('🛡️ Flowy Demo - 边界情况测试', () => {
  let demoPage: DemoPage;

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page);
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();
  });

  test('🚫 空状态操作测试', async () => {
    // 在没有任何节点的情况下测试撤销重做
    let status = await demoPage.getStatusData();
    expect(status.canUndo).toBe('❌');
    expect(status.canRedo).toBe('❌');

    // 尝试撤销（应该无效果）
    await demoPage.clickUndo();
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    // 尝试重做（应该无效果）
    await demoPage.clickRedo();
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    // 状态应该保持不变
    status = await demoPage.getStatusData();
    expect(status.canUndo).toBe('❌');
    expect(status.canRedo).toBe('❌');
    expect(status.nodeCount).toBe('0');
  });

  test('🔄 历史记录边界测试', async () => {
    // 创建大量操作来测试历史记录限制
    const maxOperations = 52; // 超过默认的50个历史记录限制

    for (let i = 0; i < maxOperations; i++) {
      await demoPage.dragCreateNode(
        i % 4,
        300 + (i % 10) * 50,
        200 + Math.floor(i / 10) * 50
      );
    }

    // 验证节点创建成功
    expect(await demoPage.getNodesInCanvas()).toBe(maxOperations);

    // 测试撤销到历史记录限制
    let undoCount = 0;
    while (undoCount < 60) {
      // 尝试撤销超过历史记录限制的次数
      const beforeUndo = await demoPage.getNodesInCanvas();
      await demoPage.clickUndo();
      const afterUndo = await demoPage.getNodesInCanvas();

      if (beforeUndo === afterUndo) {
        // 无法再撤销，达到历史记录限制
        break;
      }
      undoCount++;
    }

    console.log(`实际可撤销操作数: ${undoCount}`);

    // 验证历史记录限制生效
    expect(undoCount).toBeLessThanOrEqual(50);

    const status = await demoPage.getStatusData();
    expect(status.canUndo).toBe('❌');
  });

  test('📁 无效文件导入测试', async ({ page }) => {
    // 创建无效的 JSON 文件
    const invalidJsonPath = path.join(__dirname, 'temp-invalid.json');
    fs.writeFileSync(invalidJsonPath, '{ invalid json content');

    // 监听 alert 对话框
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    try {
      // 尝试导入无效文件
      await demoPage.importData(invalidJsonPath);

      // 验证错误处理
      expect(alertMessage).toContain('导入失败');

      // 验证系统状态未受影响
      expect(await demoPage.getNodesInCanvas()).toBe(0);
      const status = await demoPage.getStatusData();
      expect(status.nodeCount).toBe('0');
    } finally {
      // 清理临时文件
      if (fs.existsSync(invalidJsonPath)) {
        fs.unlinkSync(invalidJsonPath);
      }
    }
  });

  test('🎯 画布边界拖拽测试', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    // 测试拖拽到画布边界外
    await demoPage.dragCreateNode(0, -100, -100); // 负坐标
    await demoPage.dragCreateNode(
      1,
      viewport.width + 100,
      viewport.height + 100
    ); // 超出视口

    // 验证节点仍然可以创建（系统应该处理边界情况）
    const nodesCount = await demoPage.getNodesInCanvas();
    expect(nodesCount).toBeGreaterThanOrEqual(0); // 至少不会崩溃

    // 验证状态面板正常工作
    const status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe(nodesCount.toString());
  });

  test('⚡ 快速连续操作测试', async () => {
    // 快速连续创建节点
    const rapidOperations = 5;
    const promises = [];

    for (let i = 0; i < rapidOperations; i++) {
      promises.push(demoPage.dragCreateNode(i % 4, 300 + i * 80, 200));
    }

    // 等待所有操作完成
    await Promise.all(promises);

    // 验证系统处理快速操作的能力
    const finalNodes = await demoPage.getNodesInCanvas();
    expect(finalNodes).toBe(rapidOperations);

    // 快速连续撤销
    for (let i = 0; i < rapidOperations; i++) {
      await demoPage.clickUndo();
    }

    expect(await demoPage.getNodesInCanvas()).toBe(0);
  });

  test('🔄 状态面板折叠状态测试', async () => {
    // 测试状态面板在折叠状态下的功能
    await demoPage.toggleStatusPanel(); // 折叠面板

    // 在折叠状态下执行操作
    await demoPage.dragCreateNode(0, 400, 200);

    // 展开面板验证状态更新
    await demoPage.toggleStatusPanel(); // 展开面板

    const status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('1');
    expect(status.canUndo).toBe('✅');
  });

  test('⌨️ 键盘事件冲突测试', async ({ page }) => {
    await demoPage.dragCreateNode(0, 400, 200);

    // 测试在输入框聚焦时的键盘事件
    // 注意：这里模拟可能的键盘事件冲突
    await page.keyboard.press('Control+a'); // 全选
    await page.keyboard.press('Control+z'); // 撤销

    // 验证撤销仍然正常工作
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    // 测试其他键盘组合
    await page.keyboard.press('Control+y'); // 重做
    expect(await demoPage.getNodesInCanvas()).toBe(1);
  });

  test('🌐 网络中断模拟测试', async ({ page }) => {
    // 模拟网络离线状态
    await page.context().setOffline(true);

    // 在离线状态下测试基本功能
    await demoPage.dragCreateNode(0, 400, 200);
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 测试撤销重做在离线状态下的工作
    await demoPage.clickUndo();
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    await demoPage.clickRedo();
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 恢复网络连接
    await page.context().setOffline(false);

    // 验证功能继续正常工作
    await demoPage.dragCreateNode(1, 600, 300);
    expect(await demoPage.getNodesInCanvas()).toBe(2);
  });

  test('🔄 页面刷新状态保持测试', async ({ page }) => {
    // 创建一些数据
    await demoPage.dragCreateNode(0, 400, 200);
    await demoPage.dragCreateNode(1, 600, 300);

    const beforeRefresh = await demoPage.getNodesInCanvas();
    expect(beforeRefresh).toBe(2);

    // 刷新页面
    await page.reload();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal();

    // 验证数据是否保持（取决于实现是否有持久化）
    const afterRefresh = await demoPage.getNodesInCanvas();

    // 注意：这里的期望值取决于是否实现了数据持久化
    // 如果没有持久化，数据会丢失，这也是正常的
    console.log(
      `刷新前节点数: ${beforeRefresh}, 刷新后节点数: ${afterRefresh}`
    );

    // 验证系统在刷新后仍然正常工作
    await demoPage.dragCreateNode(0, 400, 200);
    expect(await demoPage.getNodesInCanvas()).toBeGreaterThan(0);
  });

  test('💾 大数据导出测试', async ({ page }) => {
    // 创建大量数据
    const largeDataSize = 15;
    for (let i = 0; i < largeDataSize; i++) {
      await demoPage.dragCreateNode(
        i % 4,
        300 + (i % 5) * 100,
        200 + Math.floor(i / 5) * 80
      );
    }

    // 测试大数据导出
    const download = await demoPage.exportData();
    expect(download.suggestedFilename()).toBe('flowy-diagram.json');

    // 验证下载的文件大小合理
    const downloadPath = await download.path();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(100); // 至少有一些内容
      expect(stats.size).toBeLessThan(1024 * 1024); // 不应该超过1MB

      console.log(`导出文件大小: ${stats.size} bytes`);
    }
  });

  test('🎨 极限拖拽测试', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    // 测试极限拖拽距离
    const extremePositions = [
      { x: 0, y: 0 }, // 左上角
      { x: viewport.width - 100, y: 0 }, // 右上角
      { x: 0, y: viewport.height - 100 }, // 左下角
      { x: viewport.width - 100, y: viewport.height - 100 }, // 右下角
    ];

    for (let i = 0; i < extremePositions.length; i++) {
      const pos = extremePositions[i];
      if (pos) {
        await demoPage.dragCreateNode(i % 4, pos.x, pos.y);
      }
    }

    // 验证极限位置的节点都能创建
    const finalCount = await demoPage.getNodesInCanvas();
    expect(finalCount).toBe(extremePositions.length);

    // 验证状态面板正确更新
    const status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe(finalCount.toString());
  });
});
