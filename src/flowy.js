// 模块加载函数
function getBlockManager() {
  if (typeof window !== 'undefined' && window.BlockManager) {
    return new window.BlockManager();
  }
  if (typeof require !== 'undefined') {
    try {
      const BlockManager = require('./core/block-manager.js');
      return new BlockManager();
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getSnapEngine(paddingx, paddingy, snappingCallback) {
  if (typeof window !== 'undefined' && window.SnapEngine) {
    return new window.SnapEngine(paddingx, paddingy, snappingCallback);
  }
  if (typeof require !== 'undefined') {
    try {
      const SnapEngine = require('./core/snap-engine.js');
      return new SnapEngine(paddingx, paddingy, snappingCallback);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getDomUtils() {
  if (typeof window !== 'undefined' && window.DomUtils) {
    return window.DomUtils;
  }
  if (typeof require !== 'undefined') {
    try {
      const DomUtils = require('./utils/dom-utils.js');
      return DomUtils;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getDragStateManager() {
  if (typeof window !== 'undefined' && window.DragStateManager) {
    return new window.DragStateManager();
  }
  if (typeof require !== 'undefined') {
    try {
      const DragStateManager = require('./core/drag-state-manager.js');
      return new DragStateManager();
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getPositionCalculator() {
  if (typeof window !== 'undefined' && window.PositionCalculator) {
    return new window.PositionCalculator();
  }
  if (typeof require !== 'undefined') {
    try {
      const PositionCalculator = require('./services/position-calculator.js');
      return new PositionCalculator();
    } catch (e) {
      return null;
    }
  }
  return null;
}

const flowy = function (canvas, grab, release, snapping, spacing_x, spacing_y) {
  if (!grab) {
    grab = function () {};
  }
  if (!release) {
    release = function () {};
  }
  if (!snapping) {
    snapping = function () {};
  }
  if (!spacing_x) {
    spacing_x = 20;
  }
  if (!spacing_y) {
    spacing_y = 80;
  }
  $(document).ready(function () {
    const blockManager = getBlockManager();
    const snapEngine = getSnapEngine(spacing_x, spacing_y, snapping);
    const domUtils = getDomUtils();
    const dragStateManager = getDragStateManager();
    const positionCalculator = getPositionCalculator();

    // 🔧 验证核心服务可用性，快速失败原则
    if (!dragStateManager) {
      throw new Error('DragStateManager service is required but not available');
    }
    if (!positionCalculator) {
      throw new Error('PositionCalculator service is required but not available');
    }

    // 🔧 修复：确保blocks数组被正确初始化，与原版保持一致
    let blocks = [];
    let blockstemp = [];

    // 如果blockManager可用，尝试从中获取现有数据
    if (blockManager) {
      const existingBlocks = blockManager.getAllBlocks();
      const existingTemp = blockManager.getTempBlocks();
      if (Array.isArray(existingBlocks)) {
        blocks = existingBlocks;
      }
      if (Array.isArray(existingTemp)) {
        blockstemp = existingTemp;
      }
    }

    // 🔧 暴露关键变量到全局作用域，便于调试和与原版保持一致
    window.blocks = blocks;
    window.blockstemp = blockstemp;
    window.blockManager = blockManager;
    window.dragStateManager = dragStateManager;
    window.snapEngine = snapEngine;
    window.positionCalculator = positionCalculator;
    const canvas_div = canvas;
    function syncBlockReferences() {
        if (blockManager) {
            blocks = blockManager.getAllBlocks();
            blockstemp = blockManager.getTempBlocks();
        }
    }

    function getBlockCount() {
      return blockManager ? blockManager.getBlockCount() : 0;
    }
    function getNextBlockId() {
      return blockManager ? blockManager.getNextBlockId() : 0;
    }

    function clearAllBlocks() {
      if (blockManager) {
        blockManager.clearAll();
        syncBlockReferences();
      }
    }

    function addBlock(blockData) {
      if (blockManager) {
        blockManager.addBlock(blockData);
      }
    }

    function mergeTempBlocks() {
      if (blockManager) {
        blockManager.mergeTempBlocks();
        syncBlockReferences();
      }
    }

    function removeBlockById(blockId) {
      if (blockManager) {
        blockManager.removeBlocks(function (block) {
          return block.id != blockId;
        });
        syncBlockReferences();
      }
    }
    // 🔧 使用拖拽状态管理器替代传统状态变量
    // 保留兼容性的访问器函数
    const paddingx = spacing_x;
    const paddingy = spacing_y;



    // 辅助状态仍使用传统方式（后续可迁移）
    let offsetleft = 0;
    let offsetleftold = 0;
    let lastevent = false;
    if (canvas_div && typeof canvas_div.append === 'function') {
      canvas_div.append("<div class='indicator invisible'></div>");
    }
    flowy.output = function () {
      if (!blockManager) return undefined;

      const blocks = blockManager.getAllBlocks();
      if (blocks.length === 0) return undefined;

      const json_data = [];
      for (var i = 0; i < blocks.length; i++) {
        json_data.push({
          id: blocks[i].id,
          parent: blocks[i].parent,
          data: [],
        });
        $('.blockid[value=' + blocks[i].id + ']')
          .parent()
          .children('input')
          .each(function () {
            const json_name = $(this).attr('name');
            const json_value = $(this).val();
            json_data[i].data.push({
              name: json_name,
              value: json_value,
            });
          });
      }
      return json_data;
    };
    flowy.deleteBlocks = function () {
      clearAllBlocks();
      // 重新创建indicator元素，优先使用DomUtils
      if (domUtils) {
        try {
          const indicatorElement = domUtils.createElement('div', {
            'class': 'indicator invisible'
          });
          canvas_div.empty().append(indicatorElement);
        } catch (e) {
          canvas_div.html("<div class='indicator invisible'></div>");
        }
      } else {
        canvas_div.html("<div class='indicator invisible'></div>");
      }
    };
    $(document).on('mousedown', '.create-flowy', function (event) {
      if (event.which === 1) {
        const original = $(this);
        let drag;

        if (getBlockCount() == 0) {
          var newBlockId = getBlockCount(); // 当blocks为空时，使用0作为第一个ID
          $(this)
            .clone()
            .addClass('block')
            .append(
              "<input type='hidden' name='blockid' class='blockid' value='" +
                newBlockId +
                "'>"
            )
            .removeClass('create-flowy')
            .appendTo('body');
          $(this).addClass('dragnow');
          drag = $('.blockid[value=' + newBlockId + ']').parent();
        } else {
          var newBlockId = getNextBlockId();
          $(this)
            .clone()
            .addClass('block')
            .append(
              "<input type='hidden' name='blockid' class='blockid' value='" +
                newBlockId +
                "'>"
            )
            .removeClass('create-flowy')
            .appendTo('body');
          $(this).addClass('dragnow');
          drag = $('.blockid[value=' + parseInt(newBlockId) + ']').parent();
        }

        blockGrabbed($(this));
        drag.addClass('dragging');

        // 🔧 使用拖拽状态管理器
        const dragx = event.clientX - $(this).offset().left;
        const dragy = event.clientY - $(this).offset().top;

        if (dragStateManager) {
          dragStateManager.startActiveDrag(drag, original, dragx, dragy);
        }

        // 🔧 使用位置计算服务计算拖拽位置
        const position = positionCalculator.calculateDragPosition(
          { clientX: event.clientX, clientY: event.clientY },
          { x: dragx, y: dragy }
        );
        drag.css('left', position.left + 'px');
        drag.css('top', position.top + 'px');
      }
    });
    $(document).on('mouseup', function (event) {
      // 🔧 使用拖拽状态管理器检查拖拽状态
      const isDragging = dragStateManager.isDragging();

      if (event.which === 1 && isDragging) {
        blockReleased();
        if (!$('.indicator').hasClass('invisible')) {
          $('.indicator').addClass('invisible');
        }

        // 获取当前拖拽状态和元素
        const isActive = dragStateManager.isActiveDragging();
        const drag = dragStateManager.getCurrentDragElement();
        const original = dragStateManager.getOriginalElement();

        if (isActive && original && drag) {
          original.removeClass('dragnow');
          drag.removeClass('dragging');
        }
        const isRearranging = dragStateManager ? dragStateManager.isRearranging() : getRearrange();
        if (parseInt(drag.children('.blockid').val()) == 0 && isRearranging) {
          drag.removeClass('dragging');
          if (dragStateManager) {
            dragStateManager.set('rearrange', false);
          }
          for (var w = 0; w < blockstemp.length; w++) {
            if (blockstemp[w].id != parseInt(drag.children('.blockid').val())) {
              $('.blockid[value=' + blockstemp[w].id + ']')
                .parent()
                .css(
                  'left',
                  $('.blockid[value=' + blockstemp[w].id + ']')
                    .parent()
                    .offset().left -
                    canvas_div.offset().left +
                    canvas_div.scrollLeft()
                );
              $('.blockid[value=' + blockstemp[w].id + ']')
                .parent()
                .css(
                  'top',
                  $('.blockid[value=' + blockstemp[w].id + ']')
                    .parent()
                    .offset().top -
                    canvas_div.offset().top +
                    canvas_div.scrollTop()
                );
              $('.arrowid[value=' + blockstemp[w].id + ']')
                .parent()
                .css(
                  'left',
                  $('.arrowid[value=' + blockstemp[w].id + ']')
                    .parent()
                    .offset().left -
                    canvas_div.offset().left +
                    canvas_div.scrollLeft()
                );
              $('.arrowid[value=' + blockstemp[w].id + ']')
                .parent()
                .css(
                  'top',
                  $('.arrowid[value=' + blockstemp[w].id + ']')
                    .parent()
                    .offset().top -
                    canvas_div.offset().top +
                    canvas_div.scrollTop() +
                    'px'
                );
              $('.blockid[value=' + blockstemp[w].id + ']')
                .parent()
                .appendTo(canvas_div);
              $('.arrowid[value=' + blockstemp[w].id + ']')
                .parent()
                .appendTo(canvas_div);

              blockstemp[w].x =
                $('.blockid[value=' + blockstemp[w].id + ']')
                  .parent()
                  .offset().left +
                $('.blockid[value=' + blockstemp[w].id + ']').innerWidth() / 2 +
                canvas_div.scrollLeft();
              blockstemp[w].y =
                $('.blockid[value=' + blockstemp[w].id + ']')
                  .parent()
                  .offset().top +
                $('.blockid[value=' + blockstemp[w].id + ']')
                  .parent()
                  .innerHeight() /
                  2 +
                canvas_div.scrollTop();
            }
          }
          blockstemp.filter(a => a.id == 0)[0].x =
            drag.offset().left + drag.innerWidth() / 2;
          blockstemp.filter(a => a.id == 0)[0].y =
            drag.offset().top + drag.innerHeight() / 2;
          mergeTempBlocks();
        } else if (
          (dragStateManager ? dragStateManager.isActiveDragging() : getActive()) &&
          blocks.length == 0 &&
          drag.offset().top > canvas_div.offset().top &&
          drag.offset().left > canvas_div.offset().left
        ) {
          blockSnap(drag);
          if (dragStateManager) {
            dragStateManager.set('active', false);
          }
          // 🔧 使用位置计算服务进行画布坐标转换
          const canvasPosition = positionCalculator.calculateCanvasPosition(
            { left: drag.offset().left, top: drag.offset().top },
            {
              offsetLeft: canvas_div.offset().left,
              offsetTop: canvas_div.offset().top,
              scrollLeft: canvas_div.scrollLeft(),
              scrollTop: canvas_div.scrollTop()
            }
          );
          drag.css('left', canvasPosition.left + 'px');
          drag.css('top', canvasPosition.top + 'px');
          drag.appendTo(canvas_div);
          // 🔧 使用位置计算服务计算块中心点
          const blockCenter = positionCalculator.calculateBlockCenter(
            { left: drag.offset().left, top: drag.offset().top },
            { width: drag.innerWidth(), height: drag.innerHeight() },
            { scrollLeft: canvas_div.scrollLeft(), scrollTop: canvas_div.scrollTop() }
          );

          addBlock({
            parent: -1,
            childwidth: 0,
            id: parseInt(drag.children('.blockid').val()),
            x: blockCenter.x,
            y: blockCenter.y,
            width: drag.innerWidth(),
            height: drag.innerHeight(),
          });
        } else if ((dragStateManager ? dragStateManager.isActiveDragging() : getActive()) && blocks.length == 0) {
          // 🔧 修复：与原版保持一致，使用blocks.length而不是getBlockCount()
          // 完全清理拖拽元素和相关状态
          drag.remove();

          // 清理拖拽状态
          if (dragStateManager) {
            dragStateManager.endDrag();
          }
        } else if ((dragStateManager ? dragStateManager.isDragging() : (getActive() || getRearrange()))) {
          // 🔧 修复：当没有块时，直接删除拖拽元素，与原版保持一致
          if (blocks.length === 0) {
            drag.remove();
            return;
          }

          const xpos =
            drag.offset().left +
            drag.innerWidth() / 2 +
            canvas_div.scrollLeft();
          const ypos = drag.offset().top + canvas_div.scrollTop();
          const blocko = blocks.map(a => a.id);

          for (var i = 0; i < blocks.length; i++) {
            const targetBlock = blocks.filter(a => a.id == blocko[i])[0];
            const xMin = targetBlock.x - targetBlock.width / 2 - paddingx;
            const xMax = targetBlock.x + targetBlock.width / 2 + paddingx;
            const yMin = targetBlock.y - targetBlock.height / 2;
            const yMax = targetBlock.y + targetBlock.height;

            const xInRange = xpos >= xMin && xpos <= xMax;
            const yInRange = ypos >= yMin && ypos <= yMax;

            const snapCheckInfo = {
              blockId: blocko[i],
              targetBlock: { x: targetBlock.x, y: targetBlock.y, width: targetBlock.width, height: targetBlock.height },
              dragPos: { x: xpos, y: ypos },
              xRange: { min: xMin, max: xMax, inRange: xInRange },
              yRange: { min: yMin, max: yMax, inRange: yInRange },
              shouldSnap: xInRange && yInRange,
              paddingx: paddingx
            };


            if (xInRange && yInRange) {
              if (dragStateManager) {
                dragStateManager.set('active', false);
              }
              const currentRearrange = dragStateManager ? dragStateManager.isRearranging() : getRearrange();
              if (!currentRearrange) {
                blockSnap(drag);
                drag.appendTo(canvas_div);
              }
              let totalwidth = 0;
              let totalremove = 0;
              const maxheight = 0;

              // 🔧 恢复原始算法：与原版完全一致的子块过滤逻辑
              for (var w = 0; w < blocks.filter(id => id.parent == blocko[i]).length; w++) {
                var children = blocks.filter(id => id.parent == blocko[i])[w];
                if (children.childwidth > children.width) {
                  totalwidth += children.childwidth + paddingx;
                } else {
                  totalwidth += children.width + paddingx;
                }
              }
              totalwidth += drag.innerWidth();

              // 🔧 恢复原始算法：与原版完全一致的子块重新定位逻辑
              for (var w = 0; w < blocks.filter(id => id.parent == blocko[i]).length; w++) {
                var children = blocks.filter(id => id.parent == blocko[i])[w];
                if (children.childwidth > children.width) {
                  $('.blockid[value=' + children.id + ']')
                    .parent()
                    .css(
                      'left',
                      blocks.filter(a => a.id == blocko[i])[0].x -
                        totalwidth / 2 +
                        totalremove +
                        children.childwidth / 2 -
                        children.width / 2 +
                        'px'
                    );
                  // 🔧 关键修复：避免循环引用，使用父块位置作为基准
                  // 当只有一个子块时，使用父块的x坐标；多个子块时使用第一个已存在子块的x坐标
                  const existingChildren = blocks.filter(id => id.parent == blocko[i] && id.id != parseInt(drag.children(".blockid").val()));
                  const referenceX = existingChildren.length > 0
                    ? existingChildren[0].x
                    : blocks.filter(a => a.id == blocko[i])[0].x;
                  children.x = referenceX - totalwidth / 2 + totalremove + children.childwidth / 2;
                  totalremove += children.childwidth + paddingx;
                } else {
                  $('.blockid[value=' + children.id + ']')
                    .parent()
                    .css(
                      'left',
                      blocks.filter(a => a.id == blocko[i])[0].x -
                        totalwidth / 2 +
                        totalremove +
                        'px'
                    );
                  // 🔧 关键修复：避免循环引用，使用父块位置作为基准
                  // 当只有一个子块时，使用父块的x坐标；多个子块时使用第一个已存在子块的x坐标
                  const existingChildren2 = blocks.filter(id => id.parent == blocko[i] && id.id != parseInt(drag.children(".blockid").val()));
                  const referenceX2 = existingChildren2.length > 0
                    ? existingChildren2[0].x
                    : blocks.filter(a => a.id == blocko[i])[0].x;
                  children.x = referenceX2 - totalwidth / 2 + totalremove + children.width / 2;
                  totalremove += children.width + paddingx;
                }
              }
              // 🔧 恢复原始算法：与原版完全一致的最终位置计算
              drag.css('left', blocks.filter(id => id.id == blocko[i])[0].x - (totalwidth / 2) + totalremove - canvas_div.offset().left + canvas_div.scrollLeft() + 'px');
              drag.css(
                'top',
                blocks.filter(id => id.id == blocko[i])[0].y +
                  blocks.filter(id => id.id == blocko[i])[0].height / 2 +
                  paddingy -
                  canvas_div.offset().top +
                  'px'
              );
              if (dragStateManager ? dragStateManager.isRearranging() : getRearrange()) {
                blockstemp.filter(
                  a => a.id == parseInt(drag.children('.blockid').val())
                )[0].x =
                  drag.offset().left +
                  drag.innerWidth() / 2 +
                  canvas_div.scrollLeft();
                blockstemp.filter(
                  a => a.id == parseInt(drag.children('.blockid').val())
                )[0].y =
                  drag.offset().top +
                  drag.innerHeight() / 2 +
                  canvas_div.scrollTop();
                blockstemp.filter(
                  a => a.id == drag.children('.blockid').val()
                )[0].parent = blocko[i];
                for (var w = 0; w < blockstemp.length; w++) {
                  if (
                    blockstemp[w].id !=
                    parseInt(drag.children('.blockid').val())
                  ) {
                    $('.blockid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .css(
                        'left',
                        $('.blockid[value=' + blockstemp[w].id + ']')
                          .parent()
                          .offset().left -
                          canvas_div.offset().left +
                          canvas_div.scrollLeft()
                      );
                    $('.blockid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .css(
                        'top',
                        $('.blockid[value=' + blockstemp[w].id + ']')
                          .parent()
                          .offset().top -
                          canvas_div.offset().top +
                          canvas_div.scrollTop()
                      );
                    $('.arrowid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .css(
                        'left',
                        $('.arrowid[value=' + blockstemp[w].id + ']')
                          .parent()
                          .offset().left -
                          canvas_div.offset().left +
                          canvas_div.scrollLeft() +
                          20
                      );
                    $('.arrowid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .css(
                        'top',
                        $('.arrowid[value=' + blockstemp[w].id + ']')
                          .parent()
                          .offset().top -
                          canvas_div.offset().top +
                          canvas_div.scrollTop()
                      );
                    $('.blockid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .appendTo(canvas_div);
                    $('.arrowid[value=' + blockstemp[w].id + ']')
                      .parent()
                      .appendTo(canvas_div);

                    blockstemp[w].x =
                      $('.blockid[value=' + blockstemp[w].id + ']')
                        .parent()
                        .offset().left +
                      $(
                        '.blockid[value=' + blockstemp[w].id + ']'
                      ).innerWidth() /
                        2 +
                      canvas_div.scrollLeft();
                    blockstemp[w].y =
                      $('.blockid[value=' + blockstemp[w].id + ']')
                        .parent()
                        .offset().top +
                      $('.blockid[value=' + blockstemp[w].id + ']')
                        .parent()
                        .innerHeight() /
                        2 +
                      canvas_div.scrollTop();
                  }
                }
                mergeTempBlocks();
              } else {
                // 🔧 修复：恢复原版逻辑，基于DOM位置计算数据坐标
                addBlock({
                  childwidth: 0,
                  parent: blocko[i],
                  id: parseInt(drag.children('.blockid').val()),
                  x:
                    drag.offset().left +
                    drag.innerWidth() / 2 +
                    canvas_div.scrollLeft(),
                  y:
                    drag.offset().top +
                    drag.innerHeight() / 2 +
                    canvas_div.scrollTop(),
                  width: drag.innerWidth(),
                  height: drag.innerHeight(),
                });
                syncBlockReferences();
              }
              syncBlockReferences();
              const arrowhelp = blocks.filter(
                a => a.id == parseInt(drag.children('.blockid').val())
              )[0];
              const arrowx =
                arrowhelp.x - blocks.filter(a => a.id == blocko[i])[0].x + 20;
              const parentBlock = blocks.filter(a => a.id == blocko[i])[0];
              const arrowy =
                arrowhelp.y -
                arrowhelp.height / 2 -
                (parentBlock.y + parentBlock.height / 2) +
                canvas_div.scrollTop();


              if (arrowx < 0) {
                drag.after(
                  '<div class="arrowblock"><input type="hidden" class="arrowid" value="' +
                    drag.children('.blockid').val() +
                    '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' +
                    (blocks.filter(a => a.id == blocko[i])[0].x -
                      arrowhelp.x +
                      5) +
                    ' 0L' +
                    (blocks.filter(a => a.id == blocko[i])[0].x -
                      arrowhelp.x +
                      5) +
                    ' ' +
                    paddingy / 2 +
                    'L5 ' +
                    paddingy / 2 +
                    'L5 ' +
                    arrowy +
                    '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' +
                    (arrowy - 5) +
                    'H10L5 ' +
                    arrowy +
                    'L0 ' +
                    (arrowy - 5) +
                    'Z" fill="#C5CCD0"/></svg></div>'
                );
                $('.arrowid[value=' + drag.children('.blockid').val() + ']')
                  .parent()
                  .css(
                    'left',
                    arrowhelp.x -
                      5 -
                      canvas_div.offset().left +
                      canvas_div.scrollLeft() +
                      'px'
                  );
                $('.arrowid[value=' + drag.children('.blockid').val() + ']')
                  .parent()
                  .css(
                    'top',
                    blocks.filter(a => a.id == blocko[i])[0].y +
                      blocks.filter(a => a.id == blocko[i])[0].height / 2 -
                      canvas_div.offset().top +
                      canvas_div.scrollTop() +
                      'px'
                  );
              } else {
                const svgPath = `M20 0L20 ${paddingy / 2}L${arrowx} ${paddingy / 2}L${arrowx} ${arrowy}`;

                drag.after(
                  '<div class="arrowblock"><input type="hidden" class="arrowid" value="' +
                    drag.children('.blockid').val() +
                    '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="' +
                    svgPath +
                    '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' +
                    (arrowx - 5) +
                    ' ' +
                    (arrowy - 5) +
                    'H' +
                    (arrowx + 5) +
                    'L' +
                    arrowx +
                    ' ' +
                    arrowy +
                    'L' +
                    (arrowx - 5) +
                    ' ' +
                    (arrowy - 5) +
                    'Z" fill="#C5CCD0"/></svg></div>'
                );
                $(
                  '.arrowid[value=' +
                    parseInt(drag.children('.blockid').val()) +
                    ']'
                )
                  .parent()
                  .css(
                    'left',
                    blocks.filter(a => a.id == blocko[i])[0].x -
                      20 -
                      canvas_div.offset().left +
                      canvas_div.scrollLeft() +
                      'px'
                  );
              }
              $(
                '.arrowid[value=' +
                  parseInt(drag.children('.blockid').val()) +
                  ']'
              )
                .parent()
                .css(
                  'top',
                  blocks.filter(a => a.id == blocko[i])[0].y +
                    blocks.filter(a => a.id == blocko[i])[0].height / 2 -
                    canvas_div.offset().top +
                    canvas_div.scrollTop() +
                    'px'
                );
              if (blocks.filter(a => a.id == blocko[i])[0].parent != -1) {
                let flag = false;
                var idval = blocko[i];
                while (!flag) {
                  if (blocks.filter(a => a.id == idval)[0].parent == -1) {
                    flag = true;
                  } else {
                    let zwidth = 0;
                    for (
                      var w = 0;
                      w < blocks.filter(id => id.parent == idval).length;
                      w++
                    ) {
                      var children = blocks.filter(id => id.parent == idval)[w];
                      if (children.childwidth > children.width) {
                        if (
                          w ==
                          blocks.filter(id => id.parent == idval).length - 1
                        ) {
                          zwidth += children.childwidth;
                        } else {
                          zwidth += children.childwidth + paddingx;
                        }
                      } else {
                        if (
                          w ==
                          blocks.filter(id => id.parent == idval).length - 1
                        ) {
                          zwidth += children.width;
                        } else {
                          zwidth += children.width + paddingx;
                        }
                      }
                    }
                    blocks.filter(a => a.id == idval)[0].childwidth = zwidth;
                    idval = blocks.filter(a => a.id == idval)[0].parent;
                  }
                }
                blocks.filter(id => id.id == idval)[0].childwidth = totalwidth;
              }
              const currentRearrangeState = dragStateManager ? dragStateManager.isRearranging() : getRearrange();
              if (currentRearrangeState) {
                if (dragStateManager) {
                  dragStateManager.set('rearrange', false);
                }
                drag.removeClass('dragging');
              }
              rearrangeMe();
              checkOffset();
              break;
            } else if (i == blocks.length - 1) {
              const currentRearrange2 = dragStateManager ? dragStateManager.isRearranging() : getRearrange();
              if (currentRearrange2) {
                if (dragStateManager) {
                  dragStateManager.set('rearrange', false);
                }
                blockstemp = [];
              }
              if (dragStateManager) {
                dragStateManager.set('active', false);
              }
              drag.remove();
            }
          }
        }
      }
    });
    $(document).on('mousedown', '.block', function (event) {
      $(document).on('mouseup mousemove', '.block', function handler(event) {
        if (event.type !== 'mouseup') {
          if (event.which === 1) {
            // 🔧 使用拖拽状态管理器检查状态
            const isCurrentlyDragging = dragStateManager.isDragging();

            if (!isCurrentlyDragging) {
              const drag = $(this);
              drag.addClass('dragging');
              const dragx = event.clientX - $(this).offset().left;
              const dragy = event.clientY - $(this).offset().top;
              const blockid = parseInt($(this).children('.blockid').val());

              // 🔧 使用拖拽状态管理器开始重排
              if (dragStateManager) {
                dragStateManager.startRearrange(drag, dragx, dragy);
              }
              blockstemp.push(blocks.filter(a => a.id == blockid)[0]);
              blocks = $.grep(blocks, function(e) {
                return e.id != blockid;
              });
              $('.arrowid[value=' + blockid + ']')
                .parent()
                .remove();
              let layer = blocks.filter(a => a.parent == blockid);
              let flag = false;
              let foundids = [];
              const allids = [];
              while (!flag) {
                for (var i = 0; i < layer.length; i++) {
                  blockstemp.push(blocks.filter(a => a.id == layer[i].id)[0]);
                  $('.blockid[value=' + layer[i].id + ']')
                    .parent()
                    .css(
                      'left',
                      $('.blockid[value=' + layer[i].id + ']')
                        .parent()
                        .offset().left - drag.offset().left
                    );
                  $('.blockid[value=' + layer[i].id + ']')
                    .parent()
                    .css(
                      'top',
                      $('.blockid[value=' + layer[i].id + ']')
                        .parent()
                        .offset().top - drag.offset().top
                    );
                  $('.arrowid[value=' + layer[i].id + ']')
                    .parent()
                    .css(
                      'left',
                      $('.arrowid[value=' + layer[i].id + ']')
                        .parent()
                        .offset().left - drag.offset().left
                    );
                  $('.arrowid[value=' + layer[i].id + ']')
                    .parent()
                    .css(
                      'top',
                      $('.arrowid[value=' + layer[i].id + ']')
                        .parent()
                        .offset().top - drag.offset().top
                    );
                  $('.blockid[value=' + layer[i].id + ']')
                    .parent()
                    .appendTo(drag);
                  $('.arrowid[value=' + layer[i].id + ']')
                    .parent()
                    .appendTo(drag);
                  foundids.push(layer[i].id);
                  allids.push(layer[i].id);
                }
                if (foundids.length == 0) {
                  flag = true;
                } else {
                  layer = blocks.filter(a => foundids.includes(a.parent));
                  foundids = [];
                }
              }
              // 🔧 终极修复：确保blockManager和blocks数组完全同步
              for (
                var i = 0;
                i < blocks.filter(a => a.parent == blockid).length;
                i++
              ) {
                var blocknumber = blocks.filter(a => a.parent == blockid)[i];
                // 从blockManager中删除
                if (blockManager) {
                  blockManager.removeBlocks(function(block) {
                    return block.id !== blocknumber.id;
                  });
                }
              }
              for (var i = 0; i < allids.length; i++) {
                var blocknumber = allids[i];
                // 从blockManager中删除
                if (blockManager) {
                  blockManager.removeBlocks(function(block) {
                    return block.id !== blocknumber;
                  });
                }
              }
              // 同步blocks数组
              syncBlockReferences();

              // 🔧 修复：子块移除后，重新计算所有父块的childwidth
              syncBlockReferences();
              const allParentIds = [...new Set(blocks.map(b => b.parent).filter(p => p !== -1))];
              allParentIds.forEach(parentId => {
                const parentBlock = blocks.find(b => b.id === parentId);
                if (parentBlock) {
                  const children = blocks.filter(b => b.parent === parentId);
                  let totalChildWidth = 0;
                  children.forEach((child, index) => {
                    const childWidth = child.childwidth > child.width ? child.childwidth : child.width;
                    totalChildWidth += childWidth;
                    if (index < children.length - 1) {
                      totalChildWidth += paddingx;
                    }
                  });
                  parentBlock.childwidth = totalChildWidth;
                }
              });

              if (blocks.length > 1) {
                rearrangeMe();
              }
              if (lastevent) {
                fixOffset();
              }
            }
          }
        }
        $(document).off('mouseup mousemove', handler);
      });
    });
    $(document).on('mousemove', function (event) {
      // 🔧 使用拖拽状态管理器获取状态和元素
      const isActive = dragStateManager.isActiveDragging();
      const isRearranging = dragStateManager.isRearranging();
      const drag = dragStateManager.getCurrentDragElement();
      const dragOffset = dragStateManager.getDragOffset();

      if (isActive && drag) {
        // 🔧 使用位置计算服务计算基础拖拽位置
        const position = positionCalculator.calculateDragPosition(
          { clientX: event.clientX, clientY: event.clientY },
          { x: dragOffset.x, y: dragOffset.y }
        );
        drag.css('left', position.left + 'px');
        drag.css('top', position.top + 'px');
      } else if (isRearranging && drag) {
        // 🔧 使用位置计算服务计算重排拖拽位置
        const position = positionCalculator.calculateRearrangeDragPosition(
          { clientX: event.clientX, clientY: event.clientY },
          { x: dragOffset.x, y: dragOffset.y },
          {
            offsetLeft: canvas_div.offset().left,
            offsetTop: canvas_div.offset().top,
            scrollLeft: canvas_div.scrollLeft(),
            scrollTop: canvas_div.scrollTop()
          }
        );
        drag.css('left', position.left + 'px');
        drag.css('top', position.top + 'px');
        // 🔧 使用位置计算服务计算块中心点
        const blockCenter = positionCalculator.calculateBlockCenter(
          { left: drag.offset().left, top: drag.offset().top },
          { width: drag.innerWidth(), height: drag.innerHeight() },
          { scrollLeft: canvas_div.scrollLeft(), scrollTop: canvas_div.scrollTop() }
        );

        blockstemp.filter(
          a => a.id == parseInt(drag.children('.blockid').val())
        ).x = blockCenter.x;
        blockstemp.filter(
          a => a.id == parseInt(drag.children('.blockid').val())
        ).y = blockCenter.y;
      }

      // 🔧 使用拖拽状态管理器检查是否正在拖拽
      const isDragging = dragStateManager ? dragStateManager.isDragging() : (isActive || isRearranging);

      if (isDragging && drag) {
        // 🔧 使用位置计算服务计算块中心点位置
        const blockCenter = positionCalculator.calculateBlockCenter(
          { left: drag.offset().left, top: drag.offset().top },
          { width: drag.innerWidth(), height: drag.innerHeight() },
          { scrollLeft: canvas_div.scrollLeft(), scrollTop: canvas_div.scrollTop() }
        );
        const xpos = blockCenter.x;
        const ypos = blockCenter.y;

        // 🔧 使用SnapEngine模块进行吸附检测
        if (snapEngine) {
          const snapResult = snapEngine.detectSnapping(xpos, ypos, blocks);

          if (snapResult && snapResult.indicatorPosition) {
            // 显示indicator
            const targetBlockElement = $('.blockid[value=' + snapResult.targetBlockId + ']').parent();
            $('.indicator').appendTo(targetBlockElement);
            $('.indicator').css({
              'left': snapResult.indicatorPosition.left + 'px',
              'top': snapResult.indicatorPosition.top + 'px'
            });
            $('.indicator').removeClass('invisible');
          } else {
            // 隐藏indicator
            if (!$('.indicator').hasClass('invisible')) {
              $('.indicator').addClass('invisible');
            }
          }
        } else {
          // SnapEngine不可用时隐藏indicator
          if (!$('.indicator').hasClass('invisible')) {
            $('.indicator').addClass('invisible');
          }
        }
      }
    });

    function checkOffset() {
      offsetleft = blocks.map(a => a.x);
      const widths = blocks.map(a => a.width);
      const mathmin = offsetleft.map(function (item, index) {
        return item - widths[index] / 2;
      });
      offsetleft = Math.min.apply(Math, mathmin);
      if (offsetleft < canvas_div.offset().left) {
        lastevent = true;
        const blocko = blocks.map(a => a.id);
        for (var w = 0; w < blocks.length; w++) {
          $(
            '.blockid[value=' +
              blocks.filter(a => a.id == blocko[w])[0].id +
              ']'
          )
            .parent()
            .css(
              'left',
              blocks.filter(a => a.id == blocko[w])[0].x -
                blocks.filter(a => a.id == blocko[w])[0].width / 2 -
                offsetleft +
                20
            );
          if (blocks.filter(a => a.id == blocko[w])[0].parent != -1) {
            const arrowhelp = blocks.filter(a => a.id == blocko[w])[0];
            const arrowx =
              arrowhelp.x -
              blocks.filter(
                a => a.id == blocks.filter(a => a.id == blocko[w])[0].parent
              )[0].x;
            if (arrowx < 0) {
              $('.arrowid[value=' + blocko[w] + ']')
                .parent()
                .css('left', arrowhelp.x - offsetleft + 20 - 5 + 'px');
            } else {
              $('.arrowid[value=' + blocko[w] + ']')
                .parent()
                .css(
                  'left',
                  blocks.filter(
                    id =>
                      id.id == blocks.filter(a => a.id == blocko[w])[0].parent
                  )[0].x -
                    20 -
                    offsetleft +
                    20 +
                    'px'
                );
            }
          }
        }
        for (var w = 0; w < blocks.length; w++) {
          // 🔧 修复：添加安全检查，防止访问已删除块的DOM元素
          const blockElement = $('.blockid[value=' + blocks[w].id + ']').parent();
          if (blockElement.length > 0 && blockElement.offset()) {
            blocks[w].x =
              blockElement.offset().left +
              canvas_div.offset().left -
              blockElement.innerWidth() / 2 -
              40;
          }
        }
        offsetleftold = offsetleft;
      }
    }

    function fixOffset() {
      if (offsetleftold < canvas_div.offset().left) {
        lastevent = false;
        const blocko = blocks.map(a => a.id);
        for (var w = 0; w < blocks.length; w++) {
          $(
            '.blockid[value=' +
              blocks.filter(a => a.id == blocko[w])[0].id +
              ']'
          )
            .parent()
            .css(
              'left',
              blocks.filter(a => a.id == blocko[w])[0].x -
                blocks.filter(a => a.id == blocko[w])[0].width / 2 -
                offsetleftold -
                20
            );
          blocks.filter(a => a.id == blocko[w])[0].x =
            $(
              '.blockid[value=' +
                blocks.filter(a => a.id == blocko[w])[0].id +
                ']'
            )
              .parent()
              .offset().left +
            blocks.filter(a => a.id == blocko[w])[0].width / 2;

          if (blocks.filter(a => a.id == blocko[w])[0].parent != -1) {
            const arrowhelp = blocks.filter(a => a.id == blocko[w])[0];
            const arrowx =
              arrowhelp.x -
              blocks.filter(
                a => a.id == blocks.filter(a => a.id == blocko[w])[0].parent
              )[0].x;
            if (arrowx < 0) {
              $('.arrowid[value=' + blocko[w] + ']')
                .parent()
                .css('left', arrowhelp.x - 5 - canvas_div.offset().left + 'px');
            } else {
              $('.arrowid[value=' + blocko[w] + ']')
                .parent()
                .css(
                  'left',
                  blocks.filter(
                    id =>
                      id.id == blocks.filter(a => a.id == blocko[w])[0].parent
                  )[0].x -
                    20 -
                    canvas_div.offset().left +
                    'px'
                );
            }
          }
        }
        for (var w = 0; w < blocks.length; w++) {
          //blocks[w].x = blocks[w].x+offsetleftold-20;
        }
        offsetleftold = 0;
      }
    }

    function rearrangeMe() {
      const result = blocks.map(a => a.parent);
      for (var z = 0; z < result.length; z++) {
        if (result[z] == -1) {
          z++;
        }
        let totalwidth = 0;
        let totalremove = 0;
        const maxheight = 0;

        // 🔧 修复：获取当前父块的所有有效子块
        const currentChildren = blocks.filter(id => id.parent == result[z]);

        for (var w = 0; w < currentChildren.length; w++) {
          var children = currentChildren[w];

          // 🔧 修复：重新计算子块的childwidth，确保移除的子块不被计算
          const grandChildren = blocks.filter(id => id.parent == children.id);
          if (grandChildren.length == 0) {
            children.childwidth = 0;
          } else {
            // 重新计算子块的childwidth
            let childTotalWidth = 0;
            for (let gc = 0; gc < grandChildren.length; gc++) {
              const grandChild = grandChildren[gc];
              if (gc == grandChildren.length - 1) {
                childTotalWidth += grandChild.childwidth > grandChild.width ? grandChild.childwidth : grandChild.width;
              } else {
                childTotalWidth += (grandChild.childwidth > grandChild.width ? grandChild.childwidth : grandChild.width) + paddingx;
              }
            }
            children.childwidth = childTotalWidth;
          }

          if (children.childwidth > children.width) {
            if (w == currentChildren.length - 1) {
              totalwidth += children.childwidth;
            } else {
              totalwidth += children.childwidth + paddingx;
            }
          } else {
            if (w == currentChildren.length - 1) {
              totalwidth += children.width;
            } else {
              totalwidth += children.width + paddingx;
            }
          }
        }

        // 🔧 修复：确保父块的childwidth被正确更新
        if (result[z] != -1) {
          const parentBlock = blocks.filter(a => a.id == result[z])[0];
          if (parentBlock) {
            parentBlock.childwidth = totalwidth;
          }
        }
        for (
          var w = 0;
          w < blocks.filter(id => id.parent == result[z]).length;
          w++
        ) {
          var children = blocks.filter(id => id.parent == result[z])[w];
          if (result[z] != -1) {
            $('.blockid[value=' + children.id + ']')
              .parent()
              .css(
                'top',
                blocks.filter(id => id.id == result[z]).y + paddingy + 'px'
              );
            blocks.filter(id => id.id == result[z]).y =
              blocks.filter(id => id.id == result[z]).y + paddingy;
          }
          if (children.childwidth > children.width) {
            $('.blockid[value=' + children.id + ']')
              .parent()
              .css(
                'left',
                blocks.filter(id => id.id == result[z])[0].x -
                  totalwidth / 2 +
                  totalremove +
                  children.childwidth / 2 -
                  children.width / 2 -
                  canvas_div.offset().left +
                  'px'
              );
            children.x =
              blocks.filter(id => id.id == result[z])[0].x -
              totalwidth / 2 +
              totalremove +
              children.childwidth / 2;
            totalremove += children.childwidth + paddingx;
          } else {
            $('.blockid[value=' + children.id + ']')
              .parent()
              .css(
                'left',
                blocks.filter(id => id.id == result[z])[0].x -
                  totalwidth / 2 +
                  totalremove -
                  canvas_div.offset().left +
                  'px'
              );
            children.x =
              blocks.filter(id => id.id == result[z])[0].x -
              totalwidth / 2 +
              totalremove +
              children.width / 2;
            totalremove += children.width + paddingx;
          }
          const arrowhelp = blocks.filter(a => a.id == children.id)[0];
          const arrowx =
            arrowhelp.x - blocks.filter(a => a.id == children.parent)[0].x + 20;
          const arrowy =
            arrowhelp.y -
            arrowhelp.height / 2 -
            (blocks.filter(a => a.id == children.parent)[0].y +
              blocks.filter(a => a.id == children.parent)[0].height / 2);
          $('.arrowid[value=' + children.id + ']')
            .parent()
            .css(
              'top',
              blocks.filter(id => id.id == children.parent)[0].y +
                blocks.filter(id => id.id == children.parent)[0].height / 2 -
                canvas_div.offset().top +
                'px'
            );
          if (arrowx < 0) {
            $('.arrowid[value=' + children.id + ']')
              .parent()
              .css('left', arrowhelp.x - 5 - canvas_div.offset().left + 'px');
            $('.arrowid[value=' + children.id + ']')
              .parent()
              .html(
                '<input type="hidden" class="arrowid" value="' +
                  children.id +
                  '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' +
                  (blocks.filter(id => id.id == children.parent)[0].x -
                    arrowhelp.x +
                    5) +
                  ' 0L' +
                  (blocks.filter(id => id.id == children.parent)[0].x -
                    arrowhelp.x +
                    5) +
                  ' ' +
                  paddingy / 2 +
                  'L5 ' +
                  paddingy / 2 +
                  'L5 ' +
                  arrowy +
                  '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' +
                  (arrowy - 5) +
                  'H10L5 ' +
                  arrowy +
                  'L0 ' +
                  (arrowy - 5) +
                  'Z" fill="#C5CCD0"/></svg>'
              );
          } else {
            $('.arrowid[value=' + children.id + ']')
              .parent()
              .css(
                'left',
                blocks.filter(id => id.id == children.parent)[0].x -
                  20 -
                  canvas_div.offset().left +
                  'px'
              );
            $('.arrowid[value=' + children.id + ']')
              .parent()
              .html(
                '<input type="hidden" class="arrowid" value="' +
                  children.id +
                  '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0L20 ' +
                  paddingy / 2 +
                  'L' +
                  arrowx +
                  ' ' +
                  paddingy / 2 +
                  'L' +
                  arrowx +
                  ' ' +
                  arrowy +
                  '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' +
                  (arrowx - 5) +
                  ' ' +
                  (arrowy - 5) +
                  'H' +
                  (arrowx + 5) +
                  'L' +
                  arrowx +
                  ' ' +
                  arrowy +
                  'L' +
                  (arrowx - 5) +
                  ' ' +
                  (arrowy - 5) +
                  'Z" fill="#C5CCD0"/></svg>'
              );
          }
        }
      }
    }
  });

  function blockGrabbed(block) {
    grab(block);
  }

  function blockReleased() {
    release();
  }

  function blockSnap(drag) {
    snapping(drag);
  }

  // 添加状态清理函数
  function clearCanvasState() {
    // 清理所有块和连线
    $('.block').remove();
    $('.arrowblock').remove();
    $('.indicator').addClass('invisible');

    // 🔧 使用拖拽状态管理器重置状态
    if (dragStateManager) {
      dragStateManager.reset();
    }

    // 清理块数据
    if (blockManager) {
      blockManager.clearAll();
      syncBlockReferences();
    }
  }

  // 暴露清理函数到全局
  window.clearFlowyCanvas = clearCanvasState;
};

// 模块导出支持
if (typeof module !== 'undefined' && module.exports) {
  module.exports = flowy;
} else if (typeof window !== 'undefined') {
  window.flowy = flowy;
}
