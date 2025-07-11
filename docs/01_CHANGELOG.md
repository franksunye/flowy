# 01_CHANGELOG - Flowy 变更日志

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 计划中

- React/Vue 适配器开发
- AI/Agent 特性集成
- 插件机制设计

---

## [1.0.0-alpha.2] - 2025-07-10

### Added

- 🏗️ 完成模块化架构重构
- 📦 拖拽管理器 (DragManager) - 处理所有拖拽逻辑
- 🎨 SVG 渲染器 (SvgRenderer) - 负责连接线渲染
- 💾 数据管理器 (DataManager) - 处理数据导入导出和格式转换
- 🔄 传统 API 兼容层 - 完全向后兼容原始 flowy.js API
- 🧪 新增 56 个测试用例，覆盖率 55.13%

### Changed

- 🔧 将单文件 engine/flowy.js (663行) 重构为模块化 TypeScript 架构
- 📁 新的模块结构：core/、renderer/、legacy/、types/、utils/
- 🎯 保持 100% API 向后兼容性
- 📊 扩展类型定义以支持传统和现代两种数据格式

### Technical Architecture

- ✅ **DragManager**: 统一处理鼠标和触控拖拽事件
- ✅ **DataManager**: 现代格式与传统格式的双向转换
- ✅ **SvgRenderer**: SVG 连接线和箭头渲染
- ✅ **Legacy API**: 完全兼容原始 flowy() 函数调用
- ✅ **Type Safety**: 完整的 TypeScript 类型定义

### Backward Compatibility

- 🔄 原始 `flowy(canvas, grab, release, snapping, rearrange, spacing_x, spacing_y)` API 完全支持
- 🔄 传统数据格式 `{html, blockarr, blocks}` 完全支持
- 🔄 所有原始方法 `load()`, `output()`, `import()`, `deleteBlocks()` 等完全支持
- 🔄 事件回调函数签名保持不变

---

## [1.0.0-alpha.1] - 2025-07-10

### Added

- 🏗️ 现代化开发环境搭建完成
- 📦 TypeScript + Vite 构建工具链
- 🧪 Jest 测试框架，覆盖率 96.36%
- 🔧 ESLint + Prettier 代码规范
- 🚀 GitHub Actions CI/CD 流程
- 📝 完整的项目文档和贡献指南
- 🎯 基础 Flowy 核心类实现
- 🛠️ 工具函数库 (DOM、数学、通用工具)

### Technical Infrastructure

- ✅ package.json 和依赖管理
- ✅ TypeScript 配置和类型定义
- ✅ Vite 构建配置 (ESM/UMD/CJS)
- ✅ Jest 测试配置和基础测试
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + lint-staged Git hooks
- ✅ GitHub Actions CI/CD
- ✅ Issue/PR 模板

### Code Quality

- 📊 测试覆盖率: 96.36%
- 🎯 所有 CI 检查通过
- 📝 完整的 API 文档
- 🔧 自动化代码格式化

---

## [0.1.0] - 2025-07-10

### Added

- 📝 重新制定项目愿景和开发计划
- 📋 创建标准 Scrum Product Backlog
- 📊 建立变更日志记录机制
- 🎯 明确技术债务和优先级

### Changed

- 📁 文档结构按照分层编号系统重新组织
- 🎯 开发策略从"重写"调整为"渐进式重构"
- 📋 采用敏捷 Scrum 方法论管理开发流程

### Technical Debt Identified

- 🔴 单文件架构 (engine/flowy.js 663行)
- 🔴 缺少构建工具链 (无 package.json, TypeScript)
- 🔴 零测试覆盖
- 🔴 无类型安全保障

### Current Status

- ✅ 基础拖拽连线功能完整
- ✅ JSON 导入导出功能可用
- ✅ 移动端触控支持
- ✅ 功能完备的演示页面
- ❌ 现代化开发环境缺失
- ❌ 代码架构需要重构

---

## 变更日志说明

### 变更类型

- **Added** - 新增功能
- **Changed** - 功能变更
- **Deprecated** - 即将废弃的功能
- **Removed** - 已移除的功能
- **Fixed** - 问题修复
- **Security** - 安全相关

### 版本号规则

- **Major** (x.0.0) - 不兼容的 API 变更
- **Minor** (0.x.0) - 向后兼容的功能新增
- **Patch** (0.0.x) - 向后兼容的问题修复

### 发布节奏

- **Alpha** - 内部测试版本
- **Beta** - 公开测试版本
- **RC** - 发布候选版本
- **Stable** - 正式发布版本

---

## 贡献指南

### 如何更新 CHANGELOG

1. 在 `[Unreleased]` 部分添加变更
2. 发布时将变更移动到新版本号下
3. 使用正确的变更类型标签
4. 提供清晰的变更描述
5. 包含相关的 Issue/PR 链接

### 示例格式

```markdown
## [1.0.0] - 2025-08-01

### Added

- 🎉 TypeScript 模块化架构 (#123)
- ⚛️ React 组件适配器 (#124)
- 🧪 完整测试套件 (#125)

### Changed

- 🔧 构建工具从 Webpack 迁移到 Vite (#126)
- 📝 API 文档重新组织 (#127)

### Fixed

- 🐛 修复移动端拖拽问题 (#128)
- 🔧 修复 TypeScript 类型错误 (#129)

### Breaking Changes

- 💥 移除废弃的 `oldAPI()` 方法
- 💥 更改配置文件格式
```

---

## 发布检查清单

### 发布前

- [ ] 所有测试通过
- [ ] 文档更新完成
- [ ] CHANGELOG 更新
- [ ] 版本号更新
- [ ] 构建产物验证

### 发布后

- [ ] GitHub Release 创建
- [ ] NPM 包发布
- [ ] 文档网站更新
- [ ] 社区通知
- [ ] 反馈收集
