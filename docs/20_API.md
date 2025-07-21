# 20_API.md - Flowy API 文档

## 📚 API 参考

*此文档将在后续开发中逐步完善*

### API 概览
Flowy 提供简洁的JavaScript API用于创建交互式流程图。

## 🚀 快速开始

### 基本用法
```javascript
// 初始化Flowy
flowy(canvas, grab, release, snapping, spacing_x, spacing_y);

// 获取工作流数据
const data = flowy.output();

// 清理所有块
flowy.deleteBlocks();
```

## 📖 API 详细说明

### 初始化函数

#### `flowy(canvas, grab, release, snapping, spacing_x, spacing_y)`
初始化Flowy实例

**参数**:
- `canvas` (Element|jQuery): 画布元素
- `grab` (Function): 拖拽开始回调
- `release` (Function): 拖拽结束回调  
- `snapping` (Function): 吸附回调
- `spacing_x` (Number): 水平间距 (默认: 20)
- `spacing_y` (Number): 垂直间距 (默认: 80)

### 实例方法

#### `flowy.output()`
获取当前工作流的JSON数据

**返回值**: `Array|undefined`
- 成功: 包含所有块信息的数组
- 空画布: `undefined`

#### `flowy.deleteBlocks()`
删除画布上的所有块

**返回值**: `void`

## 🔧 回调函数

### grab(block)
当用户开始拖拽块时触发

**参数**:
- `block` (Element): 被拖拽的块元素

### release()
当用户释放拖拽的块时触发

### snapping(drag, first)
当块吸附到其他块时触发

**参数**:
- `drag` (Element): 被拖拽的块
- `first` (Element): 目标块

## 📋 数据格式

### 输出数据结构
```javascript
[
  {
    "id": 1,
    "parent": 0,
    "data": [
      {
        "name": "fieldName",
        "value": "fieldValue"
      }
    ]
  }
]
```

## 🎯 使用示例

### 完整示例
```javascript
// 获取画布元素
const canvas = document.getElementById('canvas');

// 定义回调函数
function grab(block) {
  console.log('开始拖拽:', block);
}

function release() {
  console.log('结束拖拽');
}

function snapping(drag, first) {
  console.log('块吸附:', drag, '到', first);
}

// 初始化Flowy
flowy(canvas, grab, release, snapping, 40, 100);

// 获取数据
const workflowData = flowy.output();
console.log('工作流数据:', workflowData);
```

---

**状态**: 基础版本  
**负责人**: API团队  
**最后更新**: 2025-07-18
