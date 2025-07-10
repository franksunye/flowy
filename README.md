[简体中文 | Chinese README](./README.zh-CN.md)

**🌐 [Live Demo](https://franksunye.github.io/flowy/demo/)**

# Flowy (Forked by franksunye)

<p align="left">
  <a href="https://github.com/franksunye/flowy/stargazers"><img src="https://img.shields.io/github/stars/franksunye/flowy?style=social" alt="Stars"></a>
  <a href="https://github.com/franksunye/flowy/network/members"><img src="https://img.shields.io/github/forks/franksunye/flowy?style=social" alt="Forks"></a>
  <a href="https://github.com/franksunye/flowy/issues"><img src="https://img.shields.io/github/issues/franksunye/flowy" alt="Issues"></a>
  <a href="https://github.com/franksunye/flowy/pulls"><img src="https://img.shields.io/github/issues-pr/franksunye/flowy" alt="Pull Requests"></a>
  <a href="https://github.com/franksunye/flowy/blob/master/LICENSE"><img src="https://img.shields.io/github/license/franksunye/flowy" alt="License"></a>
  <a href="https://github.com/franksunye/flowy"><img src="https://img.shields.io/github/last-commit/franksunye/flowy" alt="Last Commit"></a>
  <a href="https://github.com/franksunye/flowy"><img src="https://img.shields.io/github/languages/top/franksunye/flowy" alt="Top Language"></a>
</p>

> A minimal JavaScript library to create flowcharts, with drag-and-drop, snapping, and more.

---

## 🙏 Acknowledgement

This project is a fork of [alyssaxuu/flowy](https://github.com/alyssaxuu/flowy).
Special thanks to [Alyssa X](https://github.com/alyssaxuu) for the original amazing work!

---

## 🚀 Introduction

**Flowy** is a lightweight JavaScript library for building flowcharts and automation pipelines with ease.
It supports drag-and-drop, block snapping, rearrangement, and is suitable for automation tools, mind mapping, low-code platforms, and more.

---

## ✨ Features

- Responsive drag and drop
- Automatic snapping and scrolling
- Block rearrangement and deletion
- Import/export flowchart data (JSON)
- Mobile support
- No dependencies (vanilla JS)
- Easy integration with any web project

---

## 📦 Installation

1. Download or clone this repository:
   ```sh
   git clone https://github.com/franksunye/flowy.git
   ```
2. Or use the minified files in your project:
   ```html
   <link rel="stylesheet" href="flowy.min.css">
   <script src="flowy.min.js"></script>
   ```

---

## 🛠️ Usage

1. Add a container for the flowchart:
   ```html
   <div id="canvas"></div>
   ```
2. Add draggable blocks with the `.create-flowy` class:
   ```html
   <div class="create-flowy">Drag me</div>
   ```
3. Initialize Flowy in your JS:
   ```js
   flowy(document.getElementById("canvas"));
   ```

For more advanced usage and API, see the [original documentation](https://github.com/alyssaxuu/flowy).

---

## 💾 Data Persistence

- Export: `const data = flowy.output();`
- Import: `flowy.import(data);`
- You can store the JSON data in your backend or localStorage.

---

## 📝 License

MIT License

---

## 📣 About This Fork

This fork is maintained by [franksunye](https://github.com/franksunye) and may include custom features, bugfixes, or documentation improvements.

For Chinese users, see [README.zh-CN.md](./README.zh-CN.md).

---
