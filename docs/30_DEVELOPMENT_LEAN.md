# 🛠️ Flowy 开发指南

## 🚀 快速开始

### 环境设置
```bash
# 克隆并设置
git clone https://github.com/franksunye/flowy.git
cd flowy && npm install

# 验证环境
npm test                    # 83/83 测试通过
npm run dev                 # 启动开发服务器
```

### 开发工作流
```bash
npm run dev                 # 开发服务器 (HMR)
npm run test:watch          # 测试监听模式
npm run lint                # 代码质量检查
npm run build               # 生产构建
```

## 📁 项目结构

```
flowy/
├── src/                    # 源代码 (模块化)
│   ├── flowy.js           # 主入口
│   ├── core/              # 核心模块
│   └── utils/             # 工具模块
├── tests/                  # 测试套件 (83个测试)
├── dist/                   # 构建输出 (ES/UMD/IIFE)
└── docs/                   # 项目文档
```

## 🧪 测试

### 测试概览
- **总数**: 83个单元测试，100%通过率
- **类型**: API契约、拖拽功能、吸附算法、工作流行为
- **环境**: 隔离测试环境，避免测试间干扰

### 测试命令
```bash
npm test                    # 运行所有测试
npm run test:unit           # 单元测试
npm run test:e2e            # 端到端测试
npm run test:watch          # 监听模式
npm run test:coverage       # 覆盖率报告
```

### 编写测试
```javascript
// 使用隔离测试环境
describe('功能模块', () => {
    test('应该测试特定功能', async () => {
        await withIsolatedTest('test-name', async (testInstance) => {
            // 测试逻辑
            expect(testInstance.flowy).toBeDefined();
        });
    });
});
```

## 🔧 代码质量

### 质量工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **EditorConfig**: 编辑器一致性

### 质量检查
```bash
npm run lint                # 检查代码质量
npm run lint:fix            # 自动修复
npm run format              # 格式化代码
npm run format:check        # 检查格式

# 提交前检查
npm run lint && npm run format:check && npm test
```

## 🏗️ 模块化开发

### 当前模块
- ✅ **DOM工具模块** (`src/utils/dom-utils.js`)
- ✅ **块管理模块** (`src/core/block-manager.js`)
- 🔄 **吸附引擎模块** (计划中)
- 📋 **拖拽处理模块** (计划中)

### 模块开发原则
1. **单一职责** - 每个模块专注一个功能
2. **低耦合** - 最小化模块间依赖
3. **向后兼容** - 保持API完全兼容
4. **测试驱动** - 每个模块都有测试覆盖

### 添加新模块
1. 在适当目录创建模块文件
2. 编写功能和导出接口
3. 更新主入口文件导入
4. 编写对应单元测试
5. 更新文档

## 📦 构建和部署

### 构建系统
- **工具**: Vite (现代化构建)
- **格式**: ES模块、UMD、IIFE
- **特性**: HMR、源码映射、代码压缩

### 构建命令
```bash
npm run build               # 生产构建
npm run build:lib           # 库文件构建
npm run preview             # 预览构建结果
```

### 构建输出
```
dist/
├── flowy.es.js            # ES模块 (31.07 kB)
├── flowy.umd.js           # UMD格式 (15.06 kB)
├── flowy.iife.js          # IIFE格式 (15.00 kB)
└── *.js.map               # 源码映射
```

## 🔄 Git工作流

### 分支策略
- `master`: 稳定版本
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `docs/*`: 文档分支

### 提交规范
```
type(scope): description

类型:
feat: 新功能        fix: Bug修复
docs: 文档更新      test: 测试相关
refactor: 重构      style: 代码格式
chore: 构建/工具    perf: 性能优化
```

### 开发流程
1. 创建功能分支
2. 编写测试用例
3. 实现功能代码
4. 运行质量检查
5. 提交Pull Request

## 🐛 调试

### 调试工具
- Chrome DevTools
- Jest调试模式
- 专用调试脚本 (`tests/debug-*.js`)

### 常见问题
- **测试间依赖**: 使用隔离测试环境
- **DOM环境问题**: 检查JSDOM配置
- **异步时序**: 适当的等待和Promise处理

## 📊 性能监控

### 关键指标
- **测试执行**: ~6秒 (83个测试)
- **构建时间**: <10秒
- **开发服务器**: <1秒启动
- **热更新**: <500ms响应

### 性能测试
```bash
npm run test:performance   # 性能基准测试
```

## 🎯 最佳实践

### 代码规范
- 使用TypeScript类型注释 (渐进式)
- 保持函数简洁 (<50行)
- 使用描述性变量名
- 添加必要注释

### 测试规范
- 每个功能都要有测试
- 测试名称要清晰描述
- 使用隔离测试环境
- 保持测试独立性

### 文档规范
- 及时更新相关文档
- 使用清晰的示例
- 保持文档简洁实用

---

**维护者**: Flowy开发团队  
**最后更新**: 2025-07-22
