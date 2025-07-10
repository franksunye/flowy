# Flowy - AI/Agent 流程可视化引擎

<p align="center">
  <a href="https://github.com/franksunye/flowy"><img src="https://img.shields.io/github/license/franksunye/flowy" alt="License"></a>
  <a href="https://www.npmjs.com/package/flowy"><img src="https://img.shields.io/npm/v/flowy" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/flowy"><img src="https://img.shields.io/npm/dm/flowy" alt="NPM Downloads"></a>
  <a href="https://github.com/franksunye/flowy"><img src="https://img.shields.io/github/stars/franksunye/flowy" alt="Stars"></a>
  <a href="https://github.com/franksunye/flowy/actions"><img src="https://img.shields.io/github/actions/workflow/status/franksunye/flowy/ci.yml" alt="CI Status"></a>
  <a href="https://codecov.io/gh/franksunye/flowy"><img src="https://img.shields.io/codecov/c/github/franksunye/flowy" alt="Coverage"></a>
</p>

<p align="center">
  <strong>现代化的 TypeScript 流程图库，专为 AI/Agent 系统设计</strong>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> •
  <a href="#特性">特性</a> •
  <a href="#安装">安装</a> •
  <a href="#使用方法">使用方法</a> •
  <a href="#api-文档">API</a> •
  <a href="#贡献">贡献</a>
</p>

**🌐 [在线演示](https://franksunye.github.io/flowy/demo/)** | **📖 [完整文档](https://franksunye.github.io/flowy/docs/)**

> 基于原始 Flowy 项目重新设计，专为 AI/Agent 工作流优化的现代化流程可视化引擎。

---

## ✨ 特性

### 🎯 核心功能

- **拖拽式编辑**: 直观的拖拽操作，快速构建流程图
- **智能连线**: 自动吸附和连线，支持多种连接模式
- **数据持久化**: 完整的 JSON 导入导出功能
- **移动端支持**: 优化的触控体验，支持手势操作

### 🚀 现代化架构

- **TypeScript**: 完整的类型安全和智能提示
- **模块化设计**: 清晰的架构，易于维护和扩展
- **零依赖**: 轻量级设计，无外部依赖
- **多格式支持**: ESM、UMD、CJS 多种模块格式

### 🤖 AI/Agent 特化

- **节点参数配置**: 支持复杂的输入输出参数定义
- **数据流管理**: 类型安全的数据传递和验证
- **状态监控**: 实时的执行状态追踪和调试
- **插件系统**: 可扩展的插件架构

### 🔧 开发者友好

- **框架适配**: React、Vue 组件开箱即用
- **完整测试**: 90%+ 测试覆盖率
- **详细文档**: 完整的 API 文档和示例
- **活跃社区**: 持续更新和社区支持

---

## 🚀 快速开始

### 安装

```bash
# npm
npm install flowy

# yarn
yarn add flowy

# pnpm
pnpm add flowy
```

### 基础使用

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/flowy/dist/flowy.css" />
  </head>
  <body>
    <div id="canvas"></div>
    <div class="create-flowy">拖拽我</div>

    <script src="node_modules/flowy/dist/flowy.js"></script>
    <script>
      // 初始化 Flowy
      const flowy = new Flowy(document.getElementById('canvas'));

      // 导出数据
      const data = flowy.export();
      console.log(data);

      // 导入数据
      flowy.import(data);
    </script>
  </body>
</html>
```

### TypeScript 使用

```typescript
import Flowy, { FlowyConfig, FlowyData } from 'flowy';

const config: FlowyConfig = {
  spacing: { x: 20, y: 80 },
  onGrab: block => console.log('Grabbed:', block),
  onRelease: () => console.log('Released'),
  onSnap: (drag, first, parent) => true,
};

const flowy = new Flowy(document.getElementById('canvas')!, config);

// 类型安全的数据操作
const data: FlowyData = flowy.export();
flowy.import(data);
```

### React 使用

```tsx
import React, { useRef } from 'react';
import { FlowyReact } from 'flowy/react';

function App() {
  const flowyRef = useRef<FlowyReact>(null);

  const handleExport = () => {
    const data = flowyRef.current?.export();
    console.log(data);
  };

  return (
    <div>
      <FlowyReact
        ref={flowyRef}
        spacing={{ x: 20, y: 80 }}
        onGrab={block => console.log('Grabbed:', block)}
      />
      <button onClick={handleExport}>导出数据</button>
    </div>
  );
}
```

---

## 📦 安装

### NPM/Yarn/PNPM

```bash
npm install flowy
yarn add flowy
pnpm add flowy
```

### CDN

```html
<!-- 最新版本 -->
<script src="https://unpkg.com/flowy@latest/dist/flowy.js"></script>
<link rel="stylesheet" href="https://unpkg.com/flowy@latest/dist/flowy.css" />

<!-- 指定版本 -->
<script src="https://unpkg.com/flowy@1.0.0/dist/flowy.js"></script>
<link rel="stylesheet" href="https://unpkg.com/flowy@1.0.0/dist/flowy.css" />
```

---

## 🛠️ 开发

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/franksunye/flowy.git
cd flowy

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建项目
npm run build
```

### 项目结构

```
flowy/
├── src/                 # 源代码
│   ├── core/           # 核心引擎
│   ├── renderer/       # 渲染器
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
├── tests/              # 测试文件
├── docs/               # 文档
├── examples/           # 示例项目
└── dist/               # 构建产物
```

---

## 📚 API 文档

### 基础 API

```typescript
// 创建实例
const flowy = new Flowy(container, config);

// 数据操作
flowy.export(): FlowyData
flowy.import(data: FlowyData): void

// 节点操作
flowy.addNode(node: NodeConfig): string
flowy.removeNode(id: string): void
flowy.updateNode(id: string, updates: Partial<NodeConfig>): void

// 连线操作
flowy.connect(fromId: string, toId: string): void
flowy.disconnect(fromId: string, toId: string): void

// 事件监听
flowy.on(event: string, callback: Function): void
flowy.off(event: string, callback: Function): void
```

### 配置选项

```typescript
interface FlowyConfig {
  spacing?: { x: number; y: number };
  onGrab?: (block: HTMLElement) => void;
  onRelease?: () => void;
  onSnap?: (
    drag: HTMLElement,
    first: HTMLElement,
    parent: HTMLElement
  ) => boolean;
  onRearrange?: (block: HTMLElement, parent: HTMLElement) => boolean;
}
```

---

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 贡献方式

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ⭐ 给项目点星

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 🙏 致谢

- 感谢 [Alyssa X](https://github.com/alyssaxuu) 创建的原始 [Flowy](https://github.com/alyssaxuu/flowy) 项目
- 感谢所有贡献者和社区成员的支持

---

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/franksunye/flowy/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/franksunye/flowy/discussions)
- **Email**: franksunye@hotmail.com

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/franksunye">franksunye</a>
</p>
