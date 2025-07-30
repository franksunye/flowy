/**
 * 事件处理模块
 * 负责处理所有的鼠标事件：mousedown, mousemove, mouseup
 * 这是从 flowy.js 中提炼出来的核心事件处理逻辑
 */

class EventHandler {
  constructor(options = {}) {
    this.canvas_div = options.canvas;
    this.dragStateManager = options.dragStateManager;
    this.blockManager = options.blockManager;
    this.snapEngine = options.snapEngine;
    this.positionCalculator = options.positionCalculator;
    this.domUtils = options.domUtils;
    
    // 回调函数
    this.grab = options.grab || function() {};
    this.release = options.release || function() {};
    this.snapping = options.snapping || function() {};
    
    // 间距参数
    this.spacing_x = options.spacing_x || 20;
    this.spacing_y = options.spacing_y || 80;
    
    // 辅助函数引用
    this.updateBlockPosition = options.updateBlockPosition;
    this.updateArrowPosition = options.updateArrowPosition;
    this.getBlockElement = options.getBlockElement;
    this.getArrowElement = options.getArrowElement;
    this.getBlockById = options.getBlockById;
    this.getChildrenByParent = options.getChildrenByParent;
    this.calculateChildPosition = options.calculateChildPosition;
    this.addBlock = options.addBlock;
    this.mergeTempBlocks = options.mergeTempBlocks;
    this.syncBlockReferences = options.syncBlockReferences;
    this.getNextBlockId = options.getNextBlockId;
    this.rearrangeMe = options.rearrangeMe;
    this.checkOffset = options.checkOffset;
    
    // 状态变量
    this.blocks = [];
    this.blockstemp = [];
    this.paddingx = this.spacing_x;
    this.paddingy = this.spacing_y;
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    this.setupCreateFlowyEvents();
    this.setupMouseUpEvents();
    this.setupBlockEvents();
    this.setupMouseMoveEvents();
  }

  /**
   * 设置创建新块的事件
   */
  setupCreateFlowyEvents() {
    $(document).on('mousedown', '.create-flowy', (event) => {
      if (event.which === 1) {
        this.handleCreateFlowyMouseDown(event);
      }
    });
  }

  /**
   * 处理创建新块的鼠标按下事件
   */
  handleCreateFlowyMouseDown(event) {
    const original = $(event.target);
    let drag;

    // 创建拖拽元素
    if (original.hasClass('create-flowy')) {
      const newBlockId = this.getNextBlockId();
      original.clone()
        .addClass('block')
        .removeClass('create-flowy')
        .append('<input type="hidden" class="blockid" value="' + newBlockId + '">')
        .appendTo('body');
      original.addClass('dragnow');
      drag = $('.blockid[value=' + newBlockId + ']').parent();
    } else {
      const newBlockId = this.getNextBlockId();
      original.clone()
        .addClass('block')
        .removeClass('create-flowy')
        .append('<input type="hidden" class="blockid" value="' + parseInt(newBlockId) + '">')
        .appendTo('body');
      original.addClass('dragnow');
      drag = $('.blockid[value=' + parseInt(newBlockId) + ']').parent();
    }

    this.grab(original);
    drag.addClass('dragging');

    const dragx = event.clientX - original.offset().left;
    const dragy = event.clientY - original.offset().top;
    this.dragStateManager.startActiveDrag(drag, original, dragx, dragy);
    
    const position = this.positionCalculator.calculateDragPosition(
      { clientX: event.clientX, clientY: event.clientY },
      { x: dragx, y: dragy }
    );
    drag.css('left', position.left + 'px');
    drag.css('top', position.top + 'px');
  }

  /**
   * 设置鼠标释放事件
   */
  setupMouseUpEvents() {
    $(document).on('mouseup', (event) => {
      this.handleMouseUp(event);
    });
  }

  /**
   * 处理鼠标释放事件
   */
  handleMouseUp(event) {
    const isDragging = this.dragStateManager.isDragging();
    
    if (!isDragging) return;

    const drag = this.dragStateManager.getCurrentDragElement();
    if (!drag) return;

    // 更新状态引用
    this.blocks = this.blockManager.getAllBlocks();
    this.blockstemp = this.blockManager.getTempBlocks();

    // 处理不同的拖拽结束场景
    if (this.handleRearrangeEnd(drag)) return;
    if (this.handleNewBlockDrop(drag)) return;
    if (this.handleBlockSnapping(drag)) return;
    
    this.handleDragCleanup(drag);
  }

  /**
   * 处理重排结束
   */
  handleRearrangeEnd(drag) {
    if (parseInt(drag.children('.blockid').val()) == 0 && this.dragStateManager.isRearranging()) {
      drag.removeClass('dragging');
      this.dragStateManager.set('rearrange', false);
      
      for (var w = 0; w < this.blockstemp.length; w++) {
        if (this.blockstemp[w].id != parseInt(drag.children('.blockid').val())) {
          const blockEl = this.getBlockElement(this.blockstemp[w].id);
          const arrowEl = this.getArrowElement(this.blockstemp[w].id);
          
          const blockLeft = blockEl.offset().left - this.canvas_div.offset().left + this.canvas_div.scrollLeft();
          const blockTop = blockEl.offset().top - this.canvas_div.offset().top + this.canvas_div.scrollTop();
          const arrowLeft = arrowEl.offset().left - this.canvas_div.offset().left + this.canvas_div.scrollLeft();
          const arrowTop = arrowEl.offset().top - this.canvas_div.offset().top + this.canvas_div.scrollTop();
          
          this.updateBlockPosition(this.blockstemp[w].id, blockLeft, blockTop);
          this.updateArrowPosition(this.blockstemp[w].id, arrowLeft, arrowTop);
          
          blockEl.appendTo(this.canvas_div);
          arrowEl.appendTo(this.canvas_div);

          const blockEl2 = this.getBlockElement(this.blockstemp[w].id);
          this.blockstemp[w].x = blockEl2.offset().left + blockEl2.innerWidth() / 2 + this.canvas_div.scrollLeft();
          this.blockstemp[w].y = blockEl2.offset().top + blockEl2.innerHeight() / 2 + this.canvas_div.scrollTop();
        }
      }
      
      this.blockstemp.filter(a => a.id == 0)[0].x = drag.offset().left + drag.innerWidth() / 2;
      this.blockstemp.filter(a => a.id == 0)[0].y = drag.offset().top + drag.innerHeight() / 2;
      this.mergeTempBlocks();
      return true;
    }
    return false;
  }

  /**
   * 处理新块放置
   */
  handleNewBlockDrop(drag) {
    if (this.dragStateManager.isActiveDragging() && 
        this.blocks.length == 0 && 
        drag.offset().top > this.canvas_div.offset().top && 
        drag.offset().left > this.canvas_div.offset().left) {
      
      this.snapping(drag);
      this.dragStateManager.set('active', false);
      
      const canvasPosition = this.positionCalculator.calculateCanvasPosition(
        { left: drag.offset().left, top: drag.offset().top },
        {
          offsetLeft: this.canvas_div.offset().left,
          offsetTop: this.canvas_div.offset().top,
          scrollLeft: this.canvas_div.scrollLeft(),
          scrollTop: this.canvas_div.scrollTop()
        }
      );

      const newBlock = {
        childwidth: 0,
        parent: -1,
        id: parseInt(drag.children('.blockid').val()),
        x: canvasPosition.x,
        y: canvasPosition.y,
        width: drag.innerWidth(),
        height: drag.innerHeight(),
      };

      this.addBlock(newBlock);
      $('.dragnow').removeClass('dragnow');
      return true;
    }
    return false;
  }

  /**
   * 处理块吸附
   */
  handleBlockSnapping(drag) {
    if (this.dragStateManager.isActiveDragging() && this.blocks.length > 0) {
      return this.processBlockSnapping(drag);
    }
    return false;
  }

  /**
   * 处理拖拽清理
   */
  handleDragCleanup(drag) {
    if (this.dragStateManager.isRearranging()) {
      this.dragStateManager.set('rearrange', false);
      this.blockstemp = [];
    }
    this.dragStateManager.set('active', false);
    drag.remove();
  }

  /**
   * 设置块拖拽事件
   */
  setupBlockEvents() {
    $(document).on('mousedown', '.block', (event) => {
      $(document).on('mouseup mousemove', '.block', (event) => {
        this.handleBlockEvent(event);
      });
    });
  }

  /**
   * 处理块事件
   */
  handleBlockEvent(event) {
    if (event.type !== 'mouseup') {
      if (event.which === 1) {
        this.handleBlockDrag(event);
      }
    }
    $(document).off('mouseup mousemove', this.handleBlockEvent);
  }

  /**
   * 处理块拖拽
   */
  handleBlockDrag(event) {
    const isCurrentlyDragging = this.dragStateManager.isDragging();

    if (!isCurrentlyDragging) {
      const drag = $(event.target);
      drag.addClass('dragging');
      const dragx = event.clientX - drag.offset().left;
      const dragy = event.clientY - drag.offset().top;
      const blockid = parseInt(drag.children('.blockid').val());

      this.dragStateManager.startRearrange(drag, dragx, dragy);
      this.blockstemp.push(this.getBlockById(blockid));
      this.blocks = $.grep(this.blocks, (e) => e.id != blockid);
      
      // 处理子块拖拽逻辑
      this.handleChildBlockDragging(drag, blockid);
      
      // 重新排列和检查偏移
      this.syncBlockReferences();
      this.updateParentChildWidths();
      
      if (this.blocks.length > 1) {
        this.rearrangeMe();
      }
      if (this.lastevent) {
        this.checkOffset();
      }
    }
  }

  /**
   * 设置鼠标移动事件
   */
  setupMouseMoveEvents() {
    $(document).on('mousemove', (event) => {
      this.handleMouseMove(event);
    });
  }

  /**
   * 处理鼠标移动事件
   */
  handleMouseMove(event) {
    const isActive = this.dragStateManager.isActiveDragging();
    const isRearranging = this.dragStateManager.isRearranging();
    const drag = this.dragStateManager.getCurrentDragElement();
    const dragOffset = this.dragStateManager.getDragOffset();

    if (isActive && drag) {
      this.handleActiveDragMove(event, drag, dragOffset);
    } else if (isRearranging && drag) {
      this.handleRearrangeDragMove(event, drag, dragOffset);
    }

    this.handleSnappingDetection(event, drag);
  }

  /**
   * 处理活动拖拽移动
   */
  handleActiveDragMove(event, drag, dragOffset) {
    const position = this.positionCalculator.calculateDragPosition(
      { clientX: event.clientX, clientY: event.clientY },
      { x: dragOffset.x, y: dragOffset.y }
    );
    drag.css('left', position.left + 'px');
    drag.css('top', position.top + 'px');
  }

  /**
   * 处理重排拖拽移动
   */
  handleRearrangeDragMove(event, drag, dragOffset) {
    const position = this.positionCalculator.calculateRearrangeDragPosition(
      { clientX: event.clientX, clientY: event.clientY },
      { x: dragOffset.x, y: dragOffset.y },
      {
        offsetLeft: this.canvas_div.offset().left,
        offsetTop: this.canvas_div.offset().top,
        scrollLeft: this.canvas_div.scrollLeft(),
        scrollTop: this.canvas_div.scrollTop()
      }
    );
    drag.css('left', position.left + 'px');
    drag.css('top', position.top + 'px');
  }

  /**
   * 处理吸附检测
   */
  handleSnappingDetection(event, drag) {
    if (this.dragStateManager.isDragging() && drag) {
      const blockCenter = this.positionCalculator.calculateBlockCenter(
        { left: drag.offset().left, top: drag.offset().top },
        { width: drag.innerWidth(), height: drag.innerHeight() },
        { scrollLeft: this.canvas_div.scrollLeft(), scrollTop: this.canvas_div.scrollTop() }
      );

      this.blockstemp.filter(
        a => a.id == parseInt(drag.children('.blockid').val())
      )[0].x = blockCenter.x;
      this.blockstemp.filter(
        a => a.id == parseInt(drag.children('.blockid').val())
      )[0].y = blockCenter.y;

      // 吸附检测逻辑
      if (this.snapEngine) {
        const xpos = drag.offset().left + this.canvas_div.scrollLeft();
        const ypos = drag.offset().top + this.canvas_div.scrollTop();
        const snapResult = this.snapEngine.detectSnapping(xpos, ypos, this.blocks);

        if (snapResult && snapResult.indicatorPosition) {
          const targetBlockElement = $('.blockid[value=' + snapResult.targetBlockId + ']').parent();
          $('.indicator').appendTo(targetBlockElement);
          $('.indicator').css({
            'left': snapResult.indicatorPosition.left + 'px',
            'top': snapResult.indicatorPosition.top + 'px'
          });
          $('.indicator').removeClass('invisible');
        } else {
          $('.indicator').addClass('invisible');
        }
      }
    }
  }

  // 其他辅助方法...
  updateParentChildWidths() {
    const allParentIds = [...new Set(this.blocks.map(b => b.parent).filter(p => p !== -1))];
    allParentIds.forEach(parentId => {
      const parentBlock = this.blocks.find(b => b.id === parentId);
      if (parentBlock) {
        const children = this.blocks.filter(b => b.parent === parentId);
        let totalChildWidth = 0;
        children.forEach((child, index) => {
          const childWidth = child.childwidth > child.width ? child.childwidth : child.width;
          totalChildWidth += childWidth;
          if (index < children.length - 1) {
            totalChildWidth += this.paddingx;
          }
        });
        parentBlock.childwidth = totalChildWidth;
      }
    });
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventHandler;
} else if (typeof window !== 'undefined') {
  window.EventHandler = EventHandler;
}
