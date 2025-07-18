# 10_ARCHITECTURE.md - Flowy 架构文档

## 🏗️ 系统架构概览

*此文档将在后续开发中逐步完善*

### 当前架构状态
- **架构类型**: 单体JavaScript库
- **主要文件**: `src/flowy.js` (单一文件)
- **依赖**: jQuery
- **模块化**: 待实现

### 计划架构演进
```
当前状态 → 模块化 → ES6+ → TypeScript
单体文件   多模块     现代语法   类型安全
```

## 📁 目录结构

### 当前结构
```
flowy/
├── src/
│   └── flowy.js              # 主要源码文件
├── dist/
│   └── flowy.js              # 构建输出
├── docs/
│   └── original-demo/        # 原始演示
├── tests/
│   ├── unit/                 # 单元测试
│   └── e2e/                  # 端到端测试
└── 配置文件...
```

### 计划结构 (模块化后)
```
flowy/
├── src/
│   ├── core/
│   │   ├── flowy.js         # 主入口
│   │   ├── drag-handler.js  # 拖拽处理
│   │   ├── snap-engine.js   # 吸附引擎
│   │   └── block-manager.js # 块管理
│   ├── utils/
│   │   ├── dom-utils.js     # DOM操作
│   │   ├── math-utils.js    # 数学计算
│   │   └── event-utils.js   # 事件处理
│   └── api/
│       ├── output.js        # 数据输出
│       └── cleanup.js       # 清理功能
├── dist/                    # 构建输出
├── types/                   # TypeScript类型定义
└── ...
```

## 🔧 核心组件

### 主要模块 (计划中)
- **拖拽处理器**: 处理鼠标/触摸事件
- **吸附引擎**: 计算吸附位置和逻辑
- **块管理器**: 管理工作流块的生命周期
- **DOM工具**: 封装DOM操作
- **事件系统**: 统一的事件处理

### API层
- **公共API**: `flowy.output()`, `flowy.deleteBlocks()`
- **初始化API**: `flowy()` 函数
- **回调系统**: grab, release, snapping 回调

## 📋 技术栈

### 当前技术栈
- **核心**: Vanilla JavaScript (ES5)
- **DOM操作**: jQuery
- **构建**: 无 (直接使用源码)
- **测试**: Jest + JSDOM

### 目标技术栈
- **核心**: Modern JavaScript (ES6+)
- **类型**: TypeScript
- **DOM操作**: 原生JavaScript
- **构建**: Vite/Webpack
- **测试**: Jest + Playwright

---

**状态**: 规划中  
**负责人**: 架构团队  
**最后更新**: 2025-07-18
