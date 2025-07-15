// 测试配置文件
const TEST_CONFIG = {
    // 测试服务器配置
    servers: {
        originalDemo: {
            port: 8005,
            path: 'docs/original-demo',
            name: 'Original Demo (基准版本)',
            description: '工作的基准版本，使用min文件'
        },
        srcDemo: {
            port: 8006,
            path: 'docs/src-demo', 
            name: 'Src Demo (源码版本)',
            description: '源码测试版本，使用源文件'
        },
        distDemo: {
            port: 8007,
            path: 'docs/dist-demo',
            name: 'Dist Demo (构建版本)', 
            description: '构建产物测试版本，使用dist文件'
        }
    },

    // 浏览器配置
    browser: {
        headless: false,
        slowMo: 1000,
        timeout: 30000,
        viewport: { width: 1280, height: 720 }
    },

    // 测试用例配置
    testCases: {
        basic: {
            name: '基础功能测试',
            tests: [
                'pageLoad',
                'elementExists', 
                'canvasReady',
                'createElementsCount'
            ]
        },
        interaction: {
            name: '交互功能测试',
            tests: [
                'dragAndDrop',
                'blockCreation',
                'blockConnection',
                'blockDeletion'
            ]
        },
        api: {
            name: 'API功能测试',
            tests: [
                'flowyOutput',
                'flowyImport',
                'flowyDeleteBlocks',
                'flowyGetBlocks'
            ]
        },
        advanced: {
            name: '高级功能测试',
            tests: [
                'multipleBlocks',
                'complexWorkflow',
                'errorHandling',
                'performanceBasic'
            ]
        }
    },

    // 预期结果
    expectations: {
        originalDemo: {
            title: 'Flowy - The simple flowchart engine',
            createElementsCount: 4,
            canvasExists: true,
            flowyGlobalExists: true,
            jqueryExists: true
        }
    },

    // 测试数据
    testData: {
        blockTypes: [
            { type: 1, name: 'Action Block', selector: '[data-type="1"]' },
            { type: 2, name: 'Condition Block', selector: '[data-type="2"]' },
            { type: 3, name: 'Data Block', selector: '[data-type="3"]' },
            { type: 4, name: 'Timer Block', selector: '[data-type="4"]' }
        ],
        dragTargets: [
            { x: 300, y: 200, description: '画布左上区域' },
            { x: 500, y: 300, description: '画布中心区域' },
            { x: 700, y: 400, description: '画布右下区域' }
        ]
    }
};

module.exports = TEST_CONFIG;
