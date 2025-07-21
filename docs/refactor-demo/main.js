// 重构演示 - 主要逻辑
// 等待所有模块加载完成后再初始化 Flowy

function initializeFlowyDemo() {
    console.log('🎯 初始化重构演示...');

    var rightcard = false;
    var tempblock;
    var tempblock2;

    // 设置初始的块列表（中文版本）
    $("#blocklist").html('<div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="1"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/eye.svg"></div><div class="blocktext">                        <p class="blocktitle">新访客</p><p class="blockdesc">当有人访问指定页面时触发</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="2"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/action.svg"></div><div class="blocktext">                        <p class="blocktitle">执行动作</p><p class="blockdesc">当有人执行指定动作时触发</p></div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="3"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/time.svg"></div><div class="blocktext">                        <p class="blocktitle">时间已过</p><p class="blockdesc">指定时间过后触发</p>          </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="4"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/error.svg"></div><div class="blocktext">                        <p class="blocktitle">错误提示</p><p class="blockdesc">当指定错误发生时触发</p>              </div></div></div>');

    // 确保 flowy 函数可用
    if (typeof window.flowy === 'function') {
        console.log('✅ Flowy 函数可用，开始初始化...');
        flowy($("#canvas"), drag, release, snapping);
        console.log('🎉 重构演示初始化完成！');
    } else {
        console.error('❌ Flowy 函数不可用');
        return;
    }
    function snapping(drag) {
        console.log('🔗 吸附事件触发:', drag);
        drag.children(".grabme").remove();
        drag.children(".blockin").remove();
        if (drag.children(".blockelemtype").val() == "1") {
            drag.append("<div class='blockyleft'><img src='assets/eyeblue.svg'><p class='blockyname'>新访客</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>当 <span>新访客</span> 访问 <span>站点 1</span> 时</div>");
        } else if (drag.children(".blockelemtype").val() == "2") {
            drag.append("<div class='blockyleft'><img src='assets/actionblue.svg'><p class='blockyname'>执行动作</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>当执行 <span>动作 1</span> 时</div>");
        } else if (drag.children(".blockelemtype").val() == "3") {
            drag.append("<div class='blockyleft'><img src='assets/timeblue.svg'><p class='blockyname'>时间已过</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>当 <span>10 秒</span> 过去后</div>");
        } else if (drag.children(".blockelemtype").val() == "4") {
            drag.append("<div class='blockyleft'><img src='assets/errorblue.svg'><p class='blockyname'>错误提示</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>当触发 <span>错误 1</span> 时</div>");
        } else if (drag.children(".blockelemtype").val() == "5") {
            drag.append("<div class='blockyleft'><img src='assets/databaseorange.svg'><p class='blockyname'>新数据库条目</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>添加 <span>数据对象</span> 到 <span>数据库 1</span></div>");
        } else if (drag.children(".blockelemtype").val() == "6") {
            drag.append("<div class='blockyleft'><img src='assets/databaseorange.svg'><p class='blockyname'>更新数据库</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>更新 <span>数据库 1</span></div>");
        } else if (drag.children(".blockelemtype").val() == "7") {
            drag.append("<div class='blockyleft'><img src='assets/actionorange.svg'><p class='blockyname'>执行动作</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>执行 <span>动作 1</span></div>");
        } else if (drag.children(".blockelemtype").val() == "8") {
            drag.append("<div class='blockyleft'><img src='assets/twitterorange.svg'><p class='blockyname'>发推特</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>用账号 <span>@alyssaxuu</span> 发推 <span>查询 1</span></div>");
        } else if (drag.children(".blockelemtype").val() == "9") {
            drag.append("<div class='blockyleft'><img src='assets/logred.svg'><p class='blockyname'>添加日志条目</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>添加新的 <span>成功</span> 日志条目</div>");
        } else if (drag.children(".blockelemtype").val() == "10") {
            drag.append("<div class='blockyleft'><img src='assets/logred.svg'><p class='blockyname'>更新日志</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>编辑 <span>日志条目 1</span></div>");
        } else if (drag.children(".blockelemtype").val() == "11") {
            drag.append("<div class='blockyleft'><img src='assets/errorred.svg'><p class='blockyname'>提示错误</p></div><div class='blockyright'><img src='assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>触发 <span>错误 1</span></div>");
        }
    }
    function drag(block) {
        console.log('📦 拖拽开始:', block);
        block.addClass("blockdisabled");
        tempblock2 = block;
    }
    function release() {
        console.log('📦 拖拽结束');
        tempblock2.removeClass("blockdisabled");
    }
    $(document).on("click", ".navdisabled", function(){
        console.log('📋 切换导航:', $(this).attr("id"));
        $(".navactive").addClass("navdisabled");
        $(".navactive").removeClass("navactive");
        $(this).addClass("navactive");
        $(this).removeClass("navdisabled");
        if ($(this).attr("id") == "triggers") {
            $("#blocklist").html('<div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="1"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/eye.svg"></div><div class="blocktext">                        <p class="blocktitle">新访客</p><p class="blockdesc">当有人访问指定页面时触发</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="2"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/action.svg"></div><div class="blocktext">                        <p class="blocktitle">执行动作</p><p class="blockdesc">当有人执行指定动作时触发</p></div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="3"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/time.svg"></div><div class="blocktext">                        <p class="blocktitle">时间已过</p><p class="blockdesc">指定时间过后触发</p>          </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="4"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                    <div class="blockico"><span></span><img src="assets/error.svg"></div><div class="blocktext">                        <p class="blocktitle">错误提示</p><p class="blockdesc">当指定错误发生时触发</p>              </div></div></div>');
        } else if ($(this).attr("id") == "actions") {
            $("#blocklist").html('<div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="5"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/database.svg"></div><div class="blocktext">                        <p class="blocktitle">新数据库条目</p><p class="blockdesc">向指定数据库添加新条目</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="6"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/database.svg"></div><div class="blocktext">                        <p class="blocktitle">更新数据库</p><p class="blockdesc">编辑和删除数据库条目和属性</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="7"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/action.svg"></div><div class="blocktext">                        <p class="blocktitle">执行动作</p><p class="blockdesc">执行或编辑指定动作</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="8"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/twitter.svg"></div><div class="blocktext">                        <p class="blocktitle">发推特</p><p class="blockdesc">使用指定查询发推特</p>        </div></div></div>');
        } else if ($(this).attr("id") == "loggers") {
            $("#blocklist").html('<div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="9"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/log.svg"></div><div class="blocktext">                        <p class="blocktitle">添加日志条目</p><p class="blockdesc">向此项目添加新日志条目</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="10"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/log.svg"></div><div class="blocktext">                        <p class="blocktitle">更新日志</p><p class="blockdesc">编辑和删除此项目中的日志条目</p>        </div></div></div><div class="blockelem create-flowy noselect"><input type="hidden" name="blockelemtype" class="blockelemtype" value="11"><div class="grabme"><img src="assets/grabme.svg"></div><div class="blockin">                  <div class="blockico"><span></span><img src="assets/error.svg"></div><div class="blocktext">                        <p class="blocktitle">提示错误</p><p class="blockdesc">触发指定错误</p>        </div></div></div>');
        }
    });
    $("#close").click(function(){
       if (rightcard) {
           rightcard = false;
           $("#properties").removeClass("expanded");
           setTimeout(function(){
                $("#propwrap").removeClass("itson"); 
           }, 300);
            tempblock.removeClass("selectedblock");
       } 
    });
$("#removeblock").on("click", function(){
 flowy.deleteBlocks();
});

$(document).on("mousedown", ".block", function (event) {
  $(document).on("mouseup mousemove", ".block", function handler(event) {
    if (event.type === "mouseup") {
      if (!rightcard) {
            console.log('🎯 选择块:', $(this));
            tempblock = $(this);
           rightcard = true;
           $("#properties").addClass("expanded");
        $("#propwrap").addClass("itson");
            tempblock.addClass("selectedblock");
       }
    }
    $(document).off("mouseup mousemove", handler);
  });
});

} // 结束 initializeFlowyDemo 函数

// 等待模块加载完成后初始化
$(document).ready(function(){
    console.log('📄 DOM 已准备就绪，等待模块加载...');

    // 使用模块加载器的回调来初始化演示
    if (window.FlowyModuleLoader) {
        window.FlowyModuleLoader.onReady(function() {
            console.log('🎉 所有模块已加载，开始初始化演示...');
            initializeFlowyDemo();
        });
    } else {
        console.error('❌ 模块加载器不可用');
    }
});