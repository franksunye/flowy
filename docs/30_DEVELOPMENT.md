# 30_DEVELOPMENT.md - Flowy 开发文档

## 🛠️ 开发环境设置

*此文档将在后续开发中逐步完善*

### 系统要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### 快速开始
```bash
# 克隆项目
git clone https://github.com/franksunye/flowy.git
cd flowy

# 安装依赖
npm install

# 运行测试
npm test

# 启动开发服务器 (计划中)
npm run dev
```

## 📁 项目结构

### 核心目录
```
flowy/
├── src/                    # 源代码
├── tests/                  # 测试文件
├── docs/                   # 文档和演示
├── dist/                   # 构建输出
└── 配置文件...
```

### 开发工具
- **测试**: Jest + JSDOM
- **代码质量**: 计划添加 ESLint + Prettier
- **构建**: 计划添加 Vite/Webpack
- **CI/CD**: 计划添加 GitHub Actions

## 🧪 测试

### 运行测试
```bash
# 所有测试
npm test

# 单元测试
npm run test:unit

# 端到端测试
npm run test:e2e

# 监听模式
npm run test:watch

# 覆盖率报告 (计划中)
npm run test:coverage
```

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
