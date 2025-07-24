# 位置计算服务使用指南

## 📋 概述

位置计算服务 (`PositionCalculator`) 是 Flowy 架构解耦计划的第二个组件，负责所有与位置相关的纯函数式计算。

## 🎯 设计目标

- **纯函数式**: 所有计算函数都是纯函数，无副作用
- **可测试性**: 每个函数都可以独立测试
- **高性能**: 避免重复计算，提供缓存机制
- **可复用性**: 位置计算逻辑可以在不同场景下复用

## 🚀 基础使用

### 创建实例

```javascript
const PositionCalculator = require('./src/services/position-calculator.js');
const calculator = new PositionCalculator();
```

### 基础拖拽位置计算

```javascript
// 计算基础拖拽位置
const mouseEvent = { clientX: 150, clientY: 200 };
const dragOffset = { x: 10, y: 15 };

const position = calculator.calculateDragPosition(mouseEvent, dragOffset);
console.log(position); // { left: 140, top: 185 }
```

### 重排拖拽位置计算

```javascript
// 计算重排拖拽位置 (考虑画布偏移和滚动)
const mouseEvent = { clientX: 200, clientY: 250 };
const dragOffset = { x: 20, y: 30 };
const canvasInfo = { 
  offsetLeft: 50, 
  offsetTop: 60, 
  scrollLeft: 10, 
  scrollTop: 15 
};

const position = calculator.calculateRearrangeDragPosition(mouseEvent, dragOffset, canvasInfo);
console.log(position); // { left: 140, top: 175 }
```

## 🎮 高级位置计算

### 画布坐标转换

```javascript
// 将元素坐标转换为画布坐标
const elementPosition = { left: 100, top: 150 };
const canvasInfo = { 
  offsetLeft: 20, 
  offsetTop: 30, 
  scrollLeft: 5, 
  scrollTop: 10 
};

const canvasPosition = calculator.calculateCanvasPosition(elementPosition, canvasInfo);
console.log(canvasPosition); // { left: 85, top: 130 }
```

### 块中心点计算

```javascript
// 计算块的中心点坐标
const blockPosition = { left: 100, top: 200 };
const blockSize = { width: 80, height: 60 };
const canvasInfo = { scrollLeft: 10, scrollTop: 20 };

const center = calculator.calculateBlockCenter(blockPosition, blockSize, canvasInfo);
console.log(center); // { x: 150, y: 250 }
```

## 🧲 吸附位置计算

### 基础吸附计算

```javascript
// 计算块吸附到目标块的位置
const targetBlock = { x: 200, y: 100, width: 100, height: 50 };
const dragBlock = { width: 80, height: 40 };
const childBlocks = [
  { width: 60, height: 30 }
];
const spacing = { x: 20, y: 80 };
const canvasInfo = { offsetLeft: 10, offsetTop: 20, scrollLeft: 5, scrollTop: 10 };

const snapPosition = calculator.calculateSnapPosition(
  targetBlock, 
  dragBlock, 
  childBlocks, 
  spacing, 
  canvasInfo
);

console.log(snapPosition);
// {
//   left: 280,
//   top: 195,
//   snapX: 285,
//   snapY: 205,
//   totalWidth: 160,
//   childIndex: 1
// }
```

## 📐 布局位置计算

### 子块布局计算

```javascript
// 计算子块的水平布局位置
const parentBlock = { x: 200, y: 100, width: 100, height: 50 };
const childBlocks = [
  { id: 1, width: 60, height: 30 },
  { id: 2, width: 80, height: 40 },
  { id: 3, width: 70, height: 35 }
];
const spacing = { x: 20, y: 80 };

const layout = calculator.calculateChildrenLayout(parentBlock, childBlocks, spacing);
console.log(layout);
// [
//   { id: 1, x: 105, y: 205, width: 60, height: 30 },
//   { id: 2, x: 195, y: 205, width: 80, height: 40 },
//   { id: 3, x: 290, y: 205, width: 70, height: 35 }
// ]
```

### 边界计算

```javascript
// 计算多个块的边界信息
const blocks = [
  { x: 100, y: 50, width: 80, height: 40 },
  { x: 200, y: 100, width: 60, height: 30 }
];

const bounds = calculator.calculateBlocksBounds(blocks);
console.log(bounds);
// {
//   minX: 60, maxX: 230, minY: 30, maxY: 115,
//   width: 170, height: 85
// }
```

### 偏移修正计算

```javascript
// 计算并修正块的偏移
const blocks = [
  { x: 30, y: 50, width: 80, height: 40 },
  { x: 100, y: 100, width: 60, height: 30 }
];
const canvasInfo = { offsetLeft: 50 };
const minOffset = 20;

const correction = calculator.calculateOffsetCorrection(blocks, canvasInfo, minOffset);
console.log(correction);
// {
//   needsCorrection: true,
//   offsetX: 80,
//   correctedBlocks: [
//     { x: 110, y: 50, width: 80, height: 40 },
//     { x: 180, y: 100, width: 60, height: 30 }
//   ]
// }
```

## 🔧 与现有代码集成

### 替换现有位置计算

```javascript
// 原始代码
const left = event.clientX - dragx;
const top = event.clientY - dragy;

// 使用位置计算服务
const position = calculator.calculateDragPosition(
  { clientX: event.clientX, clientY: event.clientY },
  { x: dragx, y: dragy }
);
const { left, top } = position;
```

### 重排位置计算集成

```javascript
// 原始代码
const left = event.clientX - dragx - canvas_div.offset().left + canvas_div.scrollLeft();
const top = event.clientY - dragy - canvas_div.offset().top + canvas_div.scrollTop();

// 使用位置计算服务
const position = calculator.calculateRearrangeDragPosition(
  { clientX: event.clientX, clientY: event.clientY },
  { x: dragx, y: dragy },
  {
    offsetLeft: canvas_div.offset().left,
    offsetTop: canvas_div.offset().top,
    scrollLeft: canvas_div.scrollLeft(),
    scrollTop: canvas_div.scrollTop()
  }
);
const { left, top } = position;
```

## ⚡ 性能优化

### 缓存机制

```javascript
// 位置计算服务内置缓存机制
const stats = calculator.getCacheStats();
console.log(stats); // { size: 0, maxSize: 100, keys: [] }

// 清除缓存
calculator.clearCache();
```

### 批量计算

```javascript
// 批量计算多个子块布局
const layouts = [];
for (const parentBlock of parentBlocks) {
  const layout = calculator.calculateChildrenLayout(
    parentBlock, 
    childBlocks, 
    spacing
  );
  layouts.push(layout);
}
```

## 🧪 测试示例

```javascript
describe('位置计算服务', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PositionCalculator();
  });

  test('应该正确计算拖拽位置', () => {
    const result = calculator.calculateDragPosition(
      { clientX: 150, clientY: 200 },
      { x: 10, y: 15 }
    );
    
    expect(result).toEqual({ left: 140, top: 185 });
  });

  test('应该正确计算吸附位置', () => {
    const result = calculator.calculateSnapPosition(
      { x: 100, y: 50, width: 80, height: 40 },
      { width: 60, height: 30 }
    );
    
    expect(result).toHaveProperty('snapX');
    expect(result).toHaveProperty('snapY');
  });
});
```

## 🔗 相关文档

- [架构文档](../10_ARCHITECTURE.md) - 完整的架构设计
- [Backlog](../00_BACKLOG.md) - 任务进展和计划
- [拖拽状态管理器](./drag-state-manager-usage.md) - 状态管理组件

## 📝 更新日志

- **2025-07-24**: 初始版本完成，包含完整的位置计算功能
- **下一步**: 1.2b-3 创建拖拽控制器

---

**作者**: Flowy Team  
**版本**: 1.0.0  
**最后更新**: 2025-07-24
