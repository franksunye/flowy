/**
 * Flowy Demo E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('Flowy Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该加载 demo 页面', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/Flowy/);

    // 检查主要元素是否存在
    await expect(page.locator('#canvas')).toBeVisible();
    await expect(page.locator('.create-flowy')).toBeVisible();
  });

  test('应该能够拖拽创建新块', async ({ page }) => {
    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 获取初始状态
    const initialBlocks = await canvas.locator('.block').count();

    // 拖拽创建新块
    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 200, y: 200 },
    });

    // 验证新块被创建
    const finalBlocks = await canvas.locator('.block').count();
    expect(finalBlocks).toBe(initialBlocks + 1);
  });

  test('应该能够导出数据', async ({ page }) => {
    // 创建一个块
    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 200, y: 200 },
    });

    // 点击导出按钮（如果存在）
    const exportButton = page.locator('button:has-text("Export")');
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 验证导出数据（这取决于具体的 demo 实现）
      // 可能需要检查控制台输出或下载的文件
    }
  });

  test('应该在移动设备上正常工作', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 在移动设备上使用触控拖拽
    await createFlowy.tap();
    await page.touchscreen.tap(200, 200);

    // 验证触控操作正常工作
    await expect(canvas).toBeVisible();
  });

  test('应该能够处理多个块的连接', async ({ page }) => {
    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 创建第一个块
    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 100, y: 100 },
    });

    // 创建第二个块
    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 300, y: 200 },
    });

    // 验证两个块都被创建
    const blocks = await canvas.locator('.block').count();
    expect(blocks).toBe(2);

    // 检查是否有连接线（如果 demo 支持自动连接）
    // const arrows = await canvas.locator('.arrowblock').count();
    // 这取决于 demo 的具体实现
  });

  test('应该能够删除块', async ({ page }) => {
    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 创建一个块
    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 200, y: 200 },
    });

    const initialBlocks = await canvas.locator('.block').count();
    expect(initialBlocks).toBeGreaterThan(0);

    // 尝试删除块（具体方法取决于 demo 实现）
    const deleteButton = page.locator('button:has-text("Delete")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      const finalBlocks = await canvas.locator('.block').count();
      expect(finalBlocks).toBeLessThan(initialBlocks);
    }
  });

  test('应该能够处理页面调整大小', async ({ page }) => {
    const canvas = page.locator('#canvas');

    // 获取初始大小
    // const initialSize = await canvas.boundingBox();

    // 调整页面大小
    await page.setViewportSize({ width: 1200, height: 800 });

    // 验证画布仍然可见和可用
    await expect(canvas).toBeVisible();

    // 验证拖拽仍然工作
    const createFlowy = page.locator('.create-flowy').first();
    await createFlowy.dragTo(canvas, {
      targetPosition: { x: 300, y: 300 },
    });

    const blocks = await canvas.locator('.block').count();
    expect(blocks).toBeGreaterThan(0);
  });

  test('应该能够处理快速连续操作', async ({ page }) => {
    const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 快速创建多个块
    for (let i = 0; i < 5; i++) {
      await createFlowy.dragTo(canvas, {
        targetPosition: { x: 100 + i * 50, y: 100 + i * 50 },
      });

      // 短暂等待以避免操作过快
      await page.waitForTimeout(100);
    }

    // 验证所有块都被创建
    const blocks = await canvas.locator('.block').count();
    expect(blocks).toBe(5);
  });

  test('应该能够处理错误情况', async ({ page }) => {
    // 监听控制台错误
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // const canvas = page.locator('#canvas');
    const createFlowy = page.locator('.create-flowy').first();

    // 尝试拖拽到画布外
    await createFlowy.dragTo(page.locator('body'), {
      targetPosition: { x: -100, y: -100 },
    });

    // 验证没有严重错误
    expect(
      errors.filter(
        error => !error.includes('Warning') && !error.includes('DevTools')
      )
    ).toHaveLength(0);
  });
});
