# 10_ARCHITECTURE.md - Flowy 架构文档

## 🏗️ 系统架构概览

### 当前架构状态 (v1.0.0 - 现代化版本)
- **架构类型**: 模块化JavaScript库 (60%完成)
- **主要文件**: `src/flowy.js` (主入口) + 模块文件
- **依赖**: jQuery (计划移除)
- **构建系统**: Vite (现代化构建)
- **测试覆盖**: 102个单元测试，100%通过率

### 架构演进路径 ✅🔄📋
```
原始状态 → 测试基础 → 模块化 → ES6+ → TypeScript
单体文件   ✅完成     🔄进行中   📋计划   📋计划
```

### 模块化进展
- ✅ **DOM工具模块** (`src/utils/dom-utils.js`) - 已完成
- ✅ **块管理模块** (`src/core/block-manager.js`) - 已完成
- ✅ **吸附引擎模块** (`src/core/snap-engine.js`) - 已完成
- 📋 **拖拽处理模块** (`src/core/drag-handler.js`) - 计划中
- 📋 **API模块** (`src/api/`) - 计划中

## 📁 目录结构

### 当前结构 (模块化进行中)
```
flowy/
├── src/                      # 🎯 源代码目录
│   ├── flowy.js             # 主入口文件
│   ├── flowy.css            # 核心样式
│   ├── core/                # 核心模块
│   │   ├── block-manager.js # ✅ 块管理模块
│   │   └── snap-engine.js   # ✅ 吸附引擎模块
│   └── utils/               # 工具模块
│       └── dom-utils.js     # ✅ DOM工具模块
├── dist/                     # 📦 构建输出 (Vite生成)
│   ├── flowy.es.js          # ES模块格式
│   ├── flowy.umd.js         # UMD格式
│   └── flowy.iife.js        # IIFE格式
├── docs/                     # 📚 文档和演示
│   ├── original-demo/       # 原始演示
│   ├── refactor-demo/       # 重构版演示
│   └── *.md                 # 项目文档
├── tests/                    # 🧪 测试套件
│   ├── unit/                # 单元测试 (102个测试)
│   ├── e2e-test.js          # 端到端测试
│   └── performance/         # 性能测试
└── 配置文件...               # 现代化工具配置
```

### 目标结构 (完全模块化)
```
flowy/
├── src/
│   ├── flowy.js             # 主入口文件
│   ├── core/                # 核心功能模块
│   │   ├── block-manager.js # ✅ 块管理
│   │   ├── snap-engine.js   # ✅ 吸附引擎
│   │   └── drag-handler.js  # 📋 拖拽处理
│   ├── utils/               # 工具模块
│   │   ├── dom-utils.js     # ✅ DOM操作
│   │   ├── math-utils.js    # 📋 数学计算
│   │   └── event-utils.js   # 📋 事件处理
│   └── api/                 # API模块
│       ├── output.js        # 📋 数据输出
│       └── cleanup.js       # 📋 清理功能
├── dist/                    # 多格式构建输出
├── types/                   # TypeScript类型定义
└── ...
```

## 🔧 核心组件

### 已实现模块 ✅
- **DOM工具模块** (`src/utils/dom-utils.js`)
  - 封装所有jQuery操作
  - 提供统一的DOM操作接口
  - 保持向后兼容性
- **块管理模块** (`src/core/block-manager.js`)
  - 管理blocks数组和相关操作
  - 提供块的创建、删除、查找方法
  - 封装块的位置和尺寸计算
- **吸附引擎模块** (`src/core/snap-engine.js`) ⚠️ **未集成**
  - 吸附边界计算和检测逻辑
  - 拖拽位置与目标块的距离判断
  - 吸附条件的实时检测和状态管理
  - Indicator位置计算和可见性管理
  - **状态**: 模块已完成，但尚未集成到主文件

### 计划中模块 📋
- **拖拽处理器** 📋: 处理鼠标/触摸事件
- **事件系统** 📋: 统一的事件处理
- **数学工具** 📋: 位置计算和几何运算

### API层
- **公共API**: `flowy.output()`, `flowy.deleteBlocks()`
- **初始化API**: `flowy()` 函数
- **回调系统**: grab, release, snapping 回调

## 📋 技术栈

### 当前技术栈 (现代化版本)
- **核心**: Vanilla JavaScript (ES5 + 模块化)
- **DOM操作**: jQuery (封装在模块中)
- **构建**: Vite (现代化构建系统)
- **测试**: Jest + JSDOM (102个单元测试)
- **代码质量**: ESLint + Prettier
- **CI/CD**: GitHub Actions

### 目标技术栈 (完全现代化)
- **核心**: Modern JavaScript (ES6+)
- **类型**: TypeScript (渐进式)
- **DOM操作**: 原生JavaScript
- **构建**: Vite (已实现)
- **测试**: Jest + Playwright
- **包管理**: npm/yarn

## 🎯 架构原则

### 设计原则
1. **向后兼容**: 保持API完全兼容
2. **渐进式重构**: 小步快跑，频繁验证
3. **测试驱动**: 每个改动都有测试保障
4. **模块化**: 单一职责，低耦合高内聚
5. **性能优先**: 不降级现有性能

### 质量保证
- **100%测试通过率**: 102个单元测试
- **代码覆盖率**: 持续监控
- **性能基准**: 回归测试
- **代码质量**: 自动化检查

---

**状态**: 积极开发中 (60%完成)
**负责人**: Flowy开发团队
**最后更新**: 2025-07-22
