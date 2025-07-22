# 🚀 Flowy 快速开始

> 现代化的JavaScript流程图库 - 简单易用的拖拽式流程图创建工具

## 📊 项目状态

**版本**: 1.0.0 | **测试**: 83/83 通过 | **构建**: Vite | **重构进度**: 40%

## ⚡ 30秒快速体验

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/flowy/dist/flowy.css">
    <script src="https://unpkg.com/flowy/dist/flowy.umd.js"></script>
</head>
<body>
    <div class="create-flowy">拖拽我!</div>
    <div id="canvas"></div>
    <script>flowy($("#canvas"));</script>
</body>
</html>
```

## 📦 安装方式

### CDN (推荐快速测试)
```html
<link rel="stylesheet" href="https://unpkg.com/flowy/dist/flowy.css">
<script src="https://unpkg.com/flowy/dist/flowy.umd.js"></script>
```

### npm (推荐项目使用)
```bash
npm install flowy
```

```javascript
import flowy from 'flowy';
import 'flowy/dist/flowy.css';
```

## 🛠️ 开发环境

### 系统要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 快速开始
```bash
git clone https://github.com/franksunye/flowy.git
cd flowy
npm install
npm test        # 验证环境 (83/83 测试)
npm run dev     # 启动开发服务器
```

## 🎯 核心功能

- ✅ **响应式拖拽** - 流畅的拖拽交互
- ✅ **自动吸附** - 智能的块定位  
- ✅ **块重排** - 动态工作流调整
- ✅ **数据输出** - JSON格式导出
- ✅ **多格式构建** - ES/UMD/IIFE

## 📚 API参考

### 初始化
```javascript
flowy(canvas, onGrab, onRelease, onSnap, spacingX, spacingY);
```

### 获取数据
```javascript
const data = flowy.output();        // 获取流程图数据
flowy.deleteBlocks();               // 清空所有块
```

### 创建可拖拽元素
```html
<div class="create-flowy" data-blocktype="start">开始</div>
```

## 🏗️ 架构概览

```
当前架构: 模块化重构中 (40%完成)
├── ✅ 测试基础 (83个单元测试)
├── ✅ 现代化构建 (Vite)
├── 🔄 模块化重构
│   ├── ✅ DOM工具模块
│   ├── ✅ 块管理模块  
│   ├── 🔄 吸附引擎模块
│   └── 📋 拖拽处理模块
└── 📋 ES6+现代化
```

## 🤝 参与贡献

### 快速贡献
1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'feat: add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发工作流
```bash
npm run dev         # 开发服务器
npm test           # 运行测试
npm run lint       # 代码检查
npm run build      # 构建项目
```

## 📞 获取帮助

- 📚 **完整文档**: [docs/](docs/)
- 🐛 **问题报告**: [GitHub Issues](https://github.com/franksunye/flowy/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/franksunye/flowy/discussions)

## 🎯 下一步

- 查看 [API文档](20_API.md) 了解详细接口
- 阅读 [开发指南](30_DEVELOPMENT.md) 参与开发
- 查看 [贡献指南](40_CONTRIBUTING.md) 了解贡献流程

---

**🚀 开始构建你的流程图应用吧！**
