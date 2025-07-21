// 端到端自动化测试配置
const TEST_CONFIG = {
  // 测试目标 - 专注Original Demo
  target: {
    port: 8005,
    path: 'docs/original-demo',
    name: 'Original Demo',
    url: 'http://localhost:8005',
  },

  // 浏览器配置
  browser: {
    headless: false,
    slowMo: 500,
    timeout: 30000,
    viewport: { width: 1280, height: 720 },
  },

  // 预期结果
  expectations: {
    title: 'Flowy - The simple flowchart engine',
    createElementsCount: 4,
    canvasExists: true,
    flowyGlobalExists: true,
    jqueryExists: true,
  },

  // 拖拽测试数据 - 基于吸附机制的精确位置
  dragTests: [
    {
      name: 'New visitor block',
      selector: '.create-flowy:nth-child(1)',
      expectedType: '1',
      target: { x: 200, y: 100 }, // 画布内的有效吸附区域
      expectedSnappedClass: '.blockyleft',
      expectedTitle: 'New visitor',
    },
    {
      name: 'Action performed block',
      selector: '.create-flowy:nth-child(2)',
      expectedType: '2',
      target: { x: 200, y: 250 }, // 与第一个块有适当间距
      expectedSnappedClass: '.blockyleft',
      expectedTitle: 'Action is performed',
    },
    {
      name: 'Time passed block',
      selector: '.create-flowy:nth-child(3)',
      expectedType: '3',
      target: { x: 200, y: 400 }, // 继续向下排列
      expectedSnappedClass: '.blockyleft',
      expectedTitle: 'Time has passed',
    },
    {
      name: 'Error prompt block',
      selector: '.create-flowy:nth-child(4)',
      expectedType: '4',
      target: { x: 200, y: 550 }, // 最后一个块
      expectedSnappedClass: '.blockyleft',
      expectedTitle: 'Error prompt',
    },
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
      right: '.blockyright',
    },
  },

  // 并列节点工作流测试场景
  workflowScenarios: {
    // 场景1: 1父节点 + 2并列子节点
    twoChildren: {
      name: '一父二子工作流',
      description: '测试一个父节点连接两个并列子节点的创建和重排',
      blocks: [
        {
          name: 'Parent Block',
          selector: '.create-flowy:nth-child(1)',
          target: { x: 300, y: 150 },
          expectedParent: -1,
          role: 'parent',
        },
        {
          name: 'Child Block 1',
          selector: '.create-flowy:nth-child(2)',
          target: { x: 200, y: 300 }, // 父节点下方偏左
          expectedParent: 0,
          role: 'child',
        },
        {
          name: 'Child Block 2',
          selector: '.create-flowy:nth-child(3)',
          target: { x: 400, y: 300 }, // 父节点下方偏右
          expectedParent: 0,
          role: 'child',
        },
      ],
      expectedStructure: {
        totalBlocks: 3,
        parentBlocks: 1,
        childBlocks: 2,
        parallelChildren: 2,
      },
    },

    // 场景2: 1父节点 + 3并列子节点
    threeChildren: {
      name: '一父三子工作流',
      description: '测试一个父节点连接三个并列子节点的创建和重排',
      blocks: [
        {
          name: 'Parent Block',
          selector: '.create-flowy:nth-child(1)',
          target: { x: 300, y: 150 },
          expectedParent: -1,
          role: 'parent',
        },
        {
          name: 'Child Block 1',
          selector: '.create-flowy:nth-child(2)',
          target: { x: 150, y: 300 }, // 父节点下方左侧
          expectedParent: 0,
          role: 'child',
        },
        {
          name: 'Child Block 2',
          selector: '.create-flowy:nth-child(3)',
          target: { x: 300, y: 300 }, // 父节点下方中间
          expectedParent: 0,
          role: 'child',
        },
        {
          name: 'Child Block 3',
          selector: '.create-flowy:nth-child(4)',
          target: { x: 450, y: 300 }, // 父节点下方右侧
          expectedParent: 0,
          role: 'child',
        },
      ],
      expectedStructure: {
        totalBlocks: 4,
        parentBlocks: 1,
        childBlocks: 3,
        parallelChildren: 3,
      },
    },
  },
};

export default TEST_CONFIG;
