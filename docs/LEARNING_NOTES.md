# 📚 Flowy学习笔记

## 📖 学习日志

### 2025-08-04 - Sprint 1 Day 1

#### 🎯 今日目标
- [x] 项目结构重组和优化
- [/] 开始研读项目文档 (US-001)
- [ ] 准备运行演示环境

#### 📝 学习要点

##### 项目基本信息
- **项目名称**: Flowy - JavaScript流程图库
- **作者**: Alyssa X
- **特点**: 轻量级、无依赖、响应式拖拽
- **核心文件**: 
  - `src/flowy.js` (478行) - 主要逻辑
  - `src/flowy.css` - 样式文件

##### 核心功能特性
- ✅ 响应式拖拽 (Responsive drag and drop)
- ✅ 自动对齐 (Automatic snapping)  
- ✅ 自动滚动 (Automatic scrolling)
- ✅ 块重排 (Block rearrangement)
- ✅ 删除块 (Delete blocks)
- ✅ 自动居中 (Automatic block centering)
- ✅ 条件对齐 (Conditional snapping)
- ✅ 条件删除 (Conditional block removal)
- ✅ 导入保存文件 (Import saved files)
- ✅ 移动端支持 (Mobile support)
- ✅ 纯JavaScript (Vanilla javascript - no dependencies)
- ❌ npm安装 (npm install) - 待实现

##### API接口概览
```javascript
// 初始化
flowy(canvas, ongrab, onrelease, onsnap, onrearrange, spacing_x, spacing_y);

// 主要方法
flowy.output();        // 获取流程图数据
flowy.import(data);    // 导入流程图数据
flowy.deleteBlocks();  // 删除所有块
```

##### 数据结构
```json
{
  "html": "canvas的HTML内容",
  "blockarr": "内部块数组(用于导入)",
  "blocks": [
    {
      "id": "唯一标识",
      "parent": "父块ID(-1表示无父块)",
      "data": "输入数据数组",
      "attr": "属性数组"
    }
  ]
}
```

#### 🤔 疑问和思考
1. **性能考虑**: 大量块时的性能如何？
2. **扩展性**: 如何添加自定义块类型？
3. **集成方式**: 最佳的集成方案是什么？
4. **浏览器兼容**: 对老版本浏览器的支持程度？

#### 📋 下一步计划
- [ ] 完成README文档的详细阅读
- [ ] 运行docs/original-demo演示
- [ ] 分析演示代码的实现方式

---

## 🔍 代码分析笔记

### flowy.js 结构分析 (待完成)
```javascript
// 主函数结构
var flowy = function(canvas, grab, release, snapping, rearrange, spacing_x, spacing_y) {
    // 参数默认值处理
    // 兼容性处理 (Element.prototype.matches, Element.prototype.closest)
    // 核心变量初始化
    // 事件监听器设置
    // 方法定义 (import, output, deleteBlocks)
}
```

### CSS样式分析 (待完成)
- 拖拽状态样式
- 指示器样式
- 箭头连接样式
- 动画效果

---

## 💡 最佳实践和技巧

### 开发环境设置
- 使用现代浏览器的开发者工具
- 设置断点调试拖拽逻辑
- 使用console.log跟踪数据流

### 学习方法
- 先理解整体架构，再深入细节
- 通过修改演示代码验证理解
- 记录每个函数的作用和参数

---

## 🐛 问题和解决方案

### 已解决问题
1. **项目结构混乱** - 重新组织了目录结构
2. **缺少任务管理** - 创建了Scrum Backlog

### 待解决问题
- 暂无

---

## 📊 学习进度跟踪

### Sprint 1 进度
- [x] 项目重组 (100%)
- [/] US-001: 研读文档 (50%)
- [ ] US-002: 运行演示 (0%)
- [ ] US-003: 分析结构 (0%)
- [ ] US-004: 搭建环境 (0%)

### 知识掌握程度
- **基础概念**: ⭐⭐⭐⚪⚪ (60%)
- **API使用**: ⭐⭐⚪⚪⚪ (40%)
- **代码实现**: ⭐⚪⚪⚪⚪ (20%)
- **扩展开发**: ⚪⚪⚪⚪⚪ (0%)

---

*学习者: Frank Sun*
*最后更新: 2025-08-04 13:30*
