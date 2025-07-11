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
    const createFlowy = target.closest('.create-flowy') as HTMLElement;

    if (createFlowy) {
      this.startNewBlockDrag(createFlowy, event);
    } else {
      const block = target.closest('.block') as HTMLElement;
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
    // TODO: 实现块重排逻辑
    console.debug('Block rearrange started:', block);
  }

  private handleDragMove(): void {
    if (!this.dragState.active || !this.dragState.element) return;

    this.updateDragElementPosition();
    this.updateIndicator();
  }

  private updateDragElementPosition(): void {
    if (!this.dragState.element) return;

    const x = this.mousePosition.x - this.dragState.offsetX;
    const y = this.mousePosition.y - this.dragState.offsetY;

    this.dragState.element.style.left = `${x}px`;
    this.dragState.element.style.top = `${y}px`;
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

  private dropSubsequentBlock(blockId: number): void {
    // TODO: 实现后续块的放置逻辑
    // 检查是否可以附加到现有块
    console.debug('Dropping subsequent block:', blockId);
  }

  private removeBlock(): void {
    if (this.dragState.element) {
      document.body.removeChild(this.dragState.element);
    }
  }

  private hideIndicator(): void {
    if (!this.indicator.classList.contains('invisible')) {
      this.indicator.classList.add('invisible');
    }
  }

  private resetDragState(): void {
    this.dragState = {
      active: false,
      element: null,
      offsetX: 0,
      offsetY: 0,
      originalElement: null,
    };
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
  }
}
