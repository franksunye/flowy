# 📚 Flowy 项目文档

## 🎯 文档结构

本文档目录按照敏捷开发原则组织，采用编号系统便于快速定位和维护。

### 📋 核心文档 (按优先级编号)

| 编号 | 文档 | 描述 | 受众 |
|------|------|------|------|
| 00 | [BACKLOG.md](00_BACKLOG.md) | 产品待办事项和Sprint规划 | 产品经理、开发团队 |
| 01 | [CHANGELOG.md](01_CHANGELOG.md) | 版本变更记录 | 所有用户 |
| 10 | [ARCHITECTURE.md](10_ARCHITECTURE.md) | 系统架构设计 | 开发团队、架构师 |
| 11 | [SNAP_ENGINE_ANALYSIS.md](11_SNAP_ENGINE_ANALYSIS.md) | 吸附引擎技术分析 | 开发团队 |
| 20 | [API.md](20_API.md) | API接口文档 | 用户、集成开发者 |
| 30 | [DEVELOPMENT.md](30_DEVELOPMENT.md) | 开发环境和流程 | 开发团队 |
| 35 | [REFACTOR_PLAN.md](35_REFACTOR_PLAN.md) | 重构计划和进展 | 开发团队 |
| 50 | [DEPLOYMENT.md](50_DEPLOYMENT.md) | 部署指南 | 运维团队 |
| 60 | [TESTING_STATUS.md](60_TESTING_STATUS.md) | 测试状态总览 | 开发团队、QA |

### 🎨 演示和示例

#### 重构参考演示 (关键参考对象)
- **`original-demo/`** - 原始演示版本 ⭐ **重构基准**
  - 使用 `flowy.min.js` 的最初演示
  - **重构阶段关键参考**: 功能对比和行为基准
  - 确保重构后功能与原版100%一致

- **`src-demo/`** - 源码演示版本 ⭐ **重构起点**
  - 使用原始 `src/flowy.js` (478行单体文件)
  - **重构阶段关键参考**: 代码结构分析和模块提取
  - 包含完整的原始架构实现

#### 重构验证演示
- **`refactor-demo/`** - 重构过程实时验证演示
  - 用于验证模块化重构的功能完整性
  - 提供与原版完全一致的用户体验
  - 详细说明见 [refactor-demo/README.md](refactor-demo/README.md)

### 📁 归档文档

- **`archive/`** - 历史文档和演示归档
  - 包含项目演进过程中的历史文档
  - 详细的测试分析报告
  - 原始演示版本
  - 详细说明见 [archive/README.md](archive/README.md)

## 🚀 快速导航

### 👥 按角色导航

**产品经理**:
- [00_BACKLOG.md](00_BACKLOG.md) - 了解产品规划
- [01_CHANGELOG.md](01_CHANGELOG.md) - 跟踪版本进展

**开发者**:
- [30_DEVELOPMENT.md](30_DEVELOPMENT.md) - 开发环境设置
- [10_ARCHITECTURE.md](10_ARCHITECTURE.md) - 系统架构
- [35_REFACTOR_PLAN.md](35_REFACTOR_PLAN.md) - 重构计划
- [60_TESTING_STATUS.md](60_TESTING_STATUS.md) - 测试状态

**用户/集成者**:
- [20_API.md](20_API.md) - API使用指南
- [50_DEPLOYMENT.md](50_DEPLOYMENT.md) - 部署说明

### 🔍 按任务导航

**开始开发**:
1. [30_DEVELOPMENT.md](30_DEVELOPMENT.md) - 环境设置
2. [10_ARCHITECTURE.md](10_ARCHITECTURE.md) - 架构理解
3. [00_BACKLOG.md](00_BACKLOG.md) - 任务分配

**重构工作**:
1. [35_REFACTOR_PLAN.md](35_REFACTOR_PLAN.md) - 重构计划
2. [10_ARCHITECTURE.md](10_ARCHITECTURE.md) - 架构设计
3. [original-demo/](original-demo/) - 功能基准参考
4. [src-demo/](src-demo/) - 原始代码参考
5. [refactor-demo/](refactor-demo/) - 功能验证

**问题排查**:
1. [archive/historical-reports/](archive/historical-reports/) - 历史问题分析
2. [00_BACKLOG.md](00_BACKLOG.md) - 当前问题状态

**功能集成**:
1. [20_API.md](20_API.md) - API文档
2. [refactor-demo/](refactor-demo/) - 功能演示

## 📊 文档维护

### 🔄 更新频率

- **每Sprint更新**: 00_BACKLOG.md, 35_REFACTOR_PLAN.md
- **版本发布时更新**: 01_CHANGELOG.md, 20_API.md
- **架构变更时更新**: 10_ARCHITECTURE.md, 11_SNAP_ENGINE_ANALYSIS.md
- **按需更新**: 30_DEVELOPMENT.md, 50_DEPLOYMENT.md

### 👥 维护责任

- **产品文档** (00, 01): 产品经理
- **技术文档** (10, 11, 30, 35): 技术负责人
- **用户文档** (20, 50): 开发团队

### 📋 文档质量标准

- ✅ 内容准确且及时更新
- ✅ 结构清晰，易于导航
- ✅ 面向特定受众编写
- ✅ 包含实际可操作的信息
- ✅ 避免重复和冗余

## 🎯 敏捷文档原则

本文档体系遵循敏捷开发的文档原则：

1. **价值驱动**: 只保留对团队和用户有实际价值的文档
2. **及时更新**: 文档与代码同步更新，避免过时信息
3. **简洁有效**: 重点突出，避免冗长的描述
4. **用户导向**: 按照用户需求和使用场景组织内容
5. **持续改进**: 定期审查和优化文档结构

## 📈 Scrum实践

### Sprint文档管理
- **Sprint计划**: 在00_BACKLOG.md中管理
- **Sprint回顾**: 更新相关技术文档
- **增量交付**: 每个Sprint结束更新文档

### 文档作为信息辐射器
- 文档结构反映团队工作流程
- 编号系统便于快速定位
- 归档机制保持文档整洁

---

**最后更新**: 2025-07-24  
**文档版本**: v3.0 (Scrum敏捷整理版)  
**维护团队**: Flowy开发团队
