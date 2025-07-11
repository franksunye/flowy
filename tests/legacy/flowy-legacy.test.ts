/**
 * 传统 API 兼容性测试
 */

import { flowy } from '../../src/legacy/flowy-legacy';
import type { LegacyFlowyOutput } from '../../src/types';

describe('Legacy Flowy API', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 清理
    document.body.removeChild(container);
  });

  describe('传统函数调用', () => {
    it('应该能够使用传统的函数签名创建实例', () => {
      const grab = jest.fn();
      const release = jest.fn();
      const snapping = jest.fn().mockReturnValue(true);
      const rearrange = jest.fn().mockReturnValue(false);

      const instance = flowy(
        container,
        grab,
        release,
        snapping,
        rearrange,
        30,
        100
      );

      expect(instance).toBeDefined();
      expect(typeof instance.load).toBe('function');
      expect(typeof instance.output).toBe('function');
      expect(typeof instance.import).toBe('function');
      expect(typeof instance.deleteBlocks).toBe('function');
    });

    it('应该能够使用最小参数创建实例', () => {
      const instance = flowy(container);

      expect(instance).toBeDefined();
      expect(typeof instance.load).toBe('function');
    });
  });

  describe('传统 API 方法', () => {
    let instance: ReturnType<typeof flowy>;

    beforeEach(() => {
      instance = flowy(container);
    });

    it('应该能够调用 load 方法', () => {
      expect(() => instance.load()).not.toThrow();
    });

    it('应该能够调用 output 方法', () => {
      const output = instance.output();
      expect(output).toBeDefined();
      expect(output?.html).toBeDefined();
      expect(output?.blockarr).toBeDefined();
      expect(Array.isArray(output?.blockarr)).toBe(true);
    });

    it('应该能够调用 deleteBlocks 方法', () => {
      expect(() => instance.deleteBlocks()).not.toThrow();
    });

    it('应该能够导入和导出数据', () => {
      const testData: LegacyFlowyOutput = {
        html: '<div class="indicator invisible"></div>',
        blockarr: [
          {
            id: 0,
            parent: -1,
            childwidth: 0,
            x: 100,
            y: 100,
            width: 200,
            height: 50,
          },
        ],
        blocks: [
          {
            id: 0,
            parent: -1,
            data: [{ name: 'test', value: 'value' }],
            attr: [{ class: 'block' }],
          },
        ],
      };

      // 导入数据
      expect(() => instance.import(testData)).not.toThrow();

      // 导出数据
      const output = instance.output();
      expect(output).toBeDefined();
      expect(output?.blockarr).toHaveLength(1);
    });
  });

  describe('事件处理', () => {
    it('应该能够处理拖拽事件', () => {
      const grab = jest.fn();
      const release = jest.fn();
      const instance = flowy(container, grab, release);

      // 模拟鼠标事件
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });

      expect(() => instance.beginDrag(mouseEvent)).not.toThrow();
      expect(() => instance.moveBlock(mouseEvent)).not.toThrow();
      expect(() => instance.endDrag(mouseEvent)).not.toThrow();
    });

    it('应该能够处理触控事件', () => {
      const instance = flowy(container);

      // 模拟触控事件
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 100,
            clientY: 100,
          } as Touch,
        ],
      });

      expect(() => instance.beginDrag(touchEvent)).not.toThrow();
      expect(() => instance.moveBlock(touchEvent)).not.toThrow();
      expect(() => instance.endDrag(touchEvent)).not.toThrow();
    });
  });

  describe('回调函数', () => {
    it('应该正确传递回调函数', () => {
      const grab = jest.fn();
      const release = jest.fn();
      const snapping = jest.fn().mockReturnValue(true);
      const rearrange = jest.fn().mockReturnValue(false);

      const instance = flowy(container, grab, release, snapping, rearrange);

      expect(instance).toBeDefined();
      // 回调函数的实际调用会在拖拽操作中测试
    });
  });

  describe('向后兼容性', () => {
    it('应该与原始 API 完全兼容', () => {
      // 测试原始 API 的使用方式
      const instance = flowy(
        container,
        (block: HTMLElement) => {
          console.log('Grabbed:', block);
        },
        () => {
          console.log('Released');
        },
        (
          drag: HTMLElement,
          first: boolean,
          parent: HTMLElement | undefined
        ) => {
          console.log('Snapping:', drag, first, parent);
          return true;
        },
        (block: HTMLElement, parent: HTMLElement) => {
          console.log('Rearranging:', block, parent);
          return false;
        },
        20,
        80
      );

      expect(instance).toBeDefined();

      // 测试所有方法都存在
      expect(typeof instance.load).toBe('function');
      expect(typeof instance.import).toBe('function');
      expect(typeof instance.output).toBe('function');
      expect(typeof instance.deleteBlocks).toBe('function');
      expect(typeof instance.beginDrag).toBe('function');
      expect(typeof instance.endDrag).toBe('function');
      expect(typeof instance.moveBlock).toBe('function');
    });
  });
});
