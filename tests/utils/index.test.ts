/**
 * 工具函数测试
 */

import {
  generateId,
  deepClone,
  debounce,
  throttle,
  dom,
  math,
} from '../../src/utils';

describe('Utils', () => {
  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('应该使用指定前缀', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test_/);
    });
  });

  describe('deepClone', () => {
    it('应该深度克隆对象', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }],
        },
      };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('应该处理基本类型', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
    });

    it('应该处理日期对象', () => {
      const date = new Date();
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('应该处理数组', () => {
      const array = [1, 2, { a: 3 }];
      const cloned = deepClone(array);

      expect(cloned).toEqual(array);
      expect(cloned).not.toBe(array);
      expect(cloned[2]).not.toBe(array[2]);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('应该延迟执行函数', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该取消之前的调用', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('应该限制函数执行频率', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('dom', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    describe('addClass', () => {
      it('应该添加 CSS 类', () => {
        dom.addClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(true);
      });

      it('不应该重复添加相同的类', () => {
        dom.addClass(element, 'test-class');
        dom.addClass(element, 'test-class');
        expect(element.classList.length).toBe(1);
      });
    });

    describe('removeClass', () => {
      it('应该移除 CSS 类', () => {
        element.classList.add('test-class');
        dom.removeClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(false);
      });
    });

    describe('toggleClass', () => {
      it('应该切换 CSS 类', () => {
        dom.toggleClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(true);

        dom.toggleClass(element, 'test-class');
        expect(element.classList.contains('test-class')).toBe(false);
      });
    });

    describe('getAbsolutePosition', () => {
      it('应该返回元素的绝对位置', () => {
        const position = dom.getAbsolutePosition(element);
        expect(typeof position.x).toBe('number');
        expect(typeof position.y).toBe('number');
      });
    });

    describe('isInViewport', () => {
      it('应该检查元素是否在视口内', () => {
        const result = dom.isInViewport(element);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('math', () => {
    describe('distance', () => {
      it('应该计算两点间距离', () => {
        const distance = math.distance(0, 0, 3, 4);
        expect(distance).toBe(5);
      });
    });

    describe('clamp', () => {
      it('应该限制数值在指定范围内', () => {
        expect(math.clamp(5, 0, 10)).toBe(5);
        expect(math.clamp(-5, 0, 10)).toBe(0);
        expect(math.clamp(15, 0, 10)).toBe(10);
      });
    });

    describe('lerp', () => {
      it('应该进行线性插值', () => {
        expect(math.lerp(0, 10, 0.5)).toBe(5);
        expect(math.lerp(0, 10, 0)).toBe(0);
        expect(math.lerp(0, 10, 1)).toBe(10);
      });
    });

    describe('degToRad', () => {
      it('应该将角度转换为弧度', () => {
        expect(math.degToRad(180)).toBeCloseTo(Math.PI);
        expect(math.degToRad(90)).toBeCloseTo(Math.PI / 2);
      });
    });

    describe('radToDeg', () => {
      it('应该将弧度转换为角度', () => {
        expect(math.radToDeg(Math.PI)).toBeCloseTo(180);
        expect(math.radToDeg(Math.PI / 2)).toBeCloseTo(90);
      });
    });
  });
});
