var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_flowy_es = __commonJS({
  "flowy.es.js"(exports, module) {
    function getBlockManager() {
      if (typeof window !== "undefined" && window.BlockManager) {
        return new window.BlockManager();
      }
      if (typeof require !== "undefined") {
        try {
          const BlockManager = require("./core/block-manager.js");
          return new BlockManager();
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    const flowy = function(canvas, grab, release, snapping, spacing_x, spacing_y) {
      if (!grab) {
        grab = function() {
        };
      }
      if (!release) {
        release = function() {
        };
      }
      if (!snapping) {
        snapping = function() {
        };
      }
      if (!spacing_x) {
        spacing_x = 20;
      }
      if (!spacing_y) {
        spacing_y = 80;
      }
      $(document).ready(function() {
        const blockManager2 = getBlockManager();
        let blocks2 = blockManager2 ? blockManager2.getAllBlocks() : [];
        let blockstemp2 = blockManager2 ? blockManager2.getTempBlocks() : [];
        const canvas_div = canvas;
        function syncBlockReferences2() {
          if (blockManager2) {
            blocks2 = blockManager2.getAllBlocks();
            blockstemp2 = blockManager2.getTempBlocks();
          }
        }
        function getBlockCount() {
          return blockManager2 ? blockManager2.getBlockCount() : blocks2.length;
        }
        function getNextBlockId() {
          if (blockManager2) {
            return blockManager2.getNextBlockId();
          } else {
            return blocks2.length === 0 ? 0 : Math.max.apply(
              Math,
              blocks2.map((a) => a.id)
            ) + 1;
          }
        }
        function clearAllBlocks() {
          if (blockManager2) {
            blockManager2.clearBlocks();
            blocks2.length = 0;
          } else {
            blocks2 = [];
          }
        }
        function addBlock(blockData) {
          if (blockManager2) {
            blockManager2.addBlock(blockData);
          } else {
            blocks2.push(blockData);
          }
        }
        function mergeTempBlocks() {
          if (blockManager2) {
            blockManager2.mergeTempBlocks();
            blocks2 = blockManager2.getAllBlocks();
            blockstemp2 = blockManager2.getTempBlocks();
          } else {
            blocks2 = $.merge(blocks2, blockstemp2);
            blockstemp2 = [];
          }
        }
        function removeBlockById(blockId) {
          if (blockManager2) {
            blockManager2.removeBlocks(function(block) {
              return block.id != blockId;
            });
            blocks2 = blockManager2.getAllBlocks();
          } else {
            blocks2 = $.grep(blocks2, function(e) {
              return e.id != blockId;
            });
          }
        }
        let active2 = false;
        const paddingx = spacing_x;
        const paddingy = spacing_y;
        let offsetleft = 0;
        let offsetleftold = 0;
        let rearrange2 = false;
        let lastevent = false;
        let drag2, dragx, dragy, original2;
        if (canvas_div && typeof canvas_div.append === "function") {
          canvas_div.append("<div class='indicator invisible'></div>");
        }
        flowy.output = function() {
          const json_data = [];
          if (blocks2.length > 0) {
            for (var i = 0; i < blocks2.length; i++) {
              json_data.push({
                id: blocks2[i].id,
                parent: blocks2[i].parent,
                data: []
              });
              $(".blockid[value=" + blocks2[i].id + "]").parent().children("input").each(function() {
                const json_name = $(this).attr("name");
                const json_value = $(this).val();
                json_data[i].data.push({
                  name: json_name,
                  value: json_value
                });
              });
            }
            return json_data;
          }
        };
        flowy.deleteBlocks = function() {
          clearAllBlocks();
          canvas_div.html("<div class='indicator invisible'></div>");
        };
        $(document).on("mousedown", ".create-flowy", function(event) {
          if (event.which === 1) {
            original2 = $(this);
            if (getBlockCount() == 0) {
              var newBlockId = getBlockCount();
              $(this).clone().addClass("block").append(
                "<input type='hidden' name='blockid' class='blockid' value='" + newBlockId + "'>"
              ).removeClass("create-flowy").appendTo("body");
              $(this).addClass("dragnow");
              drag2 = $(".blockid[value=" + newBlockId + "]").parent();
            } else {
              var newBlockId = getNextBlockId();
              $(this).clone().addClass("block").append(
                "<input type='hidden' name='blockid' class='blockid' value='" + newBlockId + "'>"
              ).removeClass("create-flowy").appendTo("body");
              $(this).addClass("dragnow");
              drag2 = $(".blockid[value=" + parseInt(newBlockId) + "]").parent();
            }
            blockGrabbed($(this));
            drag2.addClass("dragging");
            active2 = true;
            dragx = event.clientX - $(this).offset().left;
            dragy = event.clientY - $(this).offset().top;
            drag2.css("left", event.clientX - dragx + "px");
            drag2.css("top", event.clientY - dragy + "px");
          }
        });
        $(document).on("mouseup", function(event) {
          if (event.which === 1 && (active2 || rearrange2)) {
            blockReleased();
            if (!$(".indicator").hasClass("invisible")) {
              $(".indicator").addClass("invisible");
            }
            if (active2) {
              original2.removeClass("dragnow");
              drag2.removeClass("dragging");
            }
            if (parseInt(drag2.children(".blockid").val()) == 0 && rearrange2) {
              drag2.removeClass("dragging");
              rearrange2 = false;
              for (var w = 0; w < blockstemp2.length; w++) {
                if (blockstemp2[w].id != parseInt(drag2.children(".blockid").val())) {
                  $(".blockid[value=" + blockstemp2[w].id + "]").parent().css(
                    "left",
                    $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().left - canvas_div.offset().left + canvas_div.scrollLeft()
                  );
                  $(".blockid[value=" + blockstemp2[w].id + "]").parent().css(
                    "top",
                    $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().top - canvas_div.offset().top + canvas_div.scrollTop()
                  );
                  $(".arrowid[value=" + blockstemp2[w].id + "]").parent().css(
                    "left",
                    $(".arrowid[value=" + blockstemp2[w].id + "]").parent().offset().left - canvas_div.offset().left + canvas_div.scrollLeft()
                  );
                  $(".arrowid[value=" + blockstemp2[w].id + "]").parent().css(
                    "top",
                    $(".arrowid[value=" + blockstemp2[w].id + "]").parent().offset().top - canvas_div.offset().top + canvas_div.scrollTop() + "px"
                  );
                  $(".blockid[value=" + blockstemp2[w].id + "]").parent().appendTo(canvas_div);
                  $(".arrowid[value=" + blockstemp2[w].id + "]").parent().appendTo(canvas_div);
                  blockstemp2[w].x = $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().left + $(".blockid[value=" + blockstemp2[w].id + "]").innerWidth() / 2 + canvas_div.scrollLeft();
                  blockstemp2[w].y = $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().top + $(".blockid[value=" + blockstemp2[w].id + "]").parent().innerHeight() / 2 + canvas_div.scrollTop();
                }
              }
              blockstemp2.filter((a) => a.id == 0)[0].x = drag2.offset().left + drag2.innerWidth() / 2;
              blockstemp2.filter((a) => a.id == 0)[0].y = drag2.offset().top + drag2.innerHeight() / 2;
              mergeTempBlocks();
            } else if (active2 && blocks2.length == 0 && drag2.offset().top > canvas_div.offset().top && drag2.offset().left > canvas_div.offset().left) {
              blockSnap(drag2);
              active2 = false;
              drag2.css(
                "top",
                drag2.offset().top - canvas_div.offset().top + canvas_div.scrollTop() + "px"
              );
              drag2.css(
                "left",
                drag2.offset().left - canvas_div.offset().left + canvas_div.scrollLeft() + "px"
              );
              drag2.appendTo(canvas_div);
              addBlock({
                parent: -1,
                childwidth: 0,
                id: parseInt(drag2.children(".blockid").val()),
                x: drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft(),
                y: drag2.offset().top + drag2.innerHeight() / 2 + canvas_div.scrollTop(),
                width: drag2.innerWidth(),
                height: drag2.innerHeight()
              });
            } else if (active2 && blocks2.length == 0) {
              drag2.remove();
            } else if (active2 || rearrange2) {
              const xpos = drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft();
              const ypos = drag2.offset().top + canvas_div.scrollTop();
              const blocko = blocks2.map((a) => a.id);
              ({
                blocks: blocks2.map((b) => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height })),
                dragElement: {
                  offsetLeft: drag2.offset().left,
                  offsetTop: drag2.offset().top,
                  width: drag2.innerWidth(),
                  height: drag2.innerHeight()
                }
              });
              for (var i = 0; i < blocks2.length; i++) {
                const targetBlock = blocks2.filter((a) => a.id == blocko[i])[0];
                const xMin = targetBlock.x - targetBlock.width / 2 - paddingx;
                const xMax = targetBlock.x + targetBlock.width / 2 + paddingx;
                const yMin = targetBlock.y - targetBlock.height / 2;
                const yMax = targetBlock.y + targetBlock.height;
                const xInRange = xpos >= xMin && xpos <= xMax;
                const yInRange = ypos >= yMin && ypos <= yMax;
                ({
                  blockId: blocko[i],
                  targetBlock: { x: targetBlock.x, y: targetBlock.y, width: targetBlock.width, height: targetBlock.height }
                });
                if (xInRange && yInRange) {
                  active2 = false;
                  if (!rearrange2) {
                    blockSnap(drag2);
                    drag2.appendTo(canvas_div);
                  }
                  let totalwidth = 0;
                  let totalremove = 0;
                  for (var w = 0; w < blocks2.filter((id) => id.parent == blocko[i]).length; w++) {
                    var children = blocks2.filter((id) => id.parent == blocko[i])[w];
                    if (children.childwidth > children.width) {
                      totalwidth += children.childwidth + paddingx;
                    } else {
                      totalwidth += children.width + paddingx;
                    }
                  }
                  totalwidth += drag2.innerWidth();
                  for (var w = 0; w < blocks2.filter((id) => id.parent == blocko[i]).length; w++) {
                    var children = blocks2.filter((id) => id.parent == blocko[i])[w];
                    if (children.childwidth > children.width) {
                      $(".blockid[value=" + children.id + "]").parent().css(
                        "left",
                        blocks2.filter((a) => a.id == blocko[i])[0].x - totalwidth / 2 + totalremove + children.childwidth / 2 - children.width / 2 + "px"
                      );
                      children.x = blocks2.filter((id) => id.parent == blocko[i])[0].x - totalwidth / 2 + totalremove + children.childwidth / 2;
                      totalremove += children.childwidth + paddingx;
                    } else {
                      $(".blockid[value=" + children.id + "]").parent().css(
                        "left",
                        blocks2.filter((a) => a.id == blocko[i])[0].x - totalwidth / 2 + totalremove + "px"
                      );
                      children.x = blocks2.filter((id) => id.parent == blocko[i])[0].x - totalwidth / 2 + totalremove + children.width / 2;
                      totalremove += children.width + paddingx;
                    }
                  }
                  drag2.css(
                    "left",
                    blocks2.filter((id) => id.id == blocko[i])[0].x - totalwidth / 2 + totalremove - canvas_div.offset().left + canvas_div.scrollLeft() + "px"
                  );
                  drag2.css(
                    "top",
                    blocks2.filter((id) => id.id == blocko[i])[0].y + blocks2.filter((id) => id.id == blocko[i])[0].height / 2 + paddingy - canvas_div.offset().top + "px"
                  );
                  if (rearrange2) {
                    blockstemp2.filter(
                      (a) => a.id == parseInt(drag2.children(".blockid").val())
                    )[0].x = drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft();
                    blockstemp2.filter(
                      (a) => a.id == parseInt(drag2.children(".blockid").val())
                    )[0].y = drag2.offset().top + drag2.innerHeight() / 2 + canvas_div.scrollTop();
                    blockstemp2.filter(
                      (a) => a.id == drag2.children(".blockid").val()
                    )[0].parent = blocko[i];
                    for (var w = 0; w < blockstemp2.length; w++) {
                      if (blockstemp2[w].id != parseInt(drag2.children(".blockid").val())) {
                        $(".blockid[value=" + blockstemp2[w].id + "]").parent().css(
                          "left",
                          $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().left - canvas_div.offset().left + canvas_div.scrollLeft()
                        );
                        $(".blockid[value=" + blockstemp2[w].id + "]").parent().css(
                          "top",
                          $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().top - canvas_div.offset().top + canvas_div.scrollTop()
                        );
                        $(".arrowid[value=" + blockstemp2[w].id + "]").parent().css(
                          "left",
                          $(".arrowid[value=" + blockstemp2[w].id + "]").parent().offset().left - canvas_div.offset().left + canvas_div.scrollLeft() + 20
                        );
                        $(".arrowid[value=" + blockstemp2[w].id + "]").parent().css(
                          "top",
                          $(".arrowid[value=" + blockstemp2[w].id + "]").parent().offset().top - canvas_div.offset().top + canvas_div.scrollTop()
                        );
                        $(".blockid[value=" + blockstemp2[w].id + "]").parent().appendTo(canvas_div);
                        $(".arrowid[value=" + blockstemp2[w].id + "]").parent().appendTo(canvas_div);
                        blockstemp2[w].x = $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().left + $(
                          ".blockid[value=" + blockstemp2[w].id + "]"
                        ).innerWidth() / 2 + canvas_div.scrollLeft();
                        blockstemp2[w].y = $(".blockid[value=" + blockstemp2[w].id + "]").parent().offset().top + $(".blockid[value=" + blockstemp2[w].id + "]").parent().innerHeight() / 2 + canvas_div.scrollTop();
                      }
                    }
                    mergeTempBlocks();
                  } else {
                    addBlock({
                      childwidth: 0,
                      parent: blocko[i],
                      id: parseInt(drag2.children(".blockid").val()),
                      x: drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft(),
                      y: drag2.offset().top + drag2.innerHeight() / 2 + canvas_div.scrollTop(),
                      width: drag2.innerWidth(),
                      height: drag2.innerHeight()
                    });
                    syncBlockReferences2();
                  }
                  syncBlockReferences2();
                  const arrowhelp = blocks2.filter(
                    (a) => a.id == parseInt(drag2.children(".blockid").val())
                  )[0];
                  const arrowx = arrowhelp.x - blocks2.filter((a) => a.id == blocko[i])[0].x + 20;
                  const parentBlock = blocks2.filter((a) => a.id == blocko[i])[0];
                  const arrowy = arrowhelp.y - arrowhelp.height / 2 - (parentBlock.y + parentBlock.height / 2) + canvas_div.scrollTop();
                  if (arrowx < 0) {
                    drag2.after(
                      '<div class="arrowblock"><input type="hidden" class="arrowid" value="' + drag2.children(".blockid").val() + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' + (blocks2.filter((a) => a.id == blocko[i])[0].x - arrowhelp.x + 5) + " 0L" + (blocks2.filter((a) => a.id == blocko[i])[0].x - arrowhelp.x + 5) + " " + paddingy / 2 + "L5 " + paddingy / 2 + "L5 " + arrowy + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' + (arrowy - 5) + "H10L5 " + arrowy + "L0 " + (arrowy - 5) + 'Z" fill="#C5CCD0"/></svg></div>'
                    );
                    $(".arrowid[value=" + drag2.children(".blockid").val() + "]").parent().css(
                      "left",
                      arrowhelp.x - 5 - canvas_div.offset().left + canvas_div.scrollLeft() + "px"
                    );
                    $(".arrowid[value=" + drag2.children(".blockid").val() + "]").parent().css(
                      "top",
                      blocks2.filter((a) => a.id == blocko[i])[0].y + blocks2.filter((a) => a.id == blocko[i])[0].height / 2 - canvas_div.offset().top + canvas_div.scrollTop() + "px"
                    );
                  } else {
                    const svgPath = `M20 0L20 ${paddingy / 2}L${arrowx} ${paddingy / 2}L${arrowx} ${arrowy}`;
                    drag2.after(
                      '<div class="arrowblock"><input type="hidden" class="arrowid" value="' + drag2.children(".blockid").val() + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="' + svgPath + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' + (arrowx - 5) + " " + (arrowy - 5) + "H" + (arrowx + 5) + "L" + arrowx + " " + arrowy + "L" + (arrowx - 5) + " " + (arrowy - 5) + 'Z" fill="#C5CCD0"/></svg></div>'
                    );
                    $(
                      ".arrowid[value=" + parseInt(drag2.children(".blockid").val()) + "]"
                    ).parent().css(
                      "left",
                      blocks2.filter((a) => a.id == blocko[i])[0].x - 20 - canvas_div.offset().left + canvas_div.scrollLeft() + "px"
                    );
                  }
                  $(
                    ".arrowid[value=" + parseInt(drag2.children(".blockid").val()) + "]"
                  ).parent().css(
                    "top",
                    blocks2.filter((a) => a.id == blocko[i])[0].y + blocks2.filter((a) => a.id == blocko[i])[0].height / 2 - canvas_div.offset().top + canvas_div.scrollTop() + "px"
                  );
                  if (blocks2.filter((a) => a.id == blocko[i])[0].parent != -1) {
                    let flag = false;
                    var idval = blocko[i];
                    while (!flag) {
                      if (blocks2.filter((a) => a.id == idval)[0].parent == -1) {
                        flag = true;
                      } else {
                        let zwidth = 0;
                        for (var w = 0; w < blocks2.filter((id) => id.parent == idval).length; w++) {
                          var children = blocks2.filter((id) => id.parent == idval)[w];
                          if (children.childwidth > children.width) {
                            if (w == blocks2.filter((id) => id.parent == idval).length - 1) {
                              zwidth += children.childwidth;
                            } else {
                              zwidth += children.childwidth + paddingx;
                            }
                          } else {
                            if (w == blocks2.filter((id) => id.parent == idval).length - 1) {
                              zwidth += children.width;
                            } else {
                              zwidth += children.width + paddingx;
                            }
                          }
                        }
                        blocks2.filter((a) => a.id == idval)[0].childwidth = zwidth;
                        idval = blocks2.filter((a) => a.id == idval)[0].parent;
                      }
                    }
                    blocks2.filter((id) => id.id == idval)[0].childwidth = totalwidth;
                  }
                  if (rearrange2) {
                    rearrange2 = false;
                    drag2.removeClass("dragging");
                  }
                  rearrangeMe();
                  checkOffset();
                  break;
                } else if (i == blocks2.length - 1) {
                  if (rearrange2) {
                    rearrange2 = false;
                    blockstemp2 = [];
                  }
                  active2 = false;
                  drag2.remove();
                }
              }
            }
          }
        });
        $(document).on("mousedown", ".block", function(event) {
          $(document).on("mouseup mousemove", ".block", function handler(event2) {
            if (event2.type !== "mouseup") {
              if (event2.which === 1) {
                if (!active2 && !rearrange2) {
                  rearrange2 = true;
                  drag2 = $(this);
                  drag2.addClass("dragging");
                  dragx = event2.clientX - $(this).offset().left;
                  dragy = event2.clientY - $(this).offset().top;
                  const blockid = parseInt($(this).children(".blockid").val());
                  drag2 = $(this);
                  blockstemp2.push(blocks2.filter((a) => a.id == blockid)[0]);
                  blocks2 = $.grep(blocks2, function(e) {
                    return e.id != blockid;
                  });
                  $(".arrowid[value=" + blockid + "]").parent().remove();
                  let layer = blocks2.filter((a) => a.parent == blockid);
                  let flag = false;
                  let foundids = [];
                  const allids = [];
                  while (!flag) {
                    for (var i = 0; i < layer.length; i++) {
                      blockstemp2.push(blocks2.filter((a) => a.id == layer[i].id)[0]);
                      $(".blockid[value=" + layer[i].id + "]").parent().css(
                        "left",
                        $(".blockid[value=" + layer[i].id + "]").parent().offset().left - drag2.offset().left
                      );
                      $(".blockid[value=" + layer[i].id + "]").parent().css(
                        "top",
                        $(".blockid[value=" + layer[i].id + "]").parent().offset().top - drag2.offset().top
                      );
                      $(".arrowid[value=" + layer[i].id + "]").parent().css(
                        "left",
                        $(".arrowid[value=" + layer[i].id + "]").parent().offset().left - drag2.offset().left
                      );
                      $(".arrowid[value=" + layer[i].id + "]").parent().css(
                        "top",
                        $(".arrowid[value=" + layer[i].id + "]").parent().offset().top - drag2.offset().top
                      );
                      $(".blockid[value=" + layer[i].id + "]").parent().appendTo(drag2);
                      $(".arrowid[value=" + layer[i].id + "]").parent().appendTo(drag2);
                      foundids.push(layer[i].id);
                      allids.push(layer[i].id);
                    }
                    if (foundids.length == 0) {
                      flag = true;
                    } else {
                      layer = blocks2.filter((a) => foundids.includes(a.parent));
                      foundids = [];
                    }
                  }
                  for (var i = 0; i < blocks2.filter((a) => a.parent == blockid).length; i++) {
                    var blocknumber = blocks2.filter((a) => a.parent == blockid)[i];
                    removeBlockById(blocknumber);
                  }
                  for (var i = 0; i < allids.length; i++) {
                    var blocknumber = allids[i];
                    removeBlockById(blocknumber);
                  }
                  if (blocks2.length > 1) {
                    rearrangeMe();
                  }
                  if (lastevent) {
                    fixOffset();
                  }
                }
              }
            }
            $(document).off("mouseup mousemove", handler);
          });
        });
        $(document).on("mousemove", function(event) {
          if (active2) {
            drag2.css("left", event.clientX - dragx + "px");
            drag2.css("top", event.clientY - dragy + "px");
          } else if (rearrange2) {
            drag2.css(
              "left",
              event.clientX - dragx - canvas_div.offset().left + canvas_div.scrollLeft() + "px"
            );
            drag2.css(
              "top",
              event.clientY - dragy - canvas_div.offset().top + canvas_div.scrollTop() + "px"
            );
            blockstemp2.filter(
              (a) => a.id == parseInt(drag2.children(".blockid").val())
            ).x = drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft();
            blockstemp2.filter(
              (a) => a.id == parseInt(drag2.children(".blockid").val())
            ).y = drag2.offset().top + drag2.innerHeight() / 2 + canvas_div.scrollTop();
          }
          if (active2 || rearrange2) {
            const xpos = drag2.offset().left + drag2.innerWidth() / 2 + canvas_div.scrollLeft();
            const ypos = drag2.offset().top + canvas_div.scrollTop();
            const blocko = blocks2.map((a) => a.id);
            for (var i = 0; i < blocks2.length; i++) {
              if (xpos >= blocks2.filter((a) => a.id == blocko[i])[0].x - blocks2.filter((a) => a.id == blocko[i])[0].width / 2 - paddingx && xpos <= blocks2.filter((a) => a.id == blocko[i])[0].x + blocks2.filter((a) => a.id == blocko[i])[0].width / 2 + paddingx && ypos >= blocks2.filter((a) => a.id == blocko[i])[0].y - blocks2.filter((a) => a.id == blocko[i])[0].height / 2 && ypos <= blocks2.filter((a) => a.id == blocko[i])[0].y + blocks2.filter((a) => a.id == blocko[i])[0].height) {
                $(".indicator").appendTo(
                  $(".blockid[value=" + blocko[i] + "]").parent()
                );
                $(".indicator").css(
                  "left",
                  $(".blockid[value=" + blocko[i] + "]").parent().innerWidth() / 2 - 5 + "px"
                );
                $(".indicator").css(
                  "top",
                  $(".blockid[value=" + blocko[i] + "]").parent().innerHeight() + "px"
                );
                $(".indicator").removeClass("invisible");
                break;
              } else if (i == blocks2.length - 1) {
                if (!$(".indicator").hasClass("invisible")) {
                  $(".indicator").addClass("invisible");
                }
              }
            }
          }
        });
        function checkOffset() {
          offsetleft = blocks2.map((a) => a.x);
          const widths = blocks2.map((a) => a.width);
          const mathmin = offsetleft.map(function(item, index) {
            return item - widths[index] / 2;
          });
          offsetleft = Math.min.apply(Math, mathmin);
          if (offsetleft < canvas_div.offset().left) {
            lastevent = true;
            const blocko = blocks2.map((a) => a.id);
            for (var w = 0; w < blocks2.length; w++) {
              $(
                ".blockid[value=" + blocks2.filter((a) => a.id == blocko[w])[0].id + "]"
              ).parent().css(
                "left",
                blocks2.filter((a) => a.id == blocko[w])[0].x - blocks2.filter((a) => a.id == blocko[w])[0].width / 2 - offsetleft + 20
              );
              if (blocks2.filter((a) => a.id == blocko[w])[0].parent != -1) {
                const arrowhelp = blocks2.filter((a) => a.id == blocko[w])[0];
                const arrowx = arrowhelp.x - blocks2.filter(
                  (a) => a.id == blocks2.filter((a2) => a2.id == blocko[w])[0].parent
                )[0].x;
                if (arrowx < 0) {
                  $(".arrowid[value=" + blocko[w] + "]").parent().css("left", arrowhelp.x - offsetleft + 20 - 5 + "px");
                } else {
                  $(".arrowid[value=" + blocko[w] + "]").parent().css(
                    "left",
                    blocks2.filter(
                      (id) => id.id == blocks2.filter((a) => a.id == blocko[w])[0].parent
                    )[0].x - 20 - offsetleft + 20 + "px"
                  );
                }
              }
            }
            for (var w = 0; w < blocks2.length; w++) {
              blocks2[w].x = $(".blockid[value=" + blocks2[w].id + "]").parent().offset().left + canvas_div.offset().left - $(".blockid[value=" + blocks2[w].id + "]").parent().innerWidth() / 2 - 40;
            }
            offsetleftold = offsetleft;
          }
        }
        function fixOffset() {
          if (offsetleftold < canvas_div.offset().left) {
            lastevent = false;
            const blocko = blocks2.map((a) => a.id);
            for (var w = 0; w < blocks2.length; w++) {
              $(
                ".blockid[value=" + blocks2.filter((a) => a.id == blocko[w])[0].id + "]"
              ).parent().css(
                "left",
                blocks2.filter((a) => a.id == blocko[w])[0].x - blocks2.filter((a) => a.id == blocko[w])[0].width / 2 - offsetleftold - 20
              );
              blocks2.filter((a) => a.id == blocko[w])[0].x = $(
                ".blockid[value=" + blocks2.filter((a) => a.id == blocko[w])[0].id + "]"
              ).parent().offset().left + blocks2.filter((a) => a.id == blocko[w])[0].width / 2;
              if (blocks2.filter((a) => a.id == blocko[w])[0].parent != -1) {
                const arrowhelp = blocks2.filter((a) => a.id == blocko[w])[0];
                const arrowx = arrowhelp.x - blocks2.filter(
                  (a) => a.id == blocks2.filter((a2) => a2.id == blocko[w])[0].parent
                )[0].x;
                if (arrowx < 0) {
                  $(".arrowid[value=" + blocko[w] + "]").parent().css("left", arrowhelp.x - 5 - canvas_div.offset().left + "px");
                } else {
                  $(".arrowid[value=" + blocko[w] + "]").parent().css(
                    "left",
                    blocks2.filter(
                      (id) => id.id == blocks2.filter((a) => a.id == blocko[w])[0].parent
                    )[0].x - 20 - canvas_div.offset().left + "px"
                  );
                }
              }
            }
            for (var w = 0; w < blocks2.length; w++) {
            }
            offsetleftold = 0;
          }
        }
        function rearrangeMe() {
          const result = blocks2.map((a) => a.parent);
          for (var z = 0; z < result.length; z++) {
            if (result[z] == -1) {
              continue;
            }
            let totalwidth = 0;
            let totalremove = 0;
            for (var w = 0; w < blocks2.filter((id) => id.parent == result[z]).length; w++) {
              var children = blocks2.filter((id) => id.parent == result[z])[w];
              if (blocks2.filter((id) => id.parent == children.id).length == 0) {
                children.childwidth = 0;
              }
              if (children.childwidth > children.width) {
                if (w == blocks2.filter((id) => id.parent == result[z]).length - 1) {
                  totalwidth += children.childwidth;
                } else {
                  totalwidth += children.childwidth + paddingx;
                }
              } else {
                if (w == blocks2.filter((id) => id.parent == result[z]).length - 1) {
                  totalwidth += children.width;
                } else {
                  totalwidth += children.width + paddingx;
                }
              }
            }
            if (result[z] != -1) {
              const parentBlock = blocks2.filter((a) => a.id == result[z])[0];
              if (parentBlock) {
                parentBlock.childwidth = totalwidth;
              }
            }
            for (var w = 0; w < blocks2.filter((id) => id.parent == result[z]).length; w++) {
              var children = blocks2.filter((id) => id.parent == result[z])[w];
              if (result[z] != -1) {
                const parentBlock2 = blocks2.filter((id) => id.id == result[z])[0];
                if (parentBlock2) {
                  if (parentBlock2.originalY === void 0) {
                    parentBlock2.originalY = parentBlock2.y;
                  }
                  $(".blockid[value=" + children.id + "]").parent().css(
                    "top",
                    parentBlock2.y + paddingy + "px"
                  );
                  parentBlock2.y = parentBlock2.y + paddingy;
                }
              }
              if (children.childwidth > children.width) {
                $(".blockid[value=" + children.id + "]").parent().css(
                  "left",
                  blocks2.filter((id) => id.id == result[z])[0].x - totalwidth / 2 + totalremove + children.childwidth / 2 - children.width / 2 - canvas_div.offset().left + "px"
                );
                children.x = blocks2.filter((id) => id.id == result[z])[0].x - totalwidth / 2 + totalremove + children.childwidth / 2;
                totalremove += children.childwidth + paddingx;
              } else {
                $(".blockid[value=" + children.id + "]").parent().css(
                  "left",
                  blocks2.filter((id) => id.id == result[z])[0].x - totalwidth / 2 + totalremove - canvas_div.offset().left + "px"
                );
                children.x = blocks2.filter((id) => id.id == result[z])[0].x - totalwidth / 2 + totalremove + children.width / 2;
                totalremove += children.width + paddingx;
              }
              const arrowhelp = blocks2.filter((a) => a.id == children.id)[0];
              const arrowx = arrowhelp.x - blocks2.filter((a) => a.id == children.parent)[0].x + 20;
              const parentBlock = blocks2.filter((a) => a.id == children.parent)[0];
              const parentY = parentBlock.originalY !== void 0 ? parentBlock.originalY : parentBlock.y;
              const arrowy = arrowhelp.y - arrowhelp.height / 2 - (parentY + parentBlock.height / 2);
              $(".arrowid[value=" + children.id + "]").parent().css(
                "top",
                parentY + parentBlock.height / 2 - canvas_div.offset().top + "px"
              );
              if (arrowx < 0) {
                $(".arrowid[value=" + children.id + "]").parent().css("left", arrowhelp.x - 5 - canvas_div.offset().left + "px");
                $(".arrowid[value=" + children.id + "]").parent().html(
                  '<input type="hidden" class="arrowid" value="' + children.id + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' + (blocks2.filter((id) => id.id == children.parent)[0].x - arrowhelp.x + 5) + " 0L" + (blocks2.filter((id) => id.id == children.parent)[0].x - arrowhelp.x + 5) + " " + paddingy / 2 + "L5 " + paddingy / 2 + "L5 " + arrowy + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' + (arrowy - 5) + "H10L5 " + arrowy + "L0 " + (arrowy - 5) + 'Z" fill="#C5CCD0"/></svg>'
                );
              } else {
                $(".arrowid[value=" + children.id + "]").parent().css(
                  "left",
                  blocks2.filter((id) => id.id == children.parent)[0].x - 20 - canvas_div.offset().left + "px"
                );
                $(".arrowid[value=" + children.id + "]").parent().html(
                  '<input type="hidden" class="arrowid" value="' + children.id + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0L20 ' + paddingy / 2 + "L" + arrowx + " " + paddingy / 2 + "L" + arrowx + " " + arrowy + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' + (arrowx - 5) + " " + (arrowy - 5) + "H" + (arrowx + 5) + "L" + arrowx + " " + arrowy + "L" + (arrowx - 5) + " " + (arrowy - 5) + 'Z" fill="#C5CCD0"/></svg>'
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
      function blockSnap(drag2) {
        snapping(drag2);
      }
      function clearCanvasState() {
        $(".block").remove();
        $(".arrowblock").remove();
        $(".indicator").addClass("invisible");
        active = false;
        rearrange = false;
        drag = null;
        original = null;
        if (blockManager) {
          blockManager.clearAll();
        } else {
          blocks.length = 0;
          blockstemp.length = 0;
        }
        syncBlockReferences();
      }
      window.clearFlowyCanvas = clearCanvasState;
    };
    if (typeof module !== "undefined" && module.exports) {
      module.exports = flowy;
    } else if (typeof window !== "undefined") {
      window.flowy = flowy;
    }
  }
});
export default require_flowy_es();
//# sourceMappingURL=flowy.es.js.map
