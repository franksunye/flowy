/**
 * 拖拽管理器测试
 */

import { DragManager } from '../../src/core/drag-manager';
import type { FlowyConfig } from '../../src/types';

describe('DragManager', () => {
  let container: HTMLElement;
  let dragManager: DragManager;
  let config: Required<FlowyConfig>;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 创建配置
    config = {
      spacing: { x: 20, y: 80 },
      onGrab: jest.fn(),
      onRelease: jest.fn(),
      onSnap: jest.fn().mockReturnValue(true),
      onRearrange: jest.fn().mockReturnValue(false),
    };

    // 创建拖拽管理器
    dragManager = new DragManager(container, config);
  });

  afterEach(() => {
    // 清理
    dragManager.destroy();
    document.body.removeChild(container);
  });

  describe('初始化', () => {
    it('应该正确初始化拖拽管理器', () => {
      expect(dragManager).toBeDefined();
      expect(container.querySelector('.indicator')).toBeTruthy();
    });

    it('应该设置正确的事件监听器', () => {
      // 验证事件监听器已设置（通过触发事件来验证）
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      });

      expect(() => document.dispatchEvent(mouseEvent)).not.toThrow();
    });
  });

  describe('鼠标事件处理', () => {
    it('应该处理鼠标按下事件', () => {
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        which: 1,
        bubbles: true,
      });

      expect(() => document.dispatchEvent(mouseEvent)).not.toThrow();
    });

    it('应该忽略右键点击', () => {
      const rightClickEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        which: 3, // 右键
        bubbles: true,
      });

      expect(() => document.dispatchEvent(rightClickEvent)).not.toThrow();
    });

    it('应该处理鼠标移动事件', () => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true,
      });

      expect(() => document.dispatchEvent(mouseMoveEvent)).not.toThrow();
    });

    it('应该处理鼠标释放事件', () => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 200,
        which: 1,
        bubbles: true,
      });

      expect(() => document.dispatchEvent(mouseUpEvent)).not.toThrow();
    });
  });

  describe('触控事件处理', () => {
    it('应该处理触控开始事件', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 100,
            clientY: 100,
          } as Touch,
        ],
        bubbles: true,
      });

      expect(() => document.dispatchEvent(touchStartEvent)).not.toThrow();
    });

    it('应该处理触控移动事件', () => {
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          {
            clientX: 150,
            clientY: 150,
          } as Touch,
        ],
        bubbles: true,
      });

      expect(() => document.dispatchEvent(touchMoveEvent)).not.toThrow();
    });

    it('应该处理触控结束事件', () => {
      const touchEndEvent = new TouchEvent('touchend', {
        bubbles: true,
      });

      expect(() => document.dispatchEvent(touchEndEvent)).not.toThrow();
    });
  });

  describe('拖拽元素创建', () => {
    it('应该能够开始新块拖拽', () => {
      // 创建可拖拽元素
      const createFlowy = document.createElement('div');
      createFlowy.classList.add('create-flowy');
      createFlowy.textContent = 'Drag me';
      document.body.appendChild(createFlowy);

      // 模拟鼠标按下事件
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        which: 1,
        bubbles: true,
      });

      Object.defineProperty(mouseDownEvent, 'target', {
        value: createFlowy,
        enumerable: true,
      });

      expect(() => document.dispatchEvent(mouseDownEvent)).not.toThrow();
      expect(config.onGrab).toHaveBeenCalledWith(createFlowy);

      // 清理
      document.body.removeChild(createFlowy);
    });

    it('应该能够处理块重排', () => {
      // 创建现有块
      const block = document.createElement('div');
      block.classList.add('block');
      block.innerHTML = '<input class="blockid" value="1">';
      container.appendChild(block);

      // 模拟鼠标按下事件
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        which: 1,
        bubbles: true,
      });

      Object.defineProperty(mouseDownEvent, 'target', {
        value: block,
        enumerable: true,
      });

      expect(() => document.dispatchEvent(mouseDownEvent)).not.toThrow();
    });
  });

  describe('块数据管理', () => {
    it('应该能够获取块数据', () => {
      const blocks = dragManager.getBlocks();
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks).toHaveLength(0);
    });

    it('应该能够设置块数据', () => {
      const testBlocks = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
      ];

      dragManager.setBlocks(testBlocks);
      const blocks = dragManager.getBlocks();
      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.id).toBe(0);
    });

    it('应该能够清空块数据', () => {
      const testBlocks = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
      ];

      dragManager.setBlocks(testBlocks);
      expect(dragManager.getBlocks()).toHaveLength(1);

      dragManager.clearBlocks();
      expect(dragManager.getBlocks()).toHaveLength(0);
    });
  });

  describe('完整拖拽流程', () => {
    it('应该能够完成完整的拖拽流程', () => {
      // 创建可拖拽元素
      const createFlowy = document.createElement('div');
      createFlowy.classList.add('create-flowy');
      createFlowy.textContent = 'Drag me';
      document.body.appendChild(createFlowy);

      // 1. 开始拖拽
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        which: 1,
        bubbles: true,
      });
      Object.defineProperty(mouseDownEvent, 'target', {
        value: createFlowy,
        enumerable: true,
      });
      document.dispatchEvent(mouseDownEvent);

      // 2. 移动鼠标
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(mouseMoveEvent);

      // 3. 释放鼠标
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 200,
        which: 1,
        bubbles: true,
      });
      document.dispatchEvent(mouseUpEvent);

      // 验证回调被调用
      expect(config.onGrab).toHaveBeenCalled();
      expect(config.onRelease).toHaveBeenCalled();

      // 清理
      document.body.removeChild(createFlowy);
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁拖拽管理器', () => {
      expect(() => dragManager.destroy()).not.toThrow();

      // 验证状态被清理
      expect(dragManager.getBlocks()).toHaveLength(0);
    });
  });
});
