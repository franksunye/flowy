# 贡献指南

感谢您对 Flowy 项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、测试还是反馈建议。

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- Git

### 本地开发设置

1. **Fork 项目**

   ```bash
   # 在 GitHub 上 fork 项目，然后克隆到本地
   git clone https://github.com/YOUR_USERNAME/flowy.git
   cd flowy
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **启动开发环境**

   ```bash
   npm run dev
   ```

4. **运行测试**
   ```bash
   npm test
   npm run test:watch  # 监听模式
   npm run test:coverage  # 覆盖率报告
   ```

## 📋 贡献类型

### 🐛 Bug 报告

- 使用 [Bug Report 模板](https://github.com/franksunye/flowy/issues/new?template=bug_report.md)
- 提供详细的重现步骤
- 包含环境信息和错误截图

### 💡 功能建议

- 使用 [Feature Request 模板](https://github.com/franksunye/flowy/issues/new?template=feature_request.md)
- 描述使用场景和预期效果
- 考虑向后兼容性

### 📝 文档改进

- 修复文档错误
- 添加使用示例
- 改进 API 文档
- 翻译文档

### 🔧 代码贡献

- Bug 修复
- 新功能开发
- 性能优化
- 代码重构

## 🛠️ 开发流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 开发规范

#### 代码风格

- 使用 TypeScript
- 遵循 ESLint 和 Prettier 配置
- 提交前自动格式化代码

#### 命名规范

- 文件名：kebab-case (`my-component.ts`)
- 类名：PascalCase (`MyComponent`)
- 函数名：camelCase (`myFunction`)
- 常量：UPPER_SNAKE_CASE (`MY_CONSTANT`)

#### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
type(scope): description

[optional body]

[optional footer]
```

**类型 (type):**

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具、依赖更新等

**示例:**

```
feat(core): add node parameter configuration system

- Add input/output port definitions
- Implement data type validation
- Support parameter persistence

Closes #123
```

### 3. 测试要求

#### 单元测试

- 新功能必须包含测试
- 测试覆盖率不低于 80%
- 使用 Jest 测试框架

```typescript
// 示例测试
describe('FlowyCore', () => {
  it('should create a new node', () => {
    const flowy = new FlowyCore();
    const nodeId = flowy.addNode({ type: 'action', data: {} });
    expect(nodeId).toBeDefined();
    expect(flowy.getNode(nodeId)).toBeTruthy();
  });
});
```

#### 集成测试

- 测试组件间交互
- 验证完整用户流程

#### E2E 测试

- 关键功能的端到端测试
- 使用 Playwright 或 Cypress

### 4. 文档更新

- 更新相关的 API 文档
- 添加使用示例
- 更新 CHANGELOG.md

### 5. 提交 Pull Request

#### PR 检查清单

- [ ] 代码通过所有测试
- [ ] 代码符合风格规范
- [ ] 包含必要的测试
- [ ] 更新相关文档
- [ ] 填写完整的 PR 描述

#### PR 模板

使用项目提供的 [PR 模板](https://github.com/franksunye/flowy/blob/master/.github/pull_request_template.md)

## 📚 项目架构

### 目录结构

```
src/
├── core/           # 核心引擎
│   ├── flowy.ts   # 主要类
│   ├── node.ts    # 节点管理
│   └── connection.ts # 连线管理
├── renderer/       # 渲染器
│   ├── svg.ts     # SVG 渲染
│   └── canvas.ts  # Canvas 渲染
├── types/          # 类型定义
│   ├── core.ts    # 核心类型
│   └── events.ts  # 事件类型
└── utils/          # 工具函数
    ├── dom.ts     # DOM 操作
    └── math.ts    # 数学计算
```

### 设计原则

- **单一职责**: 每个模块专注一个功能
- **开放封闭**: 对扩展开放，对修改封闭
- **依赖倒置**: 依赖抽象而非具体实现
- **接口隔离**: 使用小而专一的接口

## 🔍 代码审查

### 审查标准

- **功能性**: 代码是否正确实现需求
- **可读性**: 代码是否清晰易懂
- **性能**: 是否有性能问题
- **安全性**: 是否存在安全隐患
- **测试**: 测试是否充分

### 审查流程

1. 自动化检查（CI/CD）
2. 代码审查（至少一个维护者）
3. 测试验证
4. 合并到主分支

## 🏷️ 发布流程

### 版本号规则

遵循 [语义化版本](https://semver.org/)：

- **Major** (x.0.0): 不兼容的 API 变更
- **Minor** (0.x.0): 向后兼容的功能新增
- **Patch** (0.0.x): 向后兼容的问题修复

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git tag
4. 自动发布到 NPM
5. 创建 GitHub Release

## 🤝 社区行为准则

### 我们的承诺

- 营造开放友好的环境
- 尊重不同观点和经验
- 接受建设性批评
- 关注社区最佳利益

### 不当行为

- 使用性别化语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经许可发布他人私人信息

### 执行

项目维护者有权删除、编辑或拒绝不符合行为准则的评论、提交、代码、问题等。

## 📞 获取帮助

### 联系方式

- **GitHub Issues**: 报告 Bug 或功能请求
- **GitHub Discussions**: 一般讨论和问题
- **Email**: franksunye@hotmail.com

### 常见问题

查看 [FAQ](docs/FAQ.md) 获取常见问题解答。

## 🎉 贡献者

感谢所有贡献者！

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

再次感谢您的贡献！每一个贡献都让 Flowy 变得更好。
