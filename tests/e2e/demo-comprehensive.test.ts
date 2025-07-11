import { test, expect } from '@playwright/test';
import { DemoPage } from './pages/demo-page';

/**
 * 🎭 Flowy Demo 综合端到端测试
 *
 * 测试覆盖范围：
 * 1. 页面加载和基础 UI
 * 2. 新架构功能展示
 * 3. 拖拽创建节点
 * 4. 撤销重做功能
 * 5. 数据导入导出
 * 6. 状态面板实时更新
 * 7. 键盘快捷键
 * 8. 响应式设计
 */

test.describe('🎯 Flowy Demo - 新架构功能测试', () => {
  let demoPage: DemoPage;

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page);
    await demoPage.goto();
    await demoPage.waitForPageLoad();
    await demoPage.closeFeatureModal(); // 关闭介绍弹窗
  });

  test('📱 页面加载和基础 UI 验证', async () => {
    // 验证页面标题显示新架构信息
    await demoPage.verifyTitle();

    // 验证新功能按钮存在
    await demoPage.verifyNewFeatureButtons();

    // 验证状态面板显示
    await demoPage.verifyStatusPanel();

    // 验证画布和侧边栏存在
    await expect(demoPage.canvas).toBeVisible();
    await expect(demoPage.leftCard).toBeVisible();
    await expect(demoPage.blockList).toBeVisible();
  });

  test('🎉 功能介绍弹窗测试', async ({ page }) => {
    // 重新加载页面以触发弹窗
    await page.reload();
    await demoPage.waitForPageLoad();

    // 验证弹窗显示
    await expect(demoPage.featureModal).toBeVisible();

    // 验证弹窗内容
    await expect(demoPage.featureModal).toContainText(
      'Sprint 3 Completed Features'
    );
    await expect(demoPage.featureModal).toContainText('147/147 tests passing');

    // 关闭弹窗
    await demoPage.closeFeatureModal();
    await expect(demoPage.featureModal).toBeHidden();
  });

  test('🎨 拖拽创建节点功能', async () => {
    // 获取初始状态
    const initialStatus = await demoPage.getStatusData();
    expect(initialStatus.nodeCount).toBe('0');

    // 拖拽创建第一个节点
    await demoPage.dragCreateNode(0, 400, 200);

    // 验证节点创建成功
    const nodesInCanvas = await demoPage.getNodesInCanvas();
    expect(nodesInCanvas).toBe(1);

    // 验证状态面板更新
    const updatedStatus = await demoPage.getStatusData();
    expect(updatedStatus.nodeCount).toBe('1');
    expect(updatedStatus.canUndo).toBe('✅');

    // 创建第二个节点
    await demoPage.dragCreateNode(1, 600, 300);

    // 验证多个节点
    const finalNodes = await demoPage.getNodesInCanvas();
    expect(finalNodes).toBe(2);

    const finalStatus = await demoPage.getStatusData();
    expect(finalStatus.nodeCount).toBe('2');
  });

  test('🔄 撤销重做功能测试', async () => {
    // 创建一个节点
    await demoPage.dragCreateNode(0, 400, 200);
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 测试撤销按钮
    await demoPage.clickUndo();
    expect(await demoPage.getNodesInCanvas()).toBe(0);

    // 验证状态更新
    let status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('0');
    expect(status.canRedo).toBe('✅');
    expect(status.canUndo).toBe('❌');

    // 测试重做按钮
    await demoPage.clickRedo();
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 验证状态恢复
    status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('1');
    expect(status.canUndo).toBe('✅');
  });

  test('⌨️ 键盘快捷键测试', async () => {
    // 创建节点
    await demoPage.dragCreateNode(0, 400, 200);
    await demoPage.dragCreateNode(1, 600, 300);
    expect(await demoPage.getNodesInCanvas()).toBe(2);

    // 使用 Ctrl+Z 撤销
    await demoPage.keyboardUndo();
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 使用 Ctrl+Y 重做
    await demoPage.keyboardRedo();
    expect(await demoPage.getNodesInCanvas()).toBe(2);

    // 连续撤销
    await demoPage.keyboardUndo();
    await demoPage.keyboardUndo();
    expect(await demoPage.getNodesInCanvas()).toBe(0);
  });

  test('📊 状态面板实时更新测试', async () => {
    // 初始状态验证
    let status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('0');
    expect(status.connectionCount).toBe('0');
    expect(status.canUndo).toBe('❌');
    expect(status.canRedo).toBe('❌');

    // 创建节点后状态更新
    await demoPage.dragCreateNode(0, 400, 200);
    status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('1');
    expect(status.canUndo).toBe('✅');

    // 撤销后状态更新
    await demoPage.clickUndo();
    status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('0');
    expect(status.canUndo).toBe('❌');
    expect(status.canRedo).toBe('✅');

    // 测试状态面板折叠/展开
    await demoPage.toggleStatusPanel();
    // 验证面板仍然可见（只是内容折叠）
    await expect(demoPage.statusPanel).toBeVisible();
  });

  test('💾 数据导出功能测试', async () => {
    // 创建一些测试数据
    await demoPage.dragCreateNode(0, 400, 200);
    await demoPage.dragCreateNode(1, 600, 300);

    // 测试导出功能
    const download = await demoPage.exportData();

    // 验证下载文件
    expect(download.suggestedFilename()).toBe('flowy-diagram.json');

    // 保存并验证文件内容
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('🔄 完整用户工作流测试', async () => {
    // 模拟完整的用户操作流程

    // 1. 创建多个节点
    await demoPage.dragCreateNode(0, 300, 150); // New visitor
    await demoPage.dragCreateNode(1, 500, 250); // Action performed
    await demoPage.dragCreateNode(2, 700, 350); // Time passed

    // 验证创建结果
    expect(await demoPage.getNodesInCanvas()).toBe(3);
    let status = await demoPage.getStatusData();
    expect(status.nodeCount).toBe('3');

    // 2. 测试撤销操作
    await demoPage.clickUndo(); // 撤销最后一个节点
    expect(await demoPage.getNodesInCanvas()).toBe(2);

    await demoPage.clickUndo(); // 再撤销一个
    expect(await demoPage.getNodesInCanvas()).toBe(1);

    // 3. 测试重做操作
    await demoPage.clickRedo(); // 重做一个节点
    expect(await demoPage.getNodesInCanvas()).toBe(2);

    // 4. 添加新节点（这会清除重做历史）
    await demoPage.dragCreateNode(3, 800, 400); // Error prompt
    expect(await demoPage.getNodesInCanvas()).toBe(3);

    // 验证重做不再可用
    status = await demoPage.getStatusData();
    expect(status.canRedo).toBe('❌');

    // 5. 导出最终数据
    const download = await demoPage.exportData();
    expect(download.suggestedFilename()).toBe('flowy-diagram.json');

    // 6. 验证最终状态
    const finalStatus = await demoPage.getStatusData();
    expect(finalStatus.nodeCount).toBe('3');
    expect(finalStatus.canUndo).toBe('✅');
  });

  test('📱 响应式设计测试', async ({ page }) => {
    // 测试不同屏幕尺寸
    await page.setViewportSize({ width: 768, height: 1024 }); // 平板
    await demoPage.verifyNewFeatureButtons();
    await demoPage.verifyStatusPanel();

    await page.setViewportSize({ width: 375, height: 667 }); // 手机
    await demoPage.verifyTitle();

    // 在小屏幕上创建节点
    await demoPage.dragCreateNode(0, 200, 150);
    expect(await demoPage.getNodesInCanvas()).toBe(1);
  });
});
