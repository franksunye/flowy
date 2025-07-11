/**
 * SVG 渲染器测试
 */

import { SvgRenderer } from '../../src/renderer/svg-renderer';
import type { BlockData } from '../../src/types';

describe('SvgRenderer', () => {
  let container: HTMLElement;
  let svgRenderer: SvgRenderer;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // 创建 SVG 渲染器
    svgRenderer = new SvgRenderer(container);
  });

  afterEach(() => {
    // 清理
    document.body.removeChild(container);
  });

  describe('初始化', () => {
    it('应该正确初始化 SVG 渲染器', () => {
      expect(svgRenderer).toBeDefined();
    });
  });

  describe('箭头绘制', () => {
    const fromBlock: BlockData = {
      id: 0,
      parent: -1,
      childwidth: 0,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    };

    const toBlock: BlockData = {
      id: 1,
      parent: 0,
      childwidth: 0,
      x: 300,
      y: 200,
      width: 200,
      height: 50,
    };

    it('应该能够绘制右箭头', () => {
      svgRenderer.drawArrow(fromBlock, toBlock, 'test-arrow-1');

      const arrowBlock = container.querySelector('.arrowblock');
      expect(arrowBlock).toBeTruthy();

      const arrowId = arrowBlock?.querySelector('.arrowid');
      expect(arrowId?.getAttribute('value')).toBe('test-arrow-1');

      const svg = arrowBlock?.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('应该能够绘制左箭头', () => {
      const leftToBlock: BlockData = {
        ...toBlock,
        x: 50, // 左侧位置
      };

      svgRenderer.drawArrow(fromBlock, leftToBlock, 'test-arrow-2');

      const arrowBlock = container.querySelector('.arrowblock');
      expect(arrowBlock).toBeTruthy();

      const arrowId = arrowBlock?.querySelector('.arrowid');
      expect(arrowId?.getAttribute('value')).toBe('test-arrow-2');
    });

    it('应该能够绘制多个箭头', () => {
      const toBlock2: BlockData = {
        id: 2,
        parent: 0,
        childwidth: 0,
        x: 400,
        y: 300,
        width: 200,
        height: 50,
      };

      svgRenderer.drawArrow(fromBlock, toBlock, 'arrow-1');
      svgRenderer.drawArrow(fromBlock, toBlock2, 'arrow-2');

      const arrowBlocks = container.querySelectorAll('.arrowblock');
      expect(arrowBlocks).toHaveLength(2);
    });
  });

  describe('箭头清除', () => {
    const fromBlock: BlockData = {
      id: 0,
      parent: -1,
      childwidth: 0,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    };

    const toBlock: BlockData = {
      id: 1,
      parent: 0,
      childwidth: 0,
      x: 300,
      y: 200,
      width: 200,
      height: 50,
    };

    beforeEach(() => {
      // 添加一些箭头用于测试
      svgRenderer.drawArrow(fromBlock, toBlock, 'arrow-1');
      svgRenderer.drawArrow(fromBlock, toBlock, 'arrow-2');
    });

    it('应该能够清除所有箭头', () => {
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(2);

      svgRenderer.clearArrows();

      expect(container.querySelectorAll('.arrowblock')).toHaveLength(0);
    });

    it('应该能够清除特定块的箭头', () => {
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(2);

      svgRenderer.clearArrowsForBlock('arrow-1');

      const remainingArrows = container.querySelectorAll('.arrowblock');
      expect(remainingArrows).toHaveLength(1);

      const remainingArrowId = remainingArrows[0]?.querySelector('.arrowid');
      expect(remainingArrowId?.getAttribute('value')).toBe('arrow-2');
    });

    it('应该能够处理不存在的箭头 ID', () => {
      expect(() =>
        svgRenderer.clearArrowsForBlock('non-existent')
      ).not.toThrow();
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(2);
    });
  });

  describe('连接重新渲染', () => {
    const blocks: BlockData[] = [
      {
        id: 0,
        parent: -1,
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

    it('应该能够重新渲染所有连接', () => {
      svgRenderer.rerenderConnections(blocks);

      const arrowBlocks = container.querySelectorAll('.arrowblock');
      expect(arrowBlocks).toHaveLength(2); // 两个连接：0->1, 1->2
    });

    it('应该能够处理空块数组', () => {
      expect(() => svgRenderer.rerenderConnections([])).not.toThrow();
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(0);
    });

    it('应该能够处理没有父子关系的块', () => {
      const independentBlocks: BlockData[] = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
        {
          id: 1,
          parent: -1,
          childwidth: 0,
          x: 300,
          y: 200,
          width: 200,
          height: 50,
        },
      ];

      svgRenderer.rerenderConnections(independentBlocks);
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(0);
    });
  });

  describe('箭头位置更新', () => {
    const blocks: BlockData[] = [
      {
        id: 0,
        parent: -1,
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
    ];

    it('应该能够更新箭头位置', () => {
      // 首先渲染连接
      svgRenderer.rerenderConnections(blocks);
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(1);

      // 更新块位置
      const updatedBlocks = [
        {
          ...blocks[0]!,
          x: 150,
          y: 150,
        },
        {
          ...blocks[1]!,
          x: 350,
          y: 250,
        },
      ];

      // 更新箭头位置
      svgRenderer.updateArrowPositions(updatedBlocks);

      // 验证箭头仍然存在
      expect(container.querySelectorAll('.arrowblock')).toHaveLength(1);
    });
  });

  describe('边界情况', () => {
    it('应该能够处理相同位置的块', () => {
      const samePositionBlocks: BlockData[] = [
        {
          id: 0,
          parent: -1,
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
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
      ];

      expect(() =>
        svgRenderer.rerenderConnections(samePositionBlocks)
      ).not.toThrow();
    });

    it('应该能够处理负坐标', () => {
      const negativeBlocks: BlockData[] = [
        {
          id: 0,
          parent: -1,
          childwidth: 0,
          x: -100,
          y: -100,
          width: 200,
          height: 50,
        },
        {
          id: 1,
          parent: 0,
          childwidth: 0,
          x: -50,
          y: -50,
          width: 200,
          height: 50,
        },
      ];

      expect(() =>
        svgRenderer.rerenderConnections(negativeBlocks)
      ).not.toThrow();
    });

    it('应该能够处理循环引用', () => {
      const circularBlocks: BlockData[] = [
        {
          id: 0,
          parent: 1, // 循环引用
          childwidth: 0,
          x: 100,
          y: 100,
          width: 200,
          height: 50,
        },
        {
          id: 1,
          parent: 0, // 循环引用
          childwidth: 0,
          x: 300,
          y: 200,
          width: 200,
          height: 50,
        },
      ];

      expect(() =>
        svgRenderer.rerenderConnections(circularBlocks)
      ).not.toThrow();
    });
  });
});
