// 导入模块
// 在浏览器环境中，模块会被自动加载到window对象
// 在Node.js测试环境中，通过require加载
// - DomUtils: DOM操作工具
// - BlockManager: 块管理模块

// 检查模块是否可用
function getBlockManager() {
  // 在浏览器环境中，尝试从全局作用域获取
  if (typeof window !== 'undefined' && window.BlockManager) {
    return new window.BlockManager();
  }
  // 在Node.js测试环境中，尝试require
  if (typeof require !== 'undefined') {
    try {
      const BlockManager = require('./core/block-manager.js');
      return new BlockManager();
    } catch (e) {
      // 如果模块不可用，返回null
      return null;
    }
  }
  // 如果都不可用，返回null
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
    // 创建块管理器实例
    const blockManager = getBlockManager();

    // 保持原有变量作为引用，确保向后兼容
    let blocks = blockManager ? blockManager.getAllBlocks() : [];
    let blockstemp = blockManager ? blockManager.getTempBlocks() : [];
    const canvas_div = canvas;

    // 添加同步函数，确保引用始终是最新的
    function syncBlockReferences() {
        if (blockManager) {
            blocks = blockManager.getAllBlocks();
            blockstemp = blockManager.getTempBlocks();
        }
    }

    // 辅助函数：获取块数量（兼容原有代码）
    function getBlockCount() {
      return blockManager ? blockManager.getBlockCount() : blocks.length;
    }

    // 辅助函数：获取下一个块ID
    function getNextBlockId() {
      if (blockManager) {
        return blockManager.getNextBlockId();
      } else {
        return blocks.length === 0
          ? 0
          : Math.max.apply(
              Math,
              blocks.map(a => a.id)
            ) + 1;
      }
    }

    // 辅助函数：清空所有块
    function clearAllBlocks() {
      if (blockManager) {
        blockManager.clearBlocks();
        // 同时清空引用数组以保持同步
        blocks.length = 0;
      } else {
        blocks = [];
      }
    }

    // 辅助函数：添加块
    function addBlock(blockData) {
      if (blockManager) {
        blockManager.addBlock(blockData);
        // 不要重复添加到blocks数组，通过syncBlockReferences同步
      } else {
        blocks.push(blockData);
      }
    }

    // 辅助函数：合并临时块到主数组
    function mergeTempBlocks() {
      if (blockManager) {
        blockManager.mergeTempBlocks();
        // 同时更新引用数组以保持同步
        blocks = blockManager.getAllBlocks();
        blockstemp = blockManager.getTempBlocks();
      } else {
        blocks = $.merge(blocks, blockstemp);
        blockstemp = [];
      }
    }

    // 辅助函数：移除指定ID的块
    function removeBlockById(blockId) {
      if (blockManager) {
        blockManager.removeBlocks(function (block) {
          return block.id != blockId;
        });
        // 同时更新引用数组以保持同步
        blocks = blockManager.getAllBlocks();
      } else {
        blocks = $.grep(blocks, function (e) {
          return e.id != blockId;
        });
      }
    }
    let active = false;
    const paddingx = spacing_x;
    const paddingy = spacing_y;
    let offsetleft = 0;
    let offsetleftold = 0;
    let rearrange = false;
    let lastevent = false;
    let drag, dragx, dragy, original;
    // 添加条件检查，确保 canvas_div 存在且有 append 方法
    if (canvas_div && typeof canvas_div.append === 'function') {
      canvas_div.append("<div class='indicator invisible'></div>");
    }
    flowy.output = function () {
      const json_data = [];
      if (blocks.length > 0) {
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
      }
    };
    flowy.deleteBlocks = function () {
      clearAllBlocks();
      canvas_div.html("<div class='indicator invisible'></div>");
    };
    $(document).on('mousedown', '.create-flowy', function (event) {
      if (event.which === 1) {
        original = $(this);
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
        active = true;
        dragx = event.clientX - $(this).offset().left;
        dragy = event.clientY - $(this).offset().top;
        drag.css('left', event.clientX - dragx + 'px');
        drag.css('top', event.clientY - dragy + 'px');


      }
    });
    $(document).on('mouseup', function (event) {
      if (event.which === 1 && (active || rearrange)) {
        blockReleased();
        if (!$('.indicator').hasClass('invisible')) {
          $('.indicator').addClass('invisible');
        }
        if (active) {
          original.removeClass('dragnow');
          drag.removeClass('dragging');
        }
        if (parseInt(drag.children('.blockid').val()) == 0 && rearrange) {
          drag.removeClass('dragging');
          rearrange = false;
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
          active &&
          blocks.length == 0 &&
          drag.offset().top > canvas_div.offset().top &&
          drag.offset().left > canvas_div.offset().left
        ) {
          blockSnap(drag);
          active = false;
          drag.css(
            'top',
            drag.offset().top -
              canvas_div.offset().top +
              canvas_div.scrollTop() +
              'px'
          );
          drag.css(
            'left',
            drag.offset().left -
              canvas_div.offset().left +
              canvas_div.scrollLeft() +
              'px'
          );
          drag.appendTo(canvas_div);
          addBlock({
            parent: -1,
            childwidth: 0,
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
        } else if (active && blocks.length == 0) {
          drag.remove();
        } else if (active || rearrange) {
          const xpos =
            drag.offset().left +
            drag.innerWidth() / 2 +
            canvas_div.scrollLeft();
          const ypos = drag.offset().top + canvas_div.scrollTop();
          const blocko = blocks.map(a => a.id);

          // 调试信息
          const debugInfo = {
            dragPos: { x: xpos, y: ypos },
            blocks: blocks.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height })),
            dragElement: {
              offsetLeft: drag.offset().left,
              offsetTop: drag.offset().top,
              width: drag.innerWidth(),
              height: drag.innerHeight()
            }
          };

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
              active = false;
              if (!rearrange) {
                blockSnap(drag);
                drag.appendTo(canvas_div);
              }
              let totalwidth = 0;
              let totalremove = 0;
              const maxheight = 0;
              for (
                var w = 0;
                w < blocks.filter(id => id.parent == blocko[i]).length;
                w++
              ) {
                var children = blocks.filter(id => id.parent == blocko[i])[w];
                if (children.childwidth > children.width) {
                  totalwidth += children.childwidth + paddingx;
                } else {
                  totalwidth += children.width + paddingx;
                }
              }
              totalwidth += drag.innerWidth();
              for (
                var w = 0;
                w < blocks.filter(id => id.parent == blocko[i]).length;
                w++
              ) {
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
                  children.x =
                    blocks.filter(id => id.parent == blocko[i])[0].x -
                    totalwidth / 2 +
                    totalremove +
                    children.childwidth / 2;
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
                  children.x =
                    blocks.filter(id => id.parent == blocko[i])[0].x -
                    totalwidth / 2 +
                    totalremove +
                    children.width / 2;
                  totalremove += children.width + paddingx;
                }
              }
              drag.css(
                'left',
                blocks.filter(id => id.id == blocko[i])[0].x -
                  totalwidth / 2 +
                  totalremove -
                  canvas_div.offset().left +
                  canvas_div.scrollLeft() +
                  'px'
              );
              drag.css(
                'top',
                blocks.filter(id => id.id == blocko[i])[0].y +
                  blocks.filter(id => id.id == blocko[i])[0].height / 2 +
                  paddingy -
                  canvas_div.offset().top +
                  'px'
              );
              if (rearrange) {
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
                // 同步引用以确保新添加的块可以被找到
                syncBlockReferences();
              }
              // 确保在连线计算前块数据是最新的
              syncBlockReferences();
              const arrowhelp = blocks.filter(
                a => a.id == parseInt(drag.children('.blockid').val())
              )[0];
              const arrowx =
                arrowhelp.x - blocks.filter(a => a.id == blocko[i])[0].x + 20;
              // 使用父块的位置计算arrowy，与原始版本保持一致
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
              if (rearrange) {
                rearrange = false;
                drag.removeClass('dragging');
              }
              rearrangeMe();
              checkOffset();
              break;
            } else if (i == blocks.length - 1) {
              if (rearrange) {
                rearrange = false;
                blockstemp = [];
              }
              active = false;
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
            if (!active && !rearrange) {
              rearrange = true;
              drag = $(this);
              drag.addClass('dragging');
              dragx = event.clientX - $(this).offset().left;
              dragy = event.clientY - $(this).offset().top;
              const blockid = parseInt($(this).children('.blockid').val());
              drag = $(this);
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
              for (
                var i = 0;
                i < blocks.filter(a => a.parent == blockid).length;
                i++
              ) {
                var blocknumber = blocks.filter(a => a.parent == blockid)[i];
                removeBlockById(blocknumber);
              }
              for (var i = 0; i < allids.length; i++) {
                var blocknumber = allids[i];
                removeBlockById(blocknumber);
              }
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
      if (active) {
        drag.css('left', event.clientX - dragx + 'px');
        drag.css('top', event.clientY - dragy + 'px');
      } else if (rearrange) {
        drag.css(
          'left',
          event.clientX -
            dragx -
            canvas_div.offset().left +
            canvas_div.scrollLeft() +
            'px'
        );
        drag.css(
          'top',
          event.clientY -
            dragy -
            canvas_div.offset().top +
            canvas_div.scrollTop() +
            'px'
        );
        blockstemp.filter(
          a => a.id == parseInt(drag.children('.blockid').val())
        ).x =
          drag.offset().left + drag.innerWidth() / 2 + canvas_div.scrollLeft();
        blockstemp.filter(
          a => a.id == parseInt(drag.children('.blockid').val())
        ).y =
          drag.offset().top + drag.innerHeight() / 2 + canvas_div.scrollTop();
      }
      if (active || rearrange) {
        const xpos =
          drag.offset().left + drag.innerWidth() / 2 + canvas_div.scrollLeft();
        const ypos = drag.offset().top + canvas_div.scrollTop();
        const blocko = blocks.map(a => a.id);
        for (var i = 0; i < blocks.length; i++) {
          if (
            xpos >=
              blocks.filter(a => a.id == blocko[i])[0].x -
                blocks.filter(a => a.id == blocko[i])[0].width / 2 -
                paddingx &&
            xpos <=
              blocks.filter(a => a.id == blocko[i])[0].x +
                blocks.filter(a => a.id == blocko[i])[0].width / 2 +
                paddingx &&
            ypos >=
              blocks.filter(a => a.id == blocko[i])[0].y -
                blocks.filter(a => a.id == blocko[i])[0].height / 2 &&
            ypos <=
              blocks.filter(a => a.id == blocko[i])[0].y +
                blocks.filter(a => a.id == blocko[i])[0].height
          ) {
            $('.indicator').appendTo(
              $('.blockid[value=' + blocko[i] + ']').parent()
            );
            $('.indicator').css(
              'left',
              $('.blockid[value=' + blocko[i] + ']')
                .parent()
                .innerWidth() /
                2 -
                5 +
                'px'
            );
            $('.indicator').css(
              'top',
              $('.blockid[value=' + blocko[i] + ']')
                .parent()
                .innerHeight() + 'px'
            );
            $('.indicator').removeClass('invisible');
            break;
          } else if (i == blocks.length - 1) {
            if (!$('.indicator').hasClass('invisible')) {
              $('.indicator').addClass('invisible');
            }
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
          blocks[w].x =
            $('.blockid[value=' + blocks[w].id + ']')
              .parent()
              .offset().left +
            canvas_div.offset().left -
            $('.blockid[value=' + blocks[w].id + ']')
              .parent()
              .innerWidth() /
              2 -
            40;
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
          z++; // 与原始版本保持完全一致
        }
        let totalwidth = 0;
        let totalremove = 0;
        const maxheight = 0;
        for (
          var w = 0;
          w < blocks.filter(id => id.parent == result[z]).length;
          w++
        ) {
          var children = blocks.filter(id => id.parent == result[z])[w];
          if (blocks.filter(id => id.parent == children.id).length == 0) {
            children.childwidth = 0;
          }
          if (children.childwidth > children.width) {
            if (w == blocks.filter(id => id.parent == result[z]).length - 1) {
              totalwidth += children.childwidth;
            } else {
              totalwidth += children.childwidth + paddingx;
            }
          } else {
            if (w == blocks.filter(id => id.parent == result[z]).length - 1) {
              totalwidth += children.width;
            } else {
              totalwidth += children.width + paddingx;
            }
          }
        }
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
            // 与原始版本完全一致：.y属性不使用[0]索引
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

    // 重置状态变量
    active = false;
    rearrange = false;
    drag = null;
    original = null;

    // 清理块数据
    if (blockManager) {
      blockManager.clearAll();
    } else {
      blocks.length = 0;
      blockstemp.length = 0;
    }

    // 同步引用
    syncBlockReferences();
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
