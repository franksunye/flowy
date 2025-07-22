# 代码质量工具 (Code Quality Tools)

本项目使用 ESLint 和 Prettier 来确保代码质量和一致的代码风格。

## 🛠️ 工具概述

### ESLint
- **用途**: 静态代码分析，发现代码中的问题和潜在错误
- **版本**: 9.x (使用新的配置格式)
- **配置文件**: `eslint.config.js`

### Prettier
- **用途**: 代码格式化，确保一致的代码风格
- **配置文件**: `.prettierrc.js`
- **忽略文件**: `.prettierignore`

### EditorConfig
- **用途**: 编辑器配置，确保不同编辑器的一致性
- **配置文件**: `.editorconfig`

## 📋 可用脚本

### 代码检查 (Linting)
```bash
# 检查所有文件的代码质量问题
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### 代码格式化 (Formatting)
```bash
# 格式化所有文件
npm run format

# 检查格式是否正确（不修改文件）
npm run format:check
```

### 综合质量检查
```bash
# 运行 lint 和 format:check
npm run quality

# 运行 lint:fix 和 format
npm run quality:fix
```

## ⚙️ 配置说明

### ESLint 配置特点

1. **渐进式规则**: 为了适应现有代码库，许多规则设置为 `warn` 而不是 `error`
2. **环境支持**: 支持浏览器、Node.js 和 Jest 环境
3. **全局变量**: 预定义了项目中使用的全局变量（如 jQuery、测试工具函数等）

### 当前规则级别

#### 错误级别 (Error)
- `no-debugger`: 禁止 debugger 语句
- `curly`: 要求所有控制语句使用大括号
- `no-eval`: 禁止使用 eval()
- 其他安全相关规则

#### 警告级别 (Warning)
- `no-var`: 建议使用 let/const 替代 var
- `prefer-const`: 建议使用 const 声明不会重新赋值的变量
- `eqeqeq`: 建议使用 === 替代 ==
- `radix`: 建议在 parseInt() 中指定进制

#### 已禁用 (Off)
- `prefer-arrow-callback`: 暂时禁用，适应现有代码风格
- `prefer-template`: 暂时禁用，适应现有代码风格

### Prettier 配置

```javascript
{
  semi: true,              // 使用分号
  singleQuote: true,       // 使用单引号
  tabWidth: 2,             // 缩进宽度为 2
  useTabs: false,          // 使用空格而不是制表符
  printWidth: 80,          // 行长度限制为 80 字符
  trailingComma: 'es5',    // 在 ES5 中有效的地方添加尾随逗号
  bracketSpacing: true,    // 对象字面量的大括号间添加空格
  arrowParens: 'avoid',    // 箭头函数参数只有一个时省略括号
  endOfLine: 'lf'          // 使用 LF 换行符
}
```

## 🎯 代码质量目标

### 当前状态
- **总问题数**: 213 个
- **错误**: 13 个（主要是变量重声明）
- **警告**: 200 个（代码现代化建议）

### 改进计划

1. **第一阶段**: 修复所有错误级别的问题
2. **第二阶段**: 逐步解决警告，现代化代码
3. **第三阶段**: 启用更严格的规则

## 🔧 IDE 集成

### VS Code
推荐安装以下扩展：
- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code

### 配置自动格式化
在 VS Code 设置中添加：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📝 最佳实践

### 开发工作流
1. 编写代码时，IDE 会实时显示 ESLint 警告
2. 保存文件时，Prettier 自动格式化代码
3. 提交前运行 `npm run quality` 检查代码质量
4. 使用 `npm run quality:fix` 自动修复问题

### 代码审查
- 所有 PR 都应该通过 ESLint 检查
- 代码格式应该符合 Prettier 规范
- 逐步减少警告数量

### 规则调整
- 随着代码库的现代化，可以逐步将警告升级为错误
- 新功能应该遵循更严格的代码标准
- 定期审查和更新 ESLint 规则

## 🚀 未来改进

1. **集成到 CI/CD**: 在 GitHub Actions 中添加代码质量检查
2. **代码覆盖率**: 结合测试覆盖率报告
3. **性能检查**: 添加性能相关的 ESLint 规则
4. **TypeScript**: 为 TypeScript 迁移准备相应的规则

---

**最后更新**: 2025-07-21  
**维护者**: Flowy 开发团队
