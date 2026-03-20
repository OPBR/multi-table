# Multi-Table

一个强大的多维表格组件，支持 React 和 Vue 3。

## 特性

- 🚀 基于 React 19 / Vue 3 + TypeScript 开发
- 📦 支持多维数据展示
- 🎨 高度可定制
- 📱 响应式设计
- 🔧 框架无关的共享逻辑

## 安装

### React

```bash
# npm
npm install @multi-table/core

# yarn
yarn add @multi-table/core

# pnpm
pnpm add @multi-table/core
```

### Vue 3

```bash
# npm
npm install @multi-table/vue

# yarn
yarn add @multi-table/vue

# pnpm
pnpm add @multi-table/vue
```

## 快速开始

### React

```tsx
import { MultiTable } from '@multi-table/core'

const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'London' },
]

function App() {
  return <MultiTable data={data} />
}
```

### Vue 3

```vue
<script setup lang="ts">
import { MultiTable } from '@multi-table/vue'

const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'London' },
]
</script>

<template>
  <MultiTable :data="data" />
</template>

<style>
/* 可选：引入组件样式 */
import '@multi-table/vue/style.css'
</style>
```

## 开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 启动开发环境
pnpm dev

# 构建所有包
pnpm build

# 构建单个包
pnpm build:core     # React 组件
pnpm build:vue      # Vue 组件
pnpm build:shared   # 共享逻辑

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 项目结构

```
multi-table/
├── packages/
│   ├── core/          # React 组件库
│   ├── vue/           # Vue 3 组件库
│   ├── shared/        # 共享逻辑和类型
│   └── docs/          # 文档站点
├── pnpm-workspace.yaml
└── package.json
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `Record<string, unknown>[]` | `[]` | 表格数据 |
| columns | `string[]` | - | 自定义列（可选，默认从数据中提取） |
| bordered | `boolean` | `false` | 是否显示边框 |
| striped | `boolean` | `false` | 是否显示斑马纹 |
| hoverable | `boolean` | `true` | 是否显示悬停效果 |

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链变更

## License

[MIT](LICENSE) © 2026 OPBR Contributors