# 📚 Flowy学习笔记

## 📖 学习日志

### 2025-08-04 - Sprint 1 Day 1

#### 🎯 今日目标
- [x] 项目结构重组和优化
- [/] 开始研读项目文档 (US-001)
- [ ] 准备运行演示环境

#### 📝 学习要点

##### 项目基本信息
- **项目名称**: Flowy - JavaScript流程图库
- **作者**: Alyssa X
- **特点**: 轻量级、无依赖、响应式拖拽
- **核心文件**: 
  - `src/flowy.js` (478行) - 主要逻辑
  - `src/flowy.css` - 样式文件

##### 核心功能特性
- ✅ 响应式拖拽 (Responsive drag and drop)
- ✅ 自动对齐 (Automatic snapping)  
- ✅ 自动滚动 (Automatic scrolling)
- ✅ 块重排 (Block rearrangement)
- ✅ 删除块 (Delete blocks)
- ✅ 自动居中 (Automatic block centering)
- ✅ 条件对齐 (Conditional snapping)
- ✅ 条件删除 (Conditional block removal)
- ✅ 导入保存文件 (Import saved files)
- ✅ 移动端支持 (Mobile support)
- ✅ 纯JavaScript (Vanilla javascript - no dependencies)
- ❌ npm安装 (npm install) - 待实现

##### API接口概览
```javascript
// 初始化
flowy(canvas, ongrab, onrelease, onsnap, onrearrange, spacing_x, spacing_y);

// 主要方法
flowy.output();        // 获取流程图数据
flowy.import(data);    // 导入流程图数据
flowy.deleteBlocks();  // 删除所有块
```

##### 数据结构
```json
{
  "html": "canvas的HTML内容",
  "blockarr": "内部块数组(用于导入)",
  "blocks": [
    {
      "id": "唯一标识",
      "parent": "父块ID(-1表示无父块)",
      "data": "输入数据数组",
      "attr": "属性数组"
    }
  ]
}
```

#### 🤔 疑问和思考
1. **性能考虑**: 大量块时的性能如何？
2. **扩展性**: 如何添加自定义块类型？
3. **集成方式**: 最佳的集成方案是什么？
4. **浏览器兼容**: 对老版本浏览器的支持程度？

#### 📋 下一步计划
- [x] 完成README文档的详细阅读
- [x] 运行docs/original-demo演示
- [/] 分析项目结构和文件组织

---

## 📁 项目结构分析

### 🏗️ 整体架构
```
flowy/
├── 📂 src/                    # 核心源代码
│   ├── flowy.js              # 主要逻辑 (478行)
│   └── flowy.css             # 样式文件
├── 📂 docs/                   # 文档和演示
│   ├── LEARNING_NOTES.md     # 学习笔记
│   ├── PRODUCT_BACKLOG.md    # 产品待办列表
│   ├── SPRINT_BOARD.md       # Sprint看板
│   └── original-demo/        # 原始演示项目
├── 📂 node_modules/           # 依赖包 (本地开发)
├── 📂 .github/                # GitHub配置
│   └── FUNDING.yml           # 赞助配置
├── 📄 .gitignore             # Git忽略文件
├── 📄 .gitattributes         # Git属性配置
├── 📄 LICENSE                # MIT许可证
└── 📄 README.md              # 项目文档

注意：
- dist/ 和 coverage/ 目录在远程仓库中不存在
- 这些是本地构建和测试生成的临时文件
- 已在.gitignore中正确配置忽略
```

### 🎯 核心文件分析

#### 1. 源代码目录 (`src/`)
- **flowy.js** (478行):
  - 主函数定义和参数处理
  - 浏览器兼容性处理 (Element.prototype.matches/closest)
  - 拖拽事件处理逻辑
  - 数据导入导出功能
  - 块管理和布局算法
- **flowy.css**:
  - 拖拽状态样式 (.dragging)
  - 指示器样式 (.indicator)
  - 箭头连接样式 (.arrowblock)
  - 动画和过渡效果

#### 2. 构建输出 (`dist/` - 本地生成)
- **注意**: 此目录不在远程仓库中，是本地构建生成的
- **flowy.es.js**: ES6模块格式，用于现代构建工具
- **flowy.iife.js**: 立即执行函数格式，用于直接引入
- **flowy.umd.js**: 通用模块格式，兼容多种环境
- **对应的.map文件**: 用于调试的源码映射

#### 3. 演示项目 (`docs/original-demo/`)
- **index.html**: 完整的演示页面
- **main.js**: 演示逻辑和Flowy初始化
- **styles.css**: 演示页面样式
- **assets/**: 图标和资源文件
- **flowy.min.js/css**: 压缩版本的库文件

### 🔧 开发环境配置

#### 依赖管理
- **node_modules/**: 包含开发依赖
  - Jest: 测试框架
  - Rollup: 构建工具
  - Babel: 代码转换
  - Vite: 开发服务器
  - Playwright: 端到端测试

#### 构建系统
- **多格式输出**: ES6, IIFE, UMD
- **源码映射**: 支持调试
- **代码压缩**: 生产环境优化

#### 测试覆盖率 (本地生成)
- **coverage/**: Jest生成的覆盖率报告 (不在远程仓库)
- **HTML报告**: 可视化覆盖率数据 (本地查看)

### 📊 项目特点

#### ✅ 优势
1. **轻量级**: 核心代码仅478行
2. **无依赖**: 纯JavaScript实现
3. **多格式支持**: ES6/IIFE/UMD
4. **完整测试**: 有测试覆盖率
5. **现代构建**: 使用Rollup/Vite

#### 🤔 关键发现
1. **简洁的项目结构**: 只有核心源码和演示，没有复杂的配置文件
2. **缺少package.json**: 没有标准的npm配置文件
3. **构建工具存在**: 虽然有node_modules，但构建配置可能使用默认设置
4. **专注核心功能**: 项目保持轻量级，避免过度工程化

### 🔧 开发工具链分析

#### 已安装的开发依赖
从node_modules可以看出项目使用了现代化的开发工具链：

**构建工具**:
- **Rollup**: 模块打包器，生成多种格式输出
- **Vite**: 现代前端构建工具，提供开发服务器
- **Babel**: JavaScript编译器，处理兼容性

**测试框架**:
- **Jest**: JavaScript测试框架
- **Playwright**: 端到端测试工具
- **JSDOM**: DOM环境模拟

**代码质量**:
- **ESLint相关**: 代码检查 (通过babel插件)
- **Istanbul**: 代码覆盖率统计
- **Terser**: 代码压缩

**其他工具**:
- **PostCSS**: CSS处理器
- **Core-js**: JavaScript polyfill库

#### 推测的构建流程
1. **开发**: 使用Vite提供热重载开发服务器
2. **构建**: 使用Rollup打包生成多种格式
3. **测试**: Jest单元测试 + Playwright端到端测试
4. **发布**: 生成压缩版本到dist目录

---

## 🔍 代码分析笔记

### flowy.js 结构分析 (待完成)
```javascript
// 主函数结构
var flowy = function(canvas, grab, release, snapping, rearrange, spacing_x, spacing_y) {
    // 参数默认值处理
    // 兼容性处理 (Element.prototype.matches, Element.prototype.closest)
    // 核心变量初始化
    // 事件监听器设置
    // 方法定义 (import, output, deleteBlocks)
}
```

### CSS样式分析 (待完成)
- 拖拽状态样式
- 指示器样式
- 箭头连接样式
- 动画效果

---

## 💡 最佳实践和技巧

### 开发环境设置
- 使用现代浏览器的开发者工具
- 设置断点调试拖拽逻辑
- 使用console.log跟踪数据流

### 学习方法
- 先理解整体架构，再深入细节
- 通过修改演示代码验证理解
- 记录每个函数的作用和参数

---

## 🐛 问题和解决方案

### 已解决问题
1. **项目结构混乱** - 重新组织了目录结构
2. **缺少任务管理** - 创建了Scrum Backlog

### 待解决问题
- 暂无

---

## 📊 学习进度跟踪

### Sprint 1 进度
- [x] 项目重组 (100%)
- [x] US-001: 研读文档 (100%)
- [x] US-002: 运行演示 (100%)
- [x] US-003: 分析结构 (100%)
- [/] US-004: 理解开发流程 (0%)

### 知识掌握程度
- **基础概念**: ⭐⭐⭐⭐⚪ (80%)
- **API使用**: ⭐⭐⭐⚪⚪ (60%)
- **项目结构**: ⭐⭐⭐⭐⚪ (80%)
- **代码实现**: ⭐⚪⚪⚪⚪ (20%)
- **扩展开发**: ⚪⚪⚪⚪⚪ (0%)

---

*学习者: Frank Sun*
*最后更新: 2025-08-04 13:30*
