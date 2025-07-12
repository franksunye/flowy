# Flowy Demo 目录说明

## 📁 文件结构

### 🎯 核心 Demo 文件
- **`index.html`** - 主要的 Flowy 演示页面
- **`main.js`** - Demo 的主要 JavaScript 逻辑
- **`styles.css`** - Demo 页面样式
- **`flowy.min.css`** - Flowy 库的样式文件
- **`flowy.min.js`** - Flowy 库的 JavaScript 文件（UMD 构建）
- **`assets/`** - 图标和资源文件目录

### 🔧 基础测试文件
- **`simple-check.html`** - 最基础的功能验证测试
- **`minimal-test.html`** - 详细的 API 和功能测试

## 🚀 使用指南

### 1. 基础功能验证
访问 `simple-check.html` 进行最基础的测试：
- 验证 `window.Flowy` 是否存在
- 验证是否能创建 Flowy 实例
- 快速检查库是否正常加载

### 2. 详细 API 测试
访问 `minimal-test.html` 进行详细测试：
- 测试所有导出的 API
- 验证现代 API (`window.Flowy.Flowy`)
- 验证默认导出 (`window.Flowy.default`)
- 验证传统 API (`window.Flowy.flowy`)
- 显示所有可用的方法和属性

### 3. 完整 Demo 体验
访问 `index.html` 体验完整的 Flowy 演示：
- 拖拽创建流程图
- 连接节点
- 保存和加载流程图

## 🔧 调试步骤

### 步骤 1: 基础验证
```bash
# 启动本地服务器
python3 -m http.server 8080

# 访问基础测试
http://localhost:8080/docs/demo/simple-check.html
```

**预期结果:**
- ✅ SUCCESS: window.Flowy exists!
- ✅ window.Flowy.Flowy is available
- ✅ Successfully created Flowy instance!

### 步骤 2: 详细测试
```bash
# 访问详细测试
http://localhost:8080/docs/demo/minimal-test.html
```

**预期结果:**
- `typeof window.Flowy: object`
- 显示所有导出的模块和函数
- 成功创建三种不同方式的实例

### 步骤 3: Demo 调试
```bash
# 访问主 Demo
http://localhost:8080/docs/demo/index.html
```

**如果 Demo 不工作，检查:**
1. 浏览器控制台是否有错误
2. `flowy.min.js` 是否正确加载
3. `main.js` 中的 API 调用是否正确

## 🛠️ 常见问题排查

### 问题 1: `window.Flowy is undefined`
**解决方案:**
1. 确认 `flowy.min.js` 文件存在且正确
2. 检查文件是否是最新的 UMD 构建
3. 查看浏览器控制台是否有加载错误

### 问题 2: 无法创建 Flowy 实例
**解决方案:**
1. 确认使用正确的 API: `new window.Flowy.Flowy(canvas)`
2. 确认 canvas 元素存在
3. 检查是否有 JavaScript 错误

### 问题 3: Demo 页面不工作
**解决方案:**
1. 先运行基础测试确认库正常
2. 检查 `main.js` 中的 API 调用
3. 确认所有资源文件都正确加载

## 📝 API 使用示例

### 现代 API (推荐)
```javascript
const canvas = document.getElementById('canvas');
const flowy = new window.Flowy.Flowy(canvas, {
    spacing: { x: 20, y: 80 },
    onGrab: (block) => console.log('Grabbed:', block),
    onRelease: () => console.log('Released'),
    onSnap: (block, first, parent) => {
        console.log('Snapped:', block);
        return true; // 允许连接
    }
});
```

### 传统 API (向后兼容)
```javascript
const canvas = document.getElementById('canvas');
const flowy = window.Flowy.flowy(
    canvas,
    drag,     // onGrab 回调
    release,  // onRelease 回调
    snapping, // onSnap 回调
    rearrange,// onRearrange 回调
    20,       // spacing X
    80        // spacing Y
);
```

## 🎯 下一步

修复 `index.html` 中的 Demo，确保：
1. 正确使用 Flowy API
2. 正确处理拖拽和连接逻辑
3. 提供良好的用户体验
