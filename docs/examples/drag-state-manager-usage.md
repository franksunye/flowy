# 拖拽状态管理器使用指南

## 📋 概述

拖拽状态管理器 (`DragStateManager`) 是 Flowy 架构解耦计划的第一个组件，负责管理所有拖拽相关的状态变量。

## 🎯 设计目标

- **单一职责**: 只负责状态管理，不包含业务逻辑
- **类型安全**: 提供明确的状态类型定义
- **可追踪性**: 支持状态变更历史记录
- **高性能**: 优化频繁的位置更新操作

## 🚀 基础使用

### 创建实例

```javascript
const DragStateManager = require('./src/core/drag-state-manager.js');
const dragStateManager = new DragStateManager();
```

### 基础状态操作

```javascript
// 获取状态
const isActive = dragStateManager.get('active');
const dragPosition = dragStateManager.getDragOffset();

// 设置单个状态
dragStateManager.set('active', true);
dragStateManager.set('dragx', 100);

// 批量设置状态
dragStateManager.setState({
  active: true,
  dragx: 100,
  dragy: 200
});
```

## 🎮 高级拖拽操作

### 开始新块拖拽

```javascript
const dragElement = $('.dragging-block');
const originalElement = $('.create-flowy');

dragStateManager.startActiveDrag(dragElement, originalElement, 50, 75);

// 检查状态
console.log(dragStateManager.isDragging()); // true
console.log(dragStateManager.isActiveDragging()); // true
console.log(dragStateManager.getCurrentDragElement()); // dragElement
```

### 开始重排操作

```javascript
const blockElement = $('.block');

dragStateManager.startRearrange(blockElement, 30, 40);

// 检查状态
console.log(dragStateManager.isRearranging()); // true
console.log(dragStateManager.isActiveDragging()); // false
```

### 更新拖拽位置

```javascript
// 频繁的位置更新（不记录历史）
dragStateManager.updateDragOffset(120, 180);

// 获取当前位置
const offset = dragStateManager.getDragOffset(); // { x: 120, y: 180 }
```

### 结束拖拽

```javascript
// 清理所有拖拽状态
dragStateManager.endDrag();

console.log(dragStateManager.isDragging()); // false
console.log(dragStateManager.getCurrentDragElement()); // null
```

## 📊 状态查询

### 拖拽状态检查

```javascript
// 检查是否正在拖拽（任何类型）
if (dragStateManager.isDragging()) {
  console.log('正在拖拽中...');
}

// 检查具体的拖拽类型
if (dragStateManager.isActiveDragging()) {
  console.log('正在拖拽新块');
} else if (dragStateManager.isRearranging()) {
  console.log('正在重排现有块');
}
```

### 获取状态摘要

```javascript
const summary = dragStateManager.getSummary();
console.log(summary);
// 输出:
// {
//   isDragging: true,
//   isActive: true,
//   isRearranging: false,
//   hasDragElement: true,
//   hasOriginalElement: true,
//   dragOffset: { x: 50, y: 75 }
// }
```

## 🔄 历史记录功能

### 状态历史追踪

```javascript
// 状态变更会自动记录历史
dragStateManager.set('active', true);
dragStateManager.set('dragx', 100);

// 查看历史记录
const history = dragStateManager.getHistory();
console.log(`历史记录数量: ${history.length}`);
```

### 状态回滚

```javascript
// 回滚到上一个状态
const success = dragStateManager.rollback();
if (success) {
  console.log('成功回滚到上一个状态');
} else {
  console.log('没有历史记录可回滚');
}
```

## 🛠️ 辅助功能

### 辅助状态管理

```javascript
// 设置辅助状态（只允许特定键）
dragStateManager.setAuxiliaryState({
  lastevent: true,
  offsetleft: 10,
  offsetleftold: 5,
  invalidKey: 'will be ignored' // 会被忽略
});
```

### 状态重置

```javascript
// 重置所有状态到初始值
dragStateManager.reset();

console.log(dragStateManager.isDragging()); // false
console.log(dragStateManager.getHistory().length); // 0
```

## 🔧 与现有代码集成

### 替换现有状态变量

```javascript
// 原始代码
let active = false;
let rearrange = false;
let drag, dragx, dragy, original;

// 使用状态管理器
const dragStateManager = new DragStateManager();

// 替换直接访问
// active = true; 
dragStateManager.set('active', true);

// if (active || rearrange)
if (dragStateManager.isDragging())
```

### 事件处理集成

```javascript
$(document).on('mousedown', '.create-flowy', function(event) {
  const original = $(this);
  const dragElement = createDragElement();
  const dragx = event.clientX - $(this).offset().left;
  const dragy = event.clientY - $(this).offset().top;
  
  // 使用状态管理器
  dragStateManager.startActiveDrag(dragElement, original, dragx, dragy);
});

$(document).on('mousemove', function(event) {
  if (dragStateManager.isDragging()) {
    const offset = dragStateManager.getDragOffset();
    const dragElement = dragStateManager.getCurrentDragElement();
    
    dragElement.css('left', event.clientX - offset.x + 'px');
    dragElement.css('top', event.clientY - offset.y + 'px');
  }
});

$(document).on('mouseup', function(event) {
  if (dragStateManager.isDragging()) {
    // 处理拖拽结束逻辑
    handleDragEnd();
    
    // 清理状态
    dragStateManager.endDrag();
  }
});
```

## 📈 性能优化

### 频繁更新优化

```javascript
// 位置更新不记录历史，提高性能
function onMouseMove(event) {
  if (dragStateManager.isDragging()) {
    const newX = event.clientX - baseOffset.x;
    const newY = event.clientY - baseOffset.y;
    
    // 高频更新，不记录历史
    dragStateManager.updateDragOffset(newX, newY);
  }
}
```

### 内存管理

```javascript
// 历史记录自动限制大小（默认10条）
// 不需要手动清理

// 获取当前内存使用情况
const historySize = dragStateManager.getHistory().length;
console.log(`当前历史记录: ${historySize}/10`);
```

## 🧪 测试示例

```javascript
describe('拖拽状态管理器', () => {
  let dragStateManager;

  beforeEach(() => {
    dragStateManager = new DragStateManager();
  });

  test('应该正确管理拖拽生命周期', () => {
    // 开始拖拽
    dragStateManager.startActiveDrag(mockElement, mockOriginal, 50, 75);
    expect(dragStateManager.isDragging()).toBe(true);
    
    // 更新位置
    dragStateManager.updateDragOffset(100, 150);
    expect(dragStateManager.getDragOffset()).toEqual({ x: 100, y: 150 });
    
    // 结束拖拽
    dragStateManager.endDrag();
    expect(dragStateManager.isDragging()).toBe(false);
  });
});
```

## 🔗 相关文档

- [架构文档](../10_ARCHITECTURE.md) - 完整的架构设计
- [Backlog](../00_BACKLOG.md) - 任务进展和计划
- [API文档](../20_API.md) - 完整的API参考

## 📝 更新日志

- **2025-07-24**: 初始版本完成，包含完整的状态管理功能
- **下一步**: 1.2b-2 创建位置计算服务

---

**作者**: Flowy Team  
**版本**: 1.0.0  
**最后更新**: 2025-07-24
