/**
 * SVG 渲染器
 * 负责渲染连接线和箭头
 */

import type { BlockData } from '../types';

export class SvgRenderer {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 绘制箭头连接线
   */
  public drawArrow(
    fromBlock: BlockData,
    toBlock: BlockData,
    dragElementId: string
  ): void {
    const x = toBlock.x - fromBlock.x;
    const y = toBlock.y - fromBlock.y;

    if (x < 0) {
      this.drawLeftArrow(fromBlock, toBlock, dragElementId, x, y);
    } else {
      this.drawRightArrow(fromBlock, toBlock, dragElementId, x, y);
    }
  }

  private drawLeftArrow(
    _fromBlock: BlockData,
    toBlock: BlockData,
    dragElementId: string,
    _x: number,
    y: number
  ): void {
    const paddingY = 80; // 默认垂直间距
    const arrowHtml = `
      <div class="arrowblock">
        <input type="hidden" class="arrowid" value="${dragElementId}">
        <svg preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M${toBlock.x - _fromBlock.x + 5} 0L${toBlock.x - _fromBlock.x + 5} ${paddingY / 2}L5 ${paddingY / 2}L5 ${y}" stroke="#C5CCD0" stroke-width="2px"/>
          <path d="M0 ${y - 5}H10L5 ${y}L0 ${y - 5}Z" fill="#C5CCD0"/>
        </svg>
      </div>
    `;

    this.container.innerHTML += arrowHtml;
  }

  private drawRightArrow(
    _fromBlock: BlockData,
    _toBlock: BlockData,
    dragElementId: string,
    x: number,
    y: number
  ): void {
    const paddingY = 80; // 默认垂直间距
    const arrowHtml = `
      <div class="arrowblock">
        <input type="hidden" class="arrowid" value="${dragElementId}">
        <svg preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-5 0L-5 ${paddingY / 2}L${x - 5} ${paddingY / 2}L${x - 5} ${y}" stroke="#C5CCD0" stroke-width="2px"/>
          <path d="M${x - 10} ${y - 5}H${x}L${x - 5} ${y}L${x - 10} ${y - 5}Z" fill="#C5CCD0"/>
        </svg>
      </div>
    `;

    this.container.innerHTML += arrowHtml;
  }

  /**
   * 清除所有箭头
   */
  public clearArrows(): void {
    const arrows = this.container.querySelectorAll('.arrowblock');
    arrows.forEach(arrow => arrow.remove());
  }

  /**
   * 清除特定块的箭头
   */
  public clearArrowsForBlock(blockId: string): void {
    const arrows = this.container.querySelectorAll(
      `.arrowblock .arrowid[value="${blockId}"]`
    );
    arrows.forEach(arrow => {
      const arrowBlock = arrow.closest('.arrowblock');
      if (arrowBlock) {
        arrowBlock.remove();
      }
    });
  }

  /**
   * 重新渲染所有连接
   */
  public rerenderConnections(blocks: BlockData[]): void {
    this.clearArrows();

    // 根据父子关系重新绘制所有连接
    blocks.forEach(block => {
      if (block.parent !== -1) {
        const parentBlock = blocks.find(b => b.id === block.parent);
        if (parentBlock) {
          this.drawArrow(parentBlock, block, block.id.toString());
        }
      }
    });
  }

  /**
   * 更新箭头位置
   */
  public updateArrowPositions(blocks: BlockData[]): void {
    // 简单的重新渲染
    this.rerenderConnections(blocks);
  }
}
