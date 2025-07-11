/**
 * 拖拽管理器
 * 处理所有拖拽相关的逻辑
 */

import type {
  FlowyConfig,
  DragState,
  MousePosition,
  BlockData,
} from '../types';
// import { dom } from '../utils'; // TODO: 使用 dom 工具函数

export class DragManager {
  private container: HTMLElement;
  private config: Required<FlowyConfig>;
  private dragState: DragState;
  private mousePosition: MousePosition;
  private blocks: BlockData[] = [];
  private tempBlocks: BlockData[] = []; // 临时存储被拖拽的块和子块
  private indicator!: HTMLElement;

  constructor(container: HTMLElement, config: Required<FlowyConfig>) {
    this.container = container;
    this.config = config;
    this.dragState = {
      active: false,
      element: null,
      offsetX: 0,
      offsetY: 0,
      originalElement: null,
    };
    this.mousePosition = { x: 0, y: 0 };

    this.init();
  }

  private init(): void {
    this.createIndicator();
    this.setupEventListeners();
  }

  private createIndicator(): void {
    this.indicator = document.createElement('div');
    this.indicator.classList.add('indicator', 'invisible');
    this.container.appendChild(this.indicator);
  }

  private setupEventListeners(): void {
    // 鼠标事件
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 触控事件
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.which === 3) return; // 忽略右键

    this.updateMousePosition(event);
    this.handleDragStart(event);
  }

  private handleTouchStart(event: TouchEvent): void {
    this.updateMousePosition(event);
    this.handleDragStart(event);
  }

  private handleMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    this.handleDragMove();
  }

  private handleTouchMove(event: TouchEvent): void {
    this.updateMousePosition(event);
    this.handleDragMove();
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.which === 3) return; // 忽略右键
    this.handleDragEnd();
  }

  private handleTouchEnd(): void {
    this.handleDragEnd();
  }

  private updateMousePosition(event: MouseEvent | TouchEvent): void {
    if ('touches' in event && event.touches.length > 0) {
      this.mousePosition.x = event.touches[0]!.clientX;
      this.mousePosition.y = event.touches[0]!.clientY;
    } else if ('clientX' in event) {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    }
  }

  private handleDragStart(event: MouseEvent | TouchEvent): void {
    const target = event.target as HTMLElement;

    // 安全地查找最近的元素
    const createFlowy = this.findClosest(target, '.create-flowy');

    if (createFlowy) {
      this.startNewBlockDrag(createFlowy, event);
    } else {
      const block = this.findClosest(target, '.block');
      if (block) {
        this.startBlockRearrange(block);
      }
    }
  }

  private startNewBlockDrag(createFlowy: HTMLElement, _event: Event): void {
    this.dragState.originalElement = createFlowy;

    // 克隆元素
    const newNode = createFlowy.cloneNode(true) as HTMLElement;
    createFlowy.classList.add('dragnow');
    newNode.classList.add('block');
    newNode.classList.remove('create-flowy');

    // 添加 blockid
    const blockId =
      this.blocks.length === 0
        ? 0
        : Math.max(...this.blocks.map(b => b.id)) + 1;

    newNode.innerHTML += `<input type='hidden' name='blockid' class='blockid' value='${blockId}'>`;
    document.body.appendChild(newNode);

    this.dragState.element = newNode;
    this.dragState.active = true;

    // 计算偏移
    const rect = createFlowy.getBoundingClientRect();
    this.dragState.offsetX = this.mousePosition.x - rect.left;
    this.dragState.offsetY = this.mousePosition.y - rect.top;

    // 设置初始位置
    this.updateDragElementPosition();

    // 添加拖拽样式
    newNode.classList.add('dragging');

    // 触发回调
    this.config.onGrab(createFlowy);
  }

  private startBlockRearrange(block: HTMLElement): void {
    // 设置重排状态
    this.dragState.element = block;
    this.dragState.active = true;
    this.dragState.originalElement = null; // 重排时没有原始元素

    // 获取被拖拽块的 ID
    const blockIdElement = block.querySelector('.blockid') as HTMLInputElement;
    if (!blockIdElement) return;

    const blockId = parseInt(blockIdElement.value);
    const draggedBlock = this.blocks.find(b => b.id === blockId);
    if (!draggedBlock) return;

    // 保存原始父节点（用于撤销）
    this.dragState.originalParent = draggedBlock.parent;

    // 计算拖拽偏移
    const rect = block.getBoundingClientRect();
    this.dragState.offsetX =
      this.mousePosition.x - (rect.left + window.scrollX);
    this.dragState.offsetY = this.mousePosition.y - (rect.top + window.scrollY);

    // 添加拖拽样式
    block.classList.add('dragging');

    // 从主数组中移除被拖拽的块（临时）
    this.tempBlocks = [draggedBlock];
    this.blocks = this.blocks.filter(b => b.id !== blockId);

    // 移除原有的箭头连接
    if (blockId !== 0) {
      const arrow = this.container.querySelector(
        `.arrowid[value="${blockId}"]`
      );
      if (arrow && arrow.parentNode) {
        arrow.parentNode.removeChild(arrow);
      }
    }

    // 处理子节点 - 递归收集所有子节点
    this.collectChildBlocks(blockId);

    // 将子节点DOM元素相对定位到拖拽元素
    this.attachChildElementsToDragElement(block);

    // 触发回调
    this.config.onGrab(block);
  }

  private handleDragMove(): void {
    if (!this.dragState.active || !this.dragState.element) return;

    this.updateDragElementPosition();
    this.updateIndicator();
  }

  private updateDragElementPosition(): void {
    if (!this.dragState.element) return;

    const isRearranging = this.tempBlocks.length > 0;

    if (isRearranging) {
      // 重排模式：相对于画布定位
      const canvasRect = this.container.getBoundingClientRect();
      const x =
        this.mousePosition.x -
        this.dragState.offsetX -
        (window.scrollX + canvasRect.left) +
        this.container.scrollLeft;
      const y =
        this.mousePosition.y -
        this.dragState.offsetY -
        (window.scrollY + canvasRect.top) +
        this.container.scrollTop;

      this.dragState.element.style.left = `${x}px`;
      this.dragState.element.style.top = `${y}px`;

      // 更新临时块数据中的位置
      const draggedBlockId = parseInt(
        this.dragState.element
          .querySelector('.blockid')
          ?.getAttribute('value') || '0'
      );
      const draggedBlock = this.tempBlocks.find(b => b.id === draggedBlockId);
      if (draggedBlock) {
        const rect = this.dragState.element.getBoundingClientRect();
        draggedBlock.x =
          rect.left +
          window.scrollX +
          this.dragState.element.offsetWidth / 2 +
          this.container.scrollLeft -
          canvasRect.left;
        draggedBlock.y =
          rect.top +
          window.scrollY +
          this.dragState.element.offsetHeight / 2 +
          this.container.scrollTop -
          canvasRect.top;
      }
    } else {
      // 创建模式：绝对定位
      const x = this.mousePosition.x - this.dragState.offsetX;
      const y = this.mousePosition.y - this.dragState.offsetY;

      this.dragState.element.style.left = `${x}px`;
      this.dragState.element.style.top = `${y}px`;
    }
  }

  private updateIndicator(): void {
    // TODO: 实现指示器更新逻辑
    // 显示可以放置的位置
  }

  private handleDragEnd(): void {
    if (!this.dragState.active) return;

    this.hideIndicator();

    if (this.dragState.originalElement) {
      this.dragState.originalElement.classList.remove('dragnow');
    }

    if (this.dragState.element) {
      this.dragState.element.classList.remove('dragging');

      if (this.isOverCanvas()) {
        this.dropBlock();
      } else {
        this.removeBlock();
      }
    }

    this.resetDragState();
    this.config.onRelease();
  }

  private isOverCanvas(): boolean {
    if (!this.dragState.element) return false;

    const dragRect = this.dragState.element.getBoundingClientRect();
    const canvasRect = this.container.getBoundingClientRect();

    return (
      dragRect.top + window.scrollY > canvasRect.top + window.scrollY &&
      dragRect.left + window.scrollX > canvasRect.left + window.scrollX
    );
  }

  private dropBlock(): void {
    if (!this.dragState.element) return;

    const blockId = parseInt(
      this.dragState.element.querySelector('.blockid')?.getAttribute('value') ||
        '0'
    );

    if (this.blocks.length === 0) {
      this.dropFirstBlock(blockId);
    } else {
      this.dropSubsequentBlock(blockId);
    }
  }

  private dropFirstBlock(blockId: number): void {
    if (!this.dragState.element) return;

    const canvasRect = this.container.getBoundingClientRect();
    const dragRect = this.dragState.element.getBoundingClientRect();

    // 调整位置到画布内
    const x =
      dragRect.left +
      window.scrollX -
      canvasRect.left -
      window.scrollX +
      this.container.scrollLeft;
    const y =
      dragRect.top +
      window.scrollY -
      canvasRect.top -
      window.scrollY +
      this.container.scrollTop;

    this.dragState.element.style.left = `${x}px`;
    this.dragState.element.style.top = `${y}px`;

    // 移动到画布内
    this.container.appendChild(this.dragState.element);

    // 添加到块数组
    this.blocks.push({
      id: blockId,
      parent: -1,
      childwidth: 0,
      x: x + this.dragState.element.offsetWidth / 2,
      y: y + this.dragState.element.offsetHeight / 2,
      width: this.dragState.element.offsetWidth,
      height: this.dragState.element.offsetHeight,
    });

    // 触发快照回调
    this.config.onSnap(this.dragState.element, true, undefined);
  }

  private dropSubsequentBlock(_blockId: number): void {
    if (!this.dragState.element) return;

    const isRearranging = this.tempBlocks.length > 0;

    // 检查是否可以附加到现有块
    const targetBlockId = this.findAttachableBlock();

    if (targetBlockId !== null) {
      // 可以附加到目标块
      if (
        this.config.onSnap(
          this.dragState.element,
          false,
          this.container.querySelector(`.blockid[value="${targetBlockId}"]`)
            ?.parentNode as HTMLElement
        )
      ) {
        this.attachToBlock(targetBlockId, isRearranging);
      } else {
        // 快照回调拒绝，移除块
        this.removeBlock();
      }
    } else if (isRearranging) {
      // 重排模式下，检查是否可以恢复到原位置
      const originalParentBlock = this.blocks.find(
        b => b.id === this.dragState.originalParent
      );
      const originalParentElement = originalParentBlock
        ? (this.container.querySelector(
            `.blockid[value="${originalParentBlock.id}"]`
          )?.parentNode as HTMLElement)
        : undefined;

      if (
        this.dragState.originalParent !== undefined &&
        originalParentElement &&
        this.config.onRearrange(this.dragState.element, originalParentElement)
      ) {
        this.restoreToOriginalPosition();
      } else {
        // 无法恢复，移除块
        this.removeBlock();
      }
    } else {
      // 创建模式下无法附加，移除块
      this.removeBlock();
    }
  }

  private hideIndicator(): void {
    if (!this.indicator.classList.contains('invisible')) {
      this.indicator.classList.add('invisible');
    }
  }

  private resetDragState(): void {
    if (this.dragState.element) {
      this.dragState.element.classList.remove('dragging');
    }

    this.dragState = {
      active: false,
      element: null,
      offsetX: 0,
      offsetY: 0,
      originalElement: null,
      originalParent: undefined,
    };

    // 清理临时块数据
    this.tempBlocks = [];
  }

  /**
   * 递归收集所有子节点
   */
  private collectChildBlocks(parentId: number): void {
    const childBlocks = this.blocks.filter(b => b.parent === parentId);

    for (const child of childBlocks) {
      // 添加到临时数组
      this.tempBlocks.push(child);

      // 从主数组中移除
      this.blocks = this.blocks.filter(b => b.id !== child.id);

      // 递归收集子节点的子节点
      this.collectChildBlocks(child.id);
    }
  }

  /**
   * 将子节点DOM元素附加到拖拽元素上
   */
  private attachChildElementsToDragElement(dragElement: HTMLElement): void {
    for (const block of this.tempBlocks) {
      if (
        block.id ===
        parseInt(
          dragElement.querySelector('.blockid')?.getAttribute('value') || '0'
        )
      ) {
        continue; // 跳过拖拽元素本身
      }

      const blockElement = this.container.querySelector(
        `.blockid[value="${block.id}"]`
      )?.parentNode as HTMLElement;
      const arrowElement = this.container.querySelector(
        `.arrowid[value="${block.id}"]`
      )?.parentNode as HTMLElement;

      if (blockElement && arrowElement) {
        // 计算相对位置
        const dragRect = dragElement.getBoundingClientRect();
        const blockRect = blockElement.getBoundingClientRect();
        const arrowRect = arrowElement.getBoundingClientRect();

        // 设置相对位置
        blockElement.style.left = `${blockRect.left - dragRect.left}px`;
        blockElement.style.top = `${blockRect.top - dragRect.top}px`;
        arrowElement.style.left = `${arrowRect.left - dragRect.left}px`;
        arrowElement.style.top = `${arrowRect.top - dragRect.top}px`;

        // 附加到拖拽元素
        dragElement.appendChild(blockElement);
        dragElement.appendChild(arrowElement);
      }
    }
  }

  /**
   * 安全地查找最近的匹配元素
   */
  private findClosest(
    element: HTMLElement,
    selector: string
  ): HTMLElement | null {
    if (!element || typeof element.closest !== 'function') {
      // 手动实现 closest 功能
      let current: HTMLElement | null = element;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        if (current.matches && current.matches(selector)) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    }

    return element.closest(selector) as HTMLElement | null;
  }

  // 公共方法
  public getBlocks(): BlockData[] {
    return [...this.blocks];
  }

  public setBlocks(blocks: BlockData[]): void {
    this.blocks = [...blocks];
  }

  public clearBlocks(): void {
    this.blocks = [];
  }

  /**
   * 查找可以附加的块
   */
  private findAttachableBlock(): number | null {
    if (!this.dragState.element) return null;

    const dragRect = this.dragState.element.getBoundingClientRect();
    const dragCenterX =
      dragRect.left +
      window.scrollX +
      dragRect.width / 2 +
      this.container.scrollLeft -
      this.container.getBoundingClientRect().left;
    const dragCenterY =
      dragRect.top +
      window.scrollY +
      this.container.scrollTop -
      this.container.getBoundingClientRect().top;

    const spacing = this.config.spacing;

    for (const block of this.blocks) {
      const isInXRange =
        dragCenterX >= block.x - block.width / 2 - spacing.x &&
        dragCenterX <= block.x + block.width / 2 + spacing.x;
      const isInYRange =
        dragCenterY >= block.y - block.height / 2 &&
        dragCenterY <= block.y + block.height;

      if (isInXRange && isInYRange) {
        return block.id;
      }
    }

    return null;
  }

  /**
   * 附加到目标块
   */
  private attachToBlock(targetBlockId: number, isRearranging: boolean): void {
    if (!this.dragState.element) return;

    const targetBlock = this.blocks.find(b => b.id === targetBlockId);
    if (!targetBlock) return;

    // 计算新位置
    this.positionBlockAsChild(this.dragState.element, targetBlock);

    if (isRearranging) {
      // 重排模式：恢复所有临时块
      this.restoreRearrangedBlocks(targetBlockId);
    } else {
      // 创建模式：添加新块
      this.addNewBlock(targetBlockId);
    }
  }

  /**
   * 恢复到原始位置
   */
  private restoreToOriginalPosition(): void {
    if (!this.dragState.element || this.dragState.originalParent === undefined)
      return;

    const originalParent = this.blocks.find(
      b => b.id === this.dragState.originalParent
    );
    if (originalParent) {
      this.positionBlockAsChild(this.dragState.element, originalParent);
      this.restoreRearrangedBlocks(this.dragState.originalParent);
    }
  }

  /**
   * 将块定位为子块
   */
  private positionBlockAsChild(
    blockElement: HTMLElement,
    parentBlock: BlockData
  ): void {
    // 计算所有同级子块的总宽度
    const siblings = this.blocks.filter(b => b.parent === parentBlock.id);
    let totalWidth = 0;

    for (const sibling of siblings) {
      totalWidth +=
        (sibling.childwidth > sibling.width
          ? sibling.childwidth
          : sibling.width) + this.config.spacing.x;
    }

    // 加上当前块的宽度
    totalWidth += blockElement.offsetWidth;

    // 计算新位置
    let currentX = parentBlock.x - totalWidth / 2;

    // 重新定位所有同级块
    for (const sibling of siblings) {
      const siblingElement = this.container.querySelector(
        `.blockid[value="${sibling.id}"]`
      )?.parentNode as HTMLElement;
      if (siblingElement) {
        const width =
          sibling.childwidth > sibling.width
            ? sibling.childwidth
            : sibling.width;
        const centerOffset =
          sibling.childwidth > sibling.width
            ? (sibling.childwidth - sibling.width) / 2
            : 0;

        siblingElement.style.left = `${currentX + centerOffset}px`;
        sibling.x = currentX + width / 2;
        currentX += width + this.config.spacing.x;
      }
    }

    // 定位当前块
    const canvasRect = this.container.getBoundingClientRect();
    blockElement.style.left = `${currentX - (window.scrollX + canvasRect.left) + this.container.scrollLeft}px`;
    blockElement.style.top = `${parentBlock.y + parentBlock.height / 2 + this.config.spacing.y - (window.scrollY + canvasRect.top) + this.container.scrollTop}px`;
  }

  /**
   * 添加新块
   */
  private addNewBlock(parentId: number): void {
    if (!this.dragState.element) return;

    const blockId = parseInt(
      this.dragState.element.querySelector('.blockid')?.getAttribute('value') ||
        '0'
    );
    const rect = this.dragState.element.getBoundingClientRect();
    const canvasRect = this.container.getBoundingClientRect();

    this.blocks.push({
      childwidth: 0,
      parent: parentId,
      id: blockId,
      x:
        rect.left +
        window.scrollX +
        this.dragState.element.offsetWidth / 2 +
        this.container.scrollLeft -
        canvasRect.left,
      y:
        rect.top +
        window.scrollY +
        this.dragState.element.offsetHeight / 2 +
        this.container.scrollTop -
        canvasRect.top,
      width: this.dragState.element.offsetWidth,
      height: this.dragState.element.offsetHeight,
    });

    // 移动到画布
    this.container.appendChild(this.dragState.element);
  }

  /**
   * 恢复重排的块
   */
  private restoreRearrangedBlocks(parentId: number): void {
    // 将所有临时块恢复到主数组
    for (const block of this.tempBlocks) {
      if (
        block.id ===
        parseInt(
          this.dragState.element
            ?.querySelector('.blockid')
            ?.getAttribute('value') || '0'
        )
      ) {
        block.parent = parentId;
      }

      // 恢复DOM元素到画布
      const blockElement = this.dragState.element?.querySelector(
        `.blockid[value="${block.id}"]`
      )?.parentNode as HTMLElement;
      const arrowElement = this.dragState.element?.querySelector(
        `.arrowid[value="${block.id}"]`
      )?.parentNode as HTMLElement;

      if (blockElement && this.dragState.element?.contains(blockElement)) {
        // 计算绝对位置
        const rect = blockElement.getBoundingClientRect();
        const canvasRect = this.container.getBoundingClientRect();

        blockElement.style.left = `${rect.left - canvasRect.left + this.container.scrollLeft}px`;
        blockElement.style.top = `${rect.top - canvasRect.top + this.container.scrollTop}px`;

        this.container.appendChild(blockElement);

        // 更新块数据位置
        block.x =
          rect.left +
          window.scrollX +
          blockElement.offsetWidth / 2 +
          this.container.scrollLeft -
          canvasRect.left;
        block.y =
          rect.top +
          window.scrollY +
          blockElement.offsetHeight / 2 +
          this.container.scrollTop -
          canvasRect.top;
      }

      if (arrowElement && this.dragState.element?.contains(arrowElement)) {
        const rect = arrowElement.getBoundingClientRect();
        const canvasRect = this.container.getBoundingClientRect();

        arrowElement.style.left = `${rect.left - canvasRect.left + this.container.scrollLeft}px`;
        arrowElement.style.top = `${rect.top - canvasRect.top + this.container.scrollTop}px`;

        this.container.appendChild(arrowElement);
      }
    }

    // 恢复所有块到主数组
    this.blocks = this.blocks.concat(this.tempBlocks);
    this.tempBlocks = [];
  }

  /**
   * 移除块（拖拽失败时）
   */
  private removeBlock(): void {
    if (!this.dragState.element) return;

    // 移除DOM元素
    this.dragState.element.remove();

    // 清理临时块数据
    this.tempBlocks = [];
  }

  public destroy(): void {
    // 移除事件监听器
    document.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener(
      'touchstart',
      this.handleTouchStart.bind(this)
    );
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));

    // 清理状态
    this.resetDragState();
    this.blocks = [];
    this.tempBlocks = [];
  }
}
