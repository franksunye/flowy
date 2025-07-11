import { Page, Locator, expect } from '@playwright/test';

/**
 * Demo 页面对象模型
 * 封装所有页面元素和操作，提供清晰的测试接口
 */
export class DemoPage {
  readonly page: Page;

  // 页面元素定位器
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly canvas: Locator;
  readonly leftCard: Locator;
  readonly blockList: Locator;

  // 新架构功能按钮
  readonly undoButton: Locator;
  readonly redoButton: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;
  readonly fileInput: Locator;

  // 状态面板
  readonly statusPanel: Locator;
  readonly statusToggle: Locator;
  readonly historyCount: Locator;
  readonly nodeCount: Locator;
  readonly connectionCount: Locator;
  readonly canUndo: Locator;
  readonly canRedo: Locator;
  readonly performanceMode: Locator;

  // 功能弹窗
  readonly featureModal: Locator;
  readonly modalClose: Locator;

  // 拖拽元素
  readonly blockElements: Locator;
  readonly grabHandles: Locator;

  constructor(page: Page) {
    this.page = page;

    // 基础页面元素
    this.title = page.locator('#title');
    this.subtitle = page.locator('#subtitle');
    this.canvas = page.locator('#canvas');
    this.leftCard = page.locator('#leftcard');
    this.blockList = page.locator('#blocklist');

    // 新功能按钮
    this.undoButton = page.locator('#undo');
    this.redoButton = page.locator('#redo');
    this.exportButton = page.locator('#export-data');
    this.importButton = page.locator('#import-data');
    this.fileInput = page.locator('#file-input');

    // 状态面板
    this.statusPanel = page.locator('#status-panel');
    this.statusToggle = page.locator('#toggle-status');
    this.historyCount = page.locator('#history-count');
    this.nodeCount = page.locator('#node-count');
    this.connectionCount = page.locator('#connection-count');
    this.canUndo = page.locator('#can-undo');
    this.canRedo = page.locator('#can-redo');
    this.performanceMode = page.locator('#performance-mode');

    // 功能弹窗
    this.featureModal = page.locator('#feature-modal');
    this.modalClose = page.locator('.close');

    // 拖拽元素
    this.blockElements = page.locator('.blockelem');
    this.grabHandles = page.locator('.grabme');
  }

  /**
   * 导航到 Demo 页面
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 等待页面完全加载
   */
  async waitForPageLoad() {
    await this.canvas.waitFor({ state: 'visible' });
    await this.statusPanel.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000); // 等待 JavaScript 初始化
  }

  /**
   * 关闭功能介绍弹窗
   */
  async closeFeatureModal() {
    if (await this.featureModal.isVisible()) {
      await this.modalClose.click();
      await this.featureModal.waitFor({ state: 'hidden' });
    }
  }

  /**
   * 拖拽创建节点
   */
  async dragCreateNode(blockIndex: number, targetX: number, targetY: number) {
    const block = this.blockElements.nth(blockIndex);
    const grabHandle = block.locator('.grabme');

    // 获取画布位置
    const canvasBox = await this.canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas not found');

    // 执行拖拽操作
    await grabHandle.dragTo(this.canvas, {
      targetPosition: {
        x: targetX - canvasBox.x,
        y: targetY - canvasBox.y,
      },
    });

    // 等待节点创建完成
    await this.page.waitForTimeout(500);
  }

  /**
   * 拖拽移动现有节点
   */
  async dragMoveNode(nodeSelector: string, deltaX: number, deltaY: number) {
    const node = this.page.locator(nodeSelector);
    await node.dragTo(node, {
      targetPosition: { x: deltaX, y: deltaY },
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * 点击撤销按钮
   */
  async clickUndo() {
    await this.undoButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 点击重做按钮
   */
  async clickRedo() {
    await this.redoButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 使用键盘快捷键撤销
   */
  async keyboardUndo() {
    await this.page.keyboard.press('Control+z');
    await this.page.waitForTimeout(300);
  }

  /**
   * 使用键盘快捷键重做
   */
  async keyboardRedo() {
    await this.page.keyboard.press('Control+y');
    await this.page.waitForTimeout(300);
  }

  /**
   * 导出数据
   */
  async exportData() {
    // 监听下载事件
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * 导入数据
   */
  async importData(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  /**
   * 切换状态面板
   */
  async toggleStatusPanel() {
    await this.statusToggle.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * 获取状态面板数据
   */
  async getStatusData() {
    return {
      historyCount: await this.historyCount.textContent(),
      nodeCount: await this.nodeCount.textContent(),
      connectionCount: await this.connectionCount.textContent(),
      canUndo: await this.canUndo.textContent(),
      canRedo: await this.canRedo.textContent(),
      performanceMode: await this.performanceMode.textContent(),
    };
  }

  /**
   * 验证页面标题
   */
  async verifyTitle() {
    await expect(this.title).toContainText('New Architecture Demo');
    await expect(this.subtitle).toContainText('Sprint 3 Features');
  }

  /**
   * 验证新功能按钮存在
   */
  async verifyNewFeatureButtons() {
    await expect(this.undoButton).toBeVisible();
    await expect(this.redoButton).toBeVisible();
    await expect(this.exportButton).toBeVisible();
    await expect(this.importButton).toBeVisible();
  }

  /**
   * 验证状态面板
   */
  async verifyStatusPanel() {
    await expect(this.statusPanel).toBeVisible();
    await expect(this.historyCount).toBeVisible();
    await expect(this.nodeCount).toBeVisible();
    await expect(this.connectionCount).toBeVisible();
  }

  /**
   * 获取画布中的节点数量
   */
  async getNodesInCanvas() {
    return await this.page.locator('#canvas .blockelem').count();
  }

  /**
   * 获取画布中的连接数量
   */
  async getConnectionsInCanvas() {
    return await this.page.locator('#canvas .arrowblock').count();
  }
}
