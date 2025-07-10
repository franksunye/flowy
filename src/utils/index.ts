/**
 * 工具函数
 */

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'flowy'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }

  return obj;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * DOM 相关工具
 */
export const dom = {
  /**
   * 获取元素的绝对位置
   */
  getAbsolutePosition(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    };
  },

  /**
   * 检查元素是否在视口内
   */
  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * 添加 CSS 类
   */
  addClass(element: HTMLElement, className: string): void {
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
  },

  /**
   * 移除 CSS 类
   */
  removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  },

  /**
   * 切换 CSS 类
   */
  toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className);
  },
};

/**
 * 数学工具
 */
export const math = {
  /**
   * 计算两点间距离
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },

  /**
   * 限制数值在指定范围内
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 线性插值
   */
  lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  },

  /**
   * 角度转弧度
   */
  degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },

  /**
   * 弧度转角度
   */
  radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
  },
};
