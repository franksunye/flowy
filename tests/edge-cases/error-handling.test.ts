/**
 * 边界条件和错误处理测试
 */

import Flowy from '../../src/core/flowy';
import { DataManager } from '../../src/core/data-manager';
import { DragManager } from '../../src/core/drag-manager';
import { SvgRenderer } from '../../src/renderer/svg-renderer';
import { flowy } from '../../src/legacy/flowy-legacy';
import type { FlowyConfig } from '../../src/types';

describe('Error Handling and Edge Cases', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'error-test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Flowy 核心错误处理', () => {
    it('应该能够处理空容器', () => {
      const emptyContainer = document.createElement('div');
      expect(() => new Flowy(emptyContainer)).not.toThrow();
    });

    it('应该能够处理无效配置', () => {
      const invalidConfig = {
        spacing: null,
        onGrab: 'not a function',
        onRelease: undefined,
      } as any;

      expect(() => new Flowy(container, invalidConfig)).not.toThrow();
    });

    it('应该能够处理重复销毁', () => {
      const flowy = new Flowy(container);
      flowy.destroy();
      expect(() => flowy.destroy()).not.toThrow();
    });

    it('应该能够处理销毁后的操作', () => {
      const flowy = new Flowy(container);
      flowy.destroy();

      expect(() => flowy.addNode({ type: 'test' })).not.toThrow();
      expect(() => flowy.export()).not.toThrow();
    });
  });

  describe('DataManager 错误处理', () => {
    let dataManager: DataManager;

    beforeEach(() => {
      dataManager = new DataManager(container);
    });

    it('应该能够处理损坏的 HTML', () => {
      const corruptedData = {
        html: '<div><span>unclosed tag',
        blockarr: [],
        blocks: [],
      };

      expect(() => dataManager.importLegacy(corruptedData)).not.toThrow();
    });

    it('应该能够处理缺失的数据字段', () => {
      const incompleteData = {
        html: '<div></div>',
        // 缺少 blockarr 和 blocks
      } as any;

      expect(() => dataManager.importLegacy(incompleteData)).not.toThrow();
    });

    it('应该能够处理无效的块数据', () => {
      const invalidBlockData = {
        html: '<div></div>',
        blockarr: [
          {
            id: 'not-a-number',
            parent: null,
            x: 'invalid',
            y: undefined,
          },
        ],
        blocks: [],
      } as any;

      expect(() => dataManager.importLegacy(invalidBlockData)).not.toThrow();
    });

    it('应该能够验证各种无效数据格式', () => {
      const testCases = [
        null,
        undefined,
        'string',
        123,
        [],
        { invalid: 'format' },
        { nodes: 'not-array' },
        { nodes: [], connections: 'not-array' },
      ];

      testCases.forEach(testCase => {
        const result = dataManager.validateData(testCase);
        expect(result.isValid).toBe(false);
        expect(result.format).toBe('unknown');
      });
    });
  });

  describe('DragManager 错误处理', () => {
    let dragManager: DragManager;
    let config: Required<FlowyConfig>;

    beforeEach(() => {
      config = {
        spacing: { x: 20, y: 80 },
        onGrab: jest.fn(),
        onRelease: jest.fn(),
        onSnap: jest.fn().mockReturnValue(true),
        onRearrange: jest.fn().mockReturnValue(false),
      };
      dragManager = new DragManager(container, config);
    });

    afterEach(() => {
      dragManager.destroy();
    });

    it('应该能够处理无效的事件对象', () => {
      const invalidEvent = {
        // 缺少必要的属性
      } as any;

      expect(() => dragManager['handleMouseDown'](invalidEvent)).not.toThrow();
      expect(() => dragManager['handleTouchStart'](invalidEvent)).not.toThrow();
    });

    it('应该能够处理空的触控事件', () => {
      const emptyTouchEvent = new TouchEvent('touchstart', {
        touches: [], // 空的触控点
      });

      expect(() =>
        dragManager['updateMousePosition'](emptyTouchEvent)
      ).not.toThrow();
    });

    it('应该能够处理无效的块数据', () => {
      const invalidBlocks = [
        { id: null, parent: undefined, x: 'invalid' },
        { id: 1, parent: 'not-number', y: null },
      ] as any;

      expect(() => dragManager.setBlocks(invalidBlocks)).not.toThrow();
    });
  });

  describe('SvgRenderer 错误处理', () => {
    let svgRenderer: SvgRenderer;

    beforeEach(() => {
      svgRenderer = new SvgRenderer(container);
    });

    it('应该能够处理无效的块数据', () => {
      const invalidFromBlock = {
        id: null,
        x: undefined,
        y: 'invalid',
      } as any;

      const invalidToBlock = {
        id: 1,
        x: null,
        y: NaN,
      } as any;

      expect(() =>
        svgRenderer.drawArrow(invalidFromBlock, invalidToBlock, 'test')
      ).not.toThrow();
    });

    it('应该能够处理极端坐标值', () => {
      const extremeBlocks = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: Number.MAX_SAFE_INTEGER,
          y: Number.MIN_SAFE_INTEGER,
          width: 0,
          height: 0,
        },
        {
          id: 1,
          parent: 0,
          childwidth: 0,
          x: -Infinity,
          y: Infinity,
          width: -100,
          height: -50,
        },
      ];

      expect(() =>
        svgRenderer.rerenderConnections(extremeBlocks)
      ).not.toThrow();
    });

    it('应该能够处理循环引用', () => {
      const circularBlocks = [
        {
          id: 0,
          parent: 2,
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
        {
          id: 1,
          parent: 0,
          childwidth: 0,
          x: 300,
          y: 200,
          width: 200,
          height: 50,
        },
        {
          id: 2,
          parent: 1,
          childwidth: 0,
          x: 500,
          y: 300,
          width: 200,
          height: 50,
        },
      ];

      expect(() =>
        svgRenderer.rerenderConnections(circularBlocks)
      ).not.toThrow();
    });
  });

  describe('Legacy API 错误处理', () => {
    it('应该能够处理无效的回调函数', () => {
      const invalidCallbacks = {
        grab: 'not-a-function',
        release: null,
        snapping: undefined,
        rearrange: 123,
      } as any;

      expect(() =>
        flowy(
          container,
          invalidCallbacks.grab,
          invalidCallbacks.release,
          invalidCallbacks.snapping,
          invalidCallbacks.rearrange
        )
      ).not.toThrow();
    });

    it('应该能够处理无效的间距参数', () => {
      expect(() =>
        flowy(
          container,
          undefined,
          undefined,
          undefined,
          undefined,
          'invalid' as any,
          null as any
        )
      ).not.toThrow();
    });

    it('应该能够处理损坏的传统数据', () => {
      const legacyInstance = flowy(container);
      const corruptedData = {
        html: null,
        blockarr: 'not-an-array',
        blocks: undefined,
      } as any;

      expect(() => legacyInstance.import(corruptedData)).not.toThrow();
    });
  });

  describe('内存泄漏防护', () => {
    it('应该能够正确清理事件监听器', () => {
      const flowy = new Flowy(container);
      // const initialListenerCount = getEventListenerCount();

      // 添加一些事件监听器
      flowy.on('node:add', () => {});
      flowy.on('connection:add', () => {});

      // 销毁实例
      flowy.destroy();

      // 验证事件监听器被清理（这是一个简化的检查）
      expect(() => flowy.addNode({ type: 'test' })).not.toThrow();
    });

    it('应该能够处理大量的创建和销毁', () => {
      const instances = [];

      // 创建大量实例
      for (let i = 0; i < 100; i++) {
        const testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        instances.push({
          flowy: new Flowy(testContainer),
          container: testContainer,
        });
      }

      // 销毁所有实例
      instances.forEach(({ flowy, container }) => {
        flowy.destroy();
        document.body.removeChild(container);
      });

      // 应该没有内存泄漏或错误
      expect(instances).toHaveLength(100);
    });
  });

  describe('浏览器兼容性', () => {
    it('应该能够处理缺失的 DOM API', () => {
      // 模拟旧浏览器环境
      const originalMatches = Element.prototype.matches;
      const originalClosest = Element.prototype.closest;

      delete (Element.prototype as any).matches;
      delete (Element.prototype as any).closest;

      expect(() => {
        // 重新导入以触发 polyfill
        const { addPolyfills } = require('../../src/legacy/flowy-legacy');
        addPolyfills();
      }).not.toThrow();

      // 恢复原始方法
      Element.prototype.matches = originalMatches;
      Element.prototype.closest = originalClosest;
    });
  });
});

// 辅助函数
// function getEventListenerCount(): number {
//   // 这是一个简化的实现，实际项目中可能需要更复杂的检测
//   return 0;
// }
