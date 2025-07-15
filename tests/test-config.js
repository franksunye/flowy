// 端到端自动化测试配置
const TEST_CONFIG = {
    // 测试目标 - 专注Original Demo
    target: {
        port: 8005,
        path: 'docs/original-demo',
        name: 'Original Demo',
        url: 'http://localhost:8005'
    },

    // 浏览器配置
    browser: {
        headless: false,
        slowMo: 500,
        timeout: 30000,
        viewport: { width: 1280, height: 720 }
    },

    // 预期结果
    expectations: {
        title: 'Flowy - The simple flowchart engine',
        createElementsCount: 4,
        canvasExists: true,
        flowyGlobalExists: true,
        jqueryExists: true
    },

    // 拖拽测试数据 - 基于吸附机制的精确位置
    dragTests: [
        {
            name: 'New visitor block',
            selector: '.create-flowy:nth-child(1)',
            expectedType: '1',
            target: { x: 200, y: 100 },  // 画布内的有效吸附区域
            expectedSnappedClass: '.blockyleft',
            expectedTitle: 'New visitor'
        },
        {
            name: 'Action performed block',
            selector: '.create-flowy:nth-child(2)',
            expectedType: '2',
            target: { x: 200, y: 250 },  // 与第一个块有适当间距
            expectedSnappedClass: '.blockyleft',
            expectedTitle: 'Action is performed'
        },
        {
            name: 'Time passed block',
            selector: '.create-flowy:nth-child(3)',
            expectedType: '3',
            target: { x: 200, y: 400 },  // 继续向下排列
            expectedSnappedClass: '.blockyleft',
            expectedTitle: 'Time has passed'
        },
        {
            name: 'Error prompt block',
            selector: '.create-flowy:nth-child(4)',
            expectedType: '4',
            target: { x: 200, y: 550 },  // 最后一个块
            expectedSnappedClass: '.blockyleft',
            expectedTitle: 'Error prompt'
        }
    ],

    // 吸附验证配置
    snapping: {
        // 等待吸附完成的时间
        waitTime: 2000,
        // 验证吸附成功的选择器
        snappedBlockSelector: '.block',
        // 验证块内容的选择器
        blockContentSelectors: {
            title: '.blockyname',
            info: '.blockyinfo',
            left: '.blockyleft',
            right: '.blockyright'
        }
    }
};

module.exports = TEST_CONFIG;
