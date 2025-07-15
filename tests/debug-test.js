/**
 * 调试测试 - 找出canvas_div.append问题的根源
 */

const path = require('path');

// 设置测试环境
require('./unit/setup');

// 加载Flowy源码
const fs = require('fs');
const flowySource = fs.readFileSync(path.join(__dirname, '../src/flowy.js'), 'utf8');

// 在全局作用域中执行Flowy代码
eval(flowySource);

console.log('=== 调试测试开始 ===');

// 创建测试画布
const canvas = createTestCanvas();
console.log('1. Canvas创建:', canvas ? 'OK' : 'FAILED');
console.log('   Canvas类型:', typeof canvas);
console.log('   Canvas nodeType:', canvas.nodeType);

// 创建jQuery对象
const $canvas = $(canvas);
console.log('2. jQuery对象创建:', $canvas ? 'OK' : 'FAILED');
console.log('   jQuery对象类型:', typeof $canvas);
console.log('   jQuery对象长度:', $canvas.length);
console.log('   jQuery对象第一个元素:', $canvas[0]);

// 检查append方法
console.log('3. Append方法检查:');
console.log('   $canvas.append存在:', typeof $canvas.append);
console.log('   $canvas.append是函数:', typeof $canvas.append === 'function');

// 尝试调用append
try {
    console.log('4. 尝试调用append...');
    $canvas.append("<div class='test'>Test</div>");
    console.log('   Append调用成功');
} catch (e) {
    console.log('   Append调用失败:', e.message);
}

// 检查canvas内容
console.log('5. Canvas内容:', canvas.innerHTML);

// 尝试初始化Flowy
console.log('6. 尝试初始化Flowy...');
try {
    flowy($canvas);
    console.log('   Flowy初始化成功');
} catch (e) {
    console.log('   Flowy初始化失败:', e.message);
    console.log('   错误堆栈:', e.stack);
}

// 等待ready回调执行
console.log('6.5. 等待ready回调执行...');
setTimeout(() => {
    console.log('7. 检查flowy.output (延迟后):');
    console.log('   flowy.output存在:', typeof flowy.output);
    console.log('   flowy.output是函数:', typeof flowy.output === 'function');

    if (typeof flowy.output === 'function') {
        try {
            const output = flowy.output();
            console.log('   flowy.output()调用成功:', output);
        } catch (e) {
            console.log('   flowy.output()调用失败:', e.message);
        }
    }

    console.log('=== 调试测试结束 ===');
}, 100);


