**🌐 [在线演示 Demo](https://franksunye.github.io/flowy/demo/)**

# Flowy（franksunye 维护分支）

> 一个极简的 JavaScript 流程图引擎，支持拖拽、吸附、重排等功能。

---

## 🙏 致谢

本项目基于 [alyssaxuu/flowy](https://github.com/alyssaxuu/flowy) 二次开发。
特别感谢原作者 [Alyssa X](https://github.com/alyssaxuu) 的精彩创作！

---

## 🚀 项目简介

**Flowy** 是一个轻量级的 JavaScript 流程图/自动化引擎，支持拖拽、块吸附、重排等功能。
适用于自动化工具、思维导图、低代码平台等场景。

---

## ✨ 主要特性

- 响应式拖拽
- 自动吸附与滚动
- 块的重排与删除
- 流程数据导入/导出（JSON）
- 移动端支持
- 无依赖，纯原生 JS
- 易于集成到任何 Web 项目

---

## 📦 安装方法

1. 下载或克隆本仓库：
   ```sh
   git clone https://github.com/franksunye/flowy.git
   ```
2. 或直接在项目中引用打包文件：
   ```html
   <link rel="stylesheet" href="flowy.min.css">
   <script src="flowy.min.js"></script>
   ```

---

## 🛠️ 使用方法

1. 添加流程图容器：
   ```html
   <div id="canvas"></div>
   ```
2. 添加可拖拽的块（`.create-flowy`）：
   ```html
   <div class="create-flowy">拖我</div>
   ```
3. 在 JS 中初始化 Flowy：
   ```js
   flowy(document.getElementById("canvas"));
   ```

更多高级用法和 API 说明请参考[原项目文档](https://github.com/alyssaxuu/flowy)。

---

## 💾 数据持久化

- 导出：`const data = flowy.output();`
- 导入：`flowy.import(data);`
- 你可以将 JSON 数据存储到后端或 localStorage。

---

## 📝 许可证

MIT License

---

## 📣 关于本分支

本分支由 [franksunye](https://github.com/franksunye) 维护，可能包含自定义功能、Bug 修复或文档改进。

--- 