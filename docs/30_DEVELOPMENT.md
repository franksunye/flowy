# 30_DEVELOPMENT.md - Flowy 开发文档

## 🛠️ 开发环境设置

### 系统要求
- **Node.js**: >= 16.0.0 (推荐 18.x 或更高)
- **npm**: >= 8.0.0 (或 yarn >= 1.22.0)
- **Git**: 最新版本
- **编辑器**: VS Code (推荐，有完整的配置支持)

### 快速开始
```bash
# 克隆项目
git clone https://github.com/franksunye/flowy.git
cd flowy

# 安装依赖
npm install

# 运行测试 (验证环境)
npm test

# 启动开发服务器
npm run dev
# 访问: http://localhost:3000

# 构建项目
npm run build
```

### 开发环境验证
运行以下命令确保环境正确设置：
```bash
# 检查所有测试通过
npm run test:unit
# 期望: 83/83 tests passed

# 检查代码质量
npm run lint
# 期望: 无错误

# 检查代码格式
npm run format:check
# 期望: 所有文件格式正确
```

## 📁 项目结构

### 核心目录
```
flowy/
├── src/                    # 🎯 源代码 (模块化架构)
│   ├── flowy.js           # 主入口文件
│   ├── flowy.css          # 核心样式
│   ├── core/              # 核心模块
│   │   └── block-manager.js # 块管理模块
│   └── utils/             # 工具模块
│       └── dom-utils.js   # DOM工具模块
├── tests/                  # 🧪 测试文件 (83个单元测试)
│   ├── unit/              # 单元测试
│   ├── e2e-test.js        # 端到端测试
│   └── performance/       # 性能测试
├── docs/                   # 📚 文档和演示
│   ├── original-demo/     # 原始演示
│   ├── refactor-demo/     # 重构版演示
│   └── *.md               # 项目文档
├── dist/                   # 📦 构建输出 (Vite生成)
│   ├── flowy.es.js        # ES模块格式
│   ├── flowy.umd.js       # UMD格式
│   └── flowy.iife.js      # IIFE格式
└── 配置文件...             # 现代化工具配置
```

### 开发工具栈 ✅
- **测试**: Jest + JSDOM (83个单元测试)
- **代码质量**: ESLint + Prettier
- **构建**: Vite (现代化构建系统)
- **CI/CD**: GitHub Actions
- **开发服务器**: Vite Dev Server (HMR支持)
- **包管理**: npm

## 🧪 测试

### 测试套件概览
- **总测试数**: 83个单元测试
- **通过率**: 100%
- **测试类型**: API契约、拖拽功能、吸附算法、工作流行为
- **测试环境**: 隔离测试环境，避免测试间干扰

### 运行测试
```bash
# 运行所有测试
npm test

# 单元测试 (推荐用于开发)
npm run test:unit

# 端到端测试
npm run test:e2e

# 性能测试
npm run test:performance

# 监听模式 (开发时使用)
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### 测试最佳实践
1. **编写测试**: 新功能必须有对应的单元测试
2. **隔离测试**: 使用 `IsolatedFlowyTestEnvironment` 确保测试隔离
3. **测试命名**: 使用描述性的测试名称
4. **边界测试**: 测试边界条件和错误情况
5. **性能测试**: 关键功能需要性能基准测试

## 🚀 构建和部署

### 开发构建
```bash
# 启动开发服务器 (推荐)
npm run dev
# 特性: 热模块替换、快速启动、源码映射

# 预览构建结果
npm run preview
```

### 生产构建
```bash
# 构建所有格式
npm run build

# 构建库文件 (专用)
npm run build:lib
```

### 构建输出
```
dist/
├── flowy.es.js      # ES模块格式 (现代浏览器)
├── flowy.umd.js     # UMD格式 (通用)
├── flowy.iife.js    # IIFE格式 (直接引用)
└── *.js.map         # 源码映射文件
```

## 🔧 代码质量

### 代码检查
```bash
# 检查代码质量
npm run lint

# 自动修复问题
npm run lint:fix

# 检查代码格式
npm run format:check

# 格式化代码
npm run format
```

### 代码质量工具
- **ESLint**: 代码质量和潜在错误检查
- **Prettier**: 代码格式化
- **EditorConfig**: 编辑器配置一致性

### 提交前检查
建议在提交代码前运行：
```bash
# 完整的质量检查
npm run lint && npm run format:check && npm test
```

## 🏗️ 模块化开发

### 当前模块结构
- ✅ **DOM工具模块** (`src/utils/dom-utils.js`)
- ✅ **块管理模块** (`src/core/block-manager.js`)
- 🔄 **吸附引擎模块** (计划中)
- 📋 **拖拽处理模块** (计划中)

### 模块开发原则
1. **单一职责**: 每个模块只负责一个核心功能
2. **低耦合**: 模块间依赖最小化
3. **高内聚**: 相关功能聚合在同一模块
4. **向后兼容**: 保持API完全兼容
5. **测试驱动**: 每个模块都有完整的测试覆盖

### 添加新模块
1. 在适当的目录创建模块文件
2. 编写模块功能和导出接口
3. 更新主入口文件的导入
4. 编写对应的单元测试
5. 更新文档

## 📚 开发工作流

### 日常开发
```bash
# 1. 启动开发环境
npm run dev

# 2. 运行测试 (另一个终端)
npm run test:watch

# 3. 代码质量检查
npm run lint
```

### 功能开发流程
1. **创建分支**: `git checkout -b feature/new-feature`
2. **编写测试**: 先写测试，明确需求
3. **实现功能**: 编写代码实现功能
4. **运行测试**: 确保所有测试通过
5. **代码质量**: 运行lint和format
6. **提交代码**: 使用清晰的提交信息
7. **创建PR**: 提交Pull Request

### 重构工作流
1. **建立基准**: 运行所有测试，记录基准
2. **小步重构**: 一次只重构一个小部分
3. **频繁验证**: 每个小改动后都运行测试
4. **保持兼容**: 确保API完全兼容
5. **文档更新**: 及时更新相关文档

---

**维护者**: Flowy开发团队
**最后更新**: 2025-07-22

### 测试文件结构
```
tests/
├── unit/                   # 单元测试
│   ├── api/               # API测试
│   ├── core/              # 核心功能测试
│   └── behavior/          # 行为测试
└── e2e/                   # 端到端测试
```

## 🔧 开发工作流

### Git工作流
1. 从 `development` 分支创建功能分支
2. 开发功能并编写测试
3. 确保所有测试通过
4. 提交Pull Request
5. 代码审查后合并

### 提交规范
```
type(scope): description

例如:
feat(core): 添加新的拖拽功能
fix(api): 修复output方法的bug
test(unit): 添加吸附算法测试
docs(readme): 更新安装说明
```

### 分支策略
- `master`: 稳定版本
- `development`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支

## 📋 编码规范

### JavaScript规范 (计划中)
- 使用ESLint配置
- Prettier代码格式化
- 2空格缩进
- 单引号字符串
- 分号结尾

### 测试规范
- 每个功能都要有对应测试
- 测试名称要清晰描述功能
- 使用隔离测试环境
- 保持测试独立性

## 🚀 构建和部署

### 构建命令 (计划中)
```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build:prod

# 监听构建
npm run build:watch
```

### 部署流程 (计划中)
1. 运行所有测试
2. 构建生产版本
3. 更新版本号
4. 发布到npm
5. 更新GitHub Release

## 🐛 调试

### 调试工具
- Chrome DevTools
- Jest调试模式
- 专用调试脚本 (`tests/debug-*.js`)

### 常见问题
- 测试间依赖: 使用隔离测试环境
- DOM环境问题: 检查JSDOM配置
- 异步时序: 适当的等待和Promise处理

---

**状态**: 基础版本  
**负责人**: 开发团队  
**最后更新**: 2025-07-18
