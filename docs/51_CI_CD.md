# 🚀 CI/CD 流水线文档

## 概述

Flowy 项目配备了完整的 GitHub Actions CI/CD 流水线，提供自动化测试、构建、质量检查和部署功能。

## 🔄 工作流概览

### 1. 🚀 主 CI/CD 流水线 (`ci.yml`)

**触发条件**:
- Push 到 `main`, `master`, `develop` 分支
- Pull Request 到 `main`, `master` 分支
- 手动触发

**作业流程**:
```
🧪 测试 → 🔨 构建 → 🔍 质量检查 → 🚀 部署
```

#### 🧪 测试作业
- 运行单元测试
- 生成覆盖率报告
- 上传覆盖率到 Codecov
- 缓存覆盖率结果

#### 🔨 构建作业
- 构建库文件 (ES, UMD, IIFE)
- 检查构建大小
- 上传构建产物

#### 🔍 质量检查作业
- 代码复杂度分析
- TODO/FIXME 统计
- Bundle 分析

#### 🚀 部署作业
- 仅在主分支触发
- 部署到 GitHub Pages
- 生成部署摘要

### 2. 📦 发布流水线 (`release.yml`)

**触发条件**:
- Push 标签 (v*)
- 手动触发

**功能**:
- 自动生成 Changelog
- 创建 GitHub Release
- 上传构建产物
- 可选 NPM 发布

### 3. 🔍 代码质量检查 (`quality.yml`)

**触发条件**:
- Push 到主要分支
- Pull Request
- 每日定时 (UTC 2:00)
- 手动触发

**检查项目**:
- 代码复杂度分析
- 依赖分析
- 安全审计
- 测试覆盖率分析
- 性能基准测试

### 4. 🔄 依赖管理 (`dependencies.yml`)

**触发条件**:
- 每周一定时 (UTC 9:00)
- 手动触发

**功能**:
- 检查过时的包
- 安全漏洞扫描
- 依赖统计分析
- 可选自动更新

## 📊 状态徽章

在 README.md 中添加以下徽章来显示项目状态：

```markdown
![CI](https://github.com/franksunye/flowy/workflows/🚀%20CI/CD%20Pipeline/badge.svg)
![Quality](https://github.com/franksunye/flowy/workflows/🔍%20Code%20Quality/badge.svg)
![Dependencies](https://github.com/franksunye/flowy/workflows/🔄%20Dependencies/badge.svg)
```

## 🔧 配置说明

### 环境变量
- `NODE_VERSION`: Node.js 版本 (默认: 18)
- `CACHE_KEY`: 缓存键名

### Secrets 配置
在 GitHub 仓库设置中配置以下 Secrets：

| Secret | 描述 | 必需 |
|--------|------|------|
| `GITHUB_TOKEN` | GitHub 访问令牌 | ✅ (自动提供) |
| `NPM_TOKEN` | NPM 发布令牌 | ❌ (仅 NPM 发布需要) |
| `CODECOV_TOKEN` | Codecov 上传令牌 | ❌ (可选) |

### 权限设置
确保 GitHub Actions 具有以下权限：
- `contents: write` (用于创建 Release)
- `pages: write` (用于 GitHub Pages 部署)
- `id-token: write` (用于 OIDC)

## 📈 报告和产物

### 构建产物
- **ES Module**: `dist/flowy.es.js`
- **UMD**: `dist/flowy.umd.js`
- **IIFE**: `dist/flowy.iife.js`
- **Source Maps**: `*.js.map`

### 测试报告
- **覆盖率报告**: `coverage/`
- **LCOV 文件**: `coverage/lcov.info`

### 质量报告
- **依赖审计**: `audit.json`
- **过时包列表**: `outdated.json`
- **性能日志**: `performance.log`

## 🎯 最佳实践

### 分支策略
- `main/master`: 生产分支，触发完整 CI/CD
- `develop`: 开发分支，运行测试和质量检查
- `feature/*`: 功能分支，运行基础测试

### 提交规范
使用约定式提交格式：
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

类型：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 发布流程
1. 更新版本号：`npm version patch/minor/major`
2. 推送标签：`git push origin v1.0.0`
3. GitHub Actions 自动创建 Release

## 🔧 自定义配置

### 启用 NPM 发布
在 `release.yml` 中设置：
```yaml
npm-publish:
  if: true  # 改为 true
```

### 启用自动依赖更新
在 `dependencies.yml` 中设置：
```yaml
auto-update:
  if: true  # 改为 true
```

### 修改触发条件
根据需要调整各工作流的 `on` 配置。

## 🚨 故障排除

### 常见问题

1. **测试失败**
   - 检查测试代码
   - 验证依赖安装
   - 查看详细日志

2. **构建失败**
   - 检查 Vite 配置
   - 验证源代码语法
   - 确认依赖完整

3. **部署失败**
   - 检查 GitHub Pages 设置
   - 验证权限配置
   - 确认分支保护规则

### 调试技巧
- 使用 `workflow_dispatch` 手动触发
- 查看 Actions 日志详情
- 检查 Summary 报告
- 下载 Artifacts 分析

## 🎉 总结

完整的 CI/CD 流水线为 Flowy 项目提供：

- ✅ **自动化测试** - 每次提交都运行测试
- ✅ **质量保证** - 代码质量和安全检查
- ✅ **自动构建** - 多格式库文件生成
- ✅ **自动部署** - GitHub Pages 部署
- ✅ **发布管理** - 自动化版本发布
- ✅ **依赖管理** - 定期依赖检查和更新

这确保了代码质量、项目稳定性和开发效率！
