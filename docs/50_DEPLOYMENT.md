# 🚀 Flowy 构建与部署

## 📦 构建系统

### Vite 现代化构建
- **工具**: Vite (快速、现代化)
- **格式**: ES模块、UMD、IIFE
- **特性**: HMR、源码映射、代码压缩

### 构建命令
```bash
npm run build               # 生产构建
npm run build:lib           # 库文件构建
npm run preview             # 预览构建结果
npm run dev                 # 开发服务器
```

### 构建输出
```
dist/
├── flowy.es.js            # ES模块 (31.07 kB)
├── flowy.umd.js           # UMD格式 (15.06 kB)
├── flowy.iife.js          # IIFE格式 (15.00 kB)
└── *.js.map               # 源码映射
```

## 🔄 CI/CD 流水线

### GitHub Actions 工作流

#### 1. 🚀 主流水线 (`.github/workflows/ci.yml`)
**触发条件**: Push 到 master, Pull Request
```yaml
- 环境设置 (Node.js 18)
- 依赖安装
- 代码质量检查 (ESLint + Prettier)
- 单元测试 (83个测试)
- 构建验证
- 端到端测试
```

#### 2. 🔍 代码质量检查
**工具**:
- **ESLint**: 代码质量和潜在错误检查
- **Prettier**: 代码格式化
- **Jest**: 测试覆盖率

#### 3. 📊 状态徽章
```markdown
![CI](https://github.com/franksunye/flowy/workflows/CI/badge.svg)
![Tests](https://github.com/franksunye/flowy/workflows/Tests/badge.svg)
```

## 🌐 部署策略

### npm 发布
```bash
# 版本管理
npm version patch|minor|major

# 发布到 npm
npm publish

# 发布到 GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

### CDN 部署
```html
<!-- 最新版本 -->
<script src="https://unpkg.com/flowy/dist/flowy.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/flowy/dist/flowy.css">

<!-- 指定版本 -->
<script src="https://unpkg.com/flowy@1.0.0/dist/flowy.umd.js"></script>
```

### GitHub Pages 演示
- **演示地址**: https://franksunye.github.io/flowy
- **自动部署**: 推送到 master 分支自动更新

## 🔧 环境配置

### 开发环境
```bash
# 环境要求
Node.js >= 16.0.0
npm >= 8.0.0

# 开发服务器
npm run dev                 # http://localhost:3000
```

### 生产环境
```bash
# 构建优化
npm run build               # 压缩、Tree shaking
npm run preview             # 本地预览生产版本
```

### 环境变量
```bash
# 开发环境
NODE_ENV=development

# 生产环境  
NODE_ENV=production
```

## 📊 性能监控

### 构建性能
- **构建时间**: <10秒
- **包大小**: 
  - ES: 31.07 kB
  - UMD: 15.06 kB (推荐)
  - IIFE: 15.00 kB
- **压缩率**: ~70%

### 运行时性能
- **初始化**: <100ms
- **拖拽响应**: <16ms (60fps)
- **内存使用**: <5MB

## 🔒 安全配置

### 依赖安全
```bash
# 安全审计
npm audit

# 自动修复
npm audit fix

# 依赖更新
npm update
```

### 构建安全
- 源码映射仅开发环境
- 生产环境代码压缩混淆
- 无敏感信息泄露

## 🚀 发布流程

### 版本发布
1. **测试验证**: `npm test` (83/83 通过)
2. **构建检查**: `npm run build`
3. **版本更新**: `npm version patch`
4. **发布**: `npm publish`
5. **标签推送**: `git push --tags`

### 发布检查清单
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 文档更新
- [ ] 变更日志更新
- [ ] 版本号正确

## 🐛 故障排除

### 常见构建问题
- **依赖冲突**: `rm -rf node_modules && npm install`
- **缓存问题**: `npm run build -- --force`
- **类型错误**: 检查 TypeScript 配置

### 部署问题
- **CDN 缓存**: 等待缓存更新或使用版本号
- **兼容性**: 检查目标浏览器支持
- **权限问题**: 验证 npm 登录状态

---

**维护者**: Flowy开发团队  
**最后更新**: 2025-07-22
