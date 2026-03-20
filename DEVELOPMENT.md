# Multi-Table 开发计划

## 项目愿景

打造一个功能强大、高性能、可扩展的多维表格组件库，支持 React 和 Vue 3，提供类似 Notion/AirTable 的表格体验。

**核心设计理念**：前端组件库与后端服务解耦，通过适配器模式实现灵活集成。

---

## 功能模块划分

### 前端组件功能（无需后端）

| 功能 | 说明 | 是否需要后端 |
|------|------|-------------|
| 表格渲染 | 多视图表格展示 | ❌ |
| 字段类型系统 | 内置类型 + 自定义插件 | ❌ |
| 虚拟滚动 | 大数据量优化渲染 | ❌ |
| 排序/筛选/分组 | 数据操作 | ❌ |
| 单元格编辑 | 本地编辑 | ❌ |
| 撤销/重做 | 操作历史 | ❌ |
| 导入/导出 | CSV、Excel、JSON | ❌ |
| 本地存储 | localStorage / IndexedDB | ❌ |
| 主题定制 | 样式系统 | ❌ |

### 后端服务功能（可选）

| 功能 | 说明 | 是否需要后端 |
|------|------|-------------|
| 数据持久化 | 云端存储 | ✅ |
| 协同编辑 | 多人实时协作 | ✅ |
| 用户认证 | 登录/权限管理 | ✅ |
| 文件存储 | 附件/图片上传 | ✅ |
| 版本历史 | 数据快照与恢复 | ✅ |

---

## 运行模式

### 模式一：纯前端模式

```tsx
// 无需任何后端，数据存储在本地
<MultiTable
  columns={columns}
  data={data}
  storage="local"  // 使用 localStorage
  onChange={(newData) => {
    // 自行处理数据，如保存到本地
  }}
/>
```

**适用场景**：
- 个人项目
- 内部工具
- 原型开发
- 对数据持久化要求不高的场景

### 模式二：自定义后端模式

```tsx
// 通过适配器对接自己的后端
<MultiTable
  columns={columns}
  data={data}
  storageAdapter={myCustomAdapter}
/>
```

**适用场景**：
- 企业内部系统
- 已有后端服务
- 需要完全控制数据

### 模式三：官方后端服务模式

```tsx
// 使用官方提供的后端服务
<MultiTable
  columns={columns}
  data={data}
  storageAdapter={createOfficialAdapter({
    endpoint: 'https://api.multi-table.com',
    apiKey: 'your-api-key',
  })}
  collaboration={{
    enabled: true,
    showCursors: true,
  }}
/>
```

**适用场景**：
- 快速上线
- SaaS 产品
- 需要协同功能

---

## 存储适配器设计

### 适配器接口

```typescript
/**
 * 存储适配器接口
 * 实现此接口可对接任意后端服务
 */
interface StorageAdapter {
  // ========== 数据操作 ==========

  /** 获取表格数据 */
  getData(tableId: string): Promise<TableData>

  /** 保存表格数据 */
  saveData(tableId: string, data: TableData): Promise<void>

  /** 监听数据变更 */
  onDataChange(tableId: string, callback: (data: TableData) => void): () => void

  // ========== 协同编辑（可选实现）==========

  /** 连接协同房间 */
  connectRoom?(tableId: string, userId: string): Promise<RoomConnection>

  /** 断开连接 */
  disconnectRoom?(): void

  /** 发送操作 */
  sendOperation?(operation: Operation): void

  /** 监听远程操作 */
  onRemoteOperation?(callback: (op: Operation) => void): () => void

  /** 监听用户加入 */
  onUserJoin?(callback: (user: User) => void): () => void

  /** 监听用户离开 */
  onUserLeave?(callback: (userId: string) => void): () => void

  // ========== 文件操作（可选实现）==========

  /** 上传文件 */
  uploadFile?(file: File): Promise<FileInfo>

  /** 删除文件 */
  deleteFile?(fileId: string): Promise<void>

  /** 获取文件 URL */
  getFileUrl?(fileId: string): string

  // ========== 用户相关（可选实现）==========

  /** 获取当前用户 */
  getCurrentUser?(): Promise<User | null>

  /** 搜索用户（用于 @提及 等） */
  searchUsers?(query: string): Promise<User[]>
}

// 类型定义
interface TableData {
  id: string
  name: string
  columns: Column[]
  rows: Row[]
  views: View[]
}

interface RoomConnection {
  id: string
  users: User[]
  cursors: Map<string, CursorPosition>
}

interface User {
  id: string
  name: string
  avatar?: string
  color?: string
}

interface CursorPosition {
  userId: string
  row: number
  column: number
}

interface FileInfo {
  id: string
  name: string
  url: string
  size: number
  type: string
}
```

### 适配器示例

#### LocalStorage 适配器（内置）

```typescript
const localStorageAdapter: StorageAdapter = {
  async getData(tableId) {
    const data = localStorage.getItem(`multi-table-${tableId}`)
    return data ? JSON.parse(data) : null
  },

  async saveData(tableId, data) {
    localStorage.setItem(`multi-table-${tableId}`, JSON.stringify(data))
  },

  onDataChange(tableId, callback) {
    const handler = (e: StorageEvent) => {
      if (e.key === `multi-table-${tableId}` && e.newValue) {
        callback(JSON.parse(e.newValue))
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  },
}
```

#### REST API 适配器

```typescript
const createRestAdapter = (baseUrl: string): StorageAdapter => ({
  async getData(tableId) {
    const res = await fetch(`${baseUrl}/tables/${tableId}`)
    return res.json()
  },

  async saveData(tableId, data) {
    await fetch(`${baseUrl}/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  onDataChange(tableId, callback) {
    // 轮询或 Server-Sent Events
    const eventSource = new EventSource(`${baseUrl}/tables/${tableId}/stream`)
    eventSource.onmessage = (e) => callback(JSON.parse(e.data))
    return () => eventSource.close()
  },

  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${baseUrl}/files`, { method: 'POST', body: formData })
    return res.json()
  },

  getFileUrl(fileId) {
    return `${baseUrl}/files/${fileId}`
  },
})
```

#### WebSocket 协同适配器

```typescript
const createWebSocketAdapter = (wsUrl: string): StorageAdapter => {
  let ws: WebSocket | null = null
  const listeners = new Map<string, Set<Function>>()

  return {
    async getData(tableId) {
      const res = await fetch(`${httpUrl}/tables/${tableId}`)
      return res.json()
    },

    async saveData(tableId, data) {
      await fetch(`${httpUrl}/tables/${tableId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    async connectRoom(tableId, userId) {
      ws = new WebSocket(`${wsUrl}/rooms/${tableId}?userId=${userId}`)

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const callbacks = listeners.get(message.type) || new Set()
        callbacks.forEach(cb => cb(message.data))
      }

      return new Promise((resolve) => {
        ws!.onopen = () => {
          resolve({ id: tableId, users: [], cursors: new Map() })
        }
      })
    },

    disconnectRoom() {
      ws?.close()
      ws = null
    },

    sendOperation(operation) {
      ws?.send(JSON.stringify({ type: 'operation', data: operation }))
    },

    onRemoteOperation(callback) {
      const key = 'operation'
      listeners.has(key) || listeners.set(key, new Set())
      listeners.get(key)!.add(callback)
      return () => listeners.get(key)?.delete(callback)
    },

    onUserJoin(callback) {
      const key = 'user-join'
      listeners.has(key) || listeners.set(key, new Set())
      listeners.get(key)!.add(callback)
      return () => listeners.get(key)?.delete(callback)
    },

    onUserLeave(callback) {
      const key = 'user-leave'
      listeners.has(key) || listeners.set(key, new Set())
      listeners.get(key)!.add(callback)
      return () => listeners.get(key)?.delete(callback)
    },
  }
}
```

#### Firebase 适配器

```typescript
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'

const createFirebaseAdapter = (config: FirebaseOptions): StorageAdapter => {
  const app = initializeApp(config)
  const db = getDatabase(app)

  return {
    async getData(tableId) {
      const snapshot = await get(ref(db, `tables/${tableId}`))
      return snapshot.val()
    },

    async saveData(tableId, data) {
      await set(ref(db, `tables/${tableId}`), data)
    },

    onDataChange(tableId, callback) {
      const tableRef = ref(db, `tables/${tableId}`)
      const unsubscribe = onValue(tableRef, (snapshot) => {
        callback(snapshot.val())
      })
      return unsubscribe
    },

    // Firebase Realtime Database 自带协同能力
    // 无需额外实现 WebSocket
  }
}
```

---

## 后端服务设计（可选模块）

> 以下为官方后端服务的架构设计，用户可选择使用或自行实现适配器对接自己的后端。

### 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Vue)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   StorageAdapter                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / WebSocket
┌─────────────────────────────▼───────────────────────────────┐
│                       API Gateway                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Auth    │  │  Rate    │  │  Router  │  │  Load    │    │
│  │  Filter  │  │  Limiter │  │          │  │  Balancer│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Table Service │    │  Collab Service│    │  File Service │
│  ┌───────────┐ │    │  ┌───────────┐ │    │  ┌───────────┐ │
│  │  CRUD     │ │    │  │WebSocket  │ │    │  │  Upload   │ │
│  │  Query    │ │    │  │  OT/CRDT  │ │    │  │  Storage  │ │
│  └───────────┘ │    │  └───────────┘ │    │  └───────────┘ │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │    Database    │
                    │  (PostgreSQL)  │
                    └────────────────┘
```

### 服务模块

#### Table Service - 表格数据服务

```yaml
职责:
  - 表格 CRUD 操作
  - 数据查询与筛选
  - 版本历史管理

技术栈:
  - Node.js / NestJS
  - PostgreSQL + Prisma
  - Redis (缓存)

API 设计:
  GET    /tables/:id           # 获取表格
  POST   /tables               # 创建表格
  PUT    /tables/:id           # 更新表格
  DELETE /tables/:id           # 删除表格
  GET    /tables/:id/history   # 获取历史版本
  POST   /tables/:id/restore   # 恢复到指定版本
```

#### Collab Service - 协同编辑服务

```yaml
职责:
  - WebSocket 连接管理
  - 操作同步与广播
  - 冲突解决 (OT/CRDT)

技术栈:
  - Node.js + ws / uWebSockets.js
  - Yjs / ShareDB
  - Redis Pub/Sub

协议:
  # 连接
  WebSocket: /collab/:tableId?userId=xxx

  # 消息类型
  - join: 加入房间
  - leave: 离开房间
  - operation: 操作同步
  - cursor: 光标位置
  - presence: 用户状态
```

#### File Service - 文件存储服务

```yaml
职责:
  - 文件上传/下载
  - 图片处理
  - 文件权限管理

技术栈:
  - S3 / MinIO / 阿里云 OSS
  - Sharp (图片处理)

API 设计:
  POST   /files              # 上传文件
  GET    /files/:id          # 下载文件
  DELETE /files/:id          # 删除文件
  POST   /files/:id/resize   # 图片裁剪
```

### 数据模型

```sql
-- 表格
CREATE TABLE tables (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL,
  columns JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 行数据
CREATE TABLE rows (
  id UUID PRIMARY KEY,
  table_id UUID REFERENCES tables(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 版本历史
CREATE TABLE versions (
  id UUID PRIMARY KEY,
  table_id UUID REFERENCES tables(id),
  snapshot JSONB NOT NULL,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 前端核心功能

### 1. 多种视图类型

| 视图类型 | 说明 | 优先级 | 需要后端 |
|---------|------|--------|---------|
| 表格视图 | 核心视图，支持排序、筛选、分组 | P0 | ❌ |
| 看板视图 | 按状态分组展示，支持拖拽 | P1 | ❌ |
| 甘特图视图 | 时间线展示，项目进度管理 | P2 | ❌ |
| 日历视图 | 按日期展示数据 | P2 | ❌ |
| 画廊视图 | 卡片式展示，适合图片内容 | P3 | ❌ |

### 2. 字段类型系统

#### 内置字段类型

| 类型 | 说明 | 编辑器 | 需要后端 |
|------|------|--------|---------|
| text | 单行文本 | 输入框 | ❌ |
| textarea | 多行文本 | 文本域 | ❌ |
| number | 数字 | 数字输入框 | ❌ |
| select | 单选 | 下拉选择器 | ❌ |
| multiSelect | 多选 | 标签选择器 | ❌ |
| date | 日期 | 日期选择器 | ❌ |
| dateTime | 日期时间 | 日期时间选择器 | ❌ |
| checkbox | 复选框 | 开关/复选框 | ❌ |
| url | 链接 | URL 输入框 | ❌ |
| email | 邮箱 | 邮箱输入框 | ❌ |
| phone | 电话 | 电话输入框 | ❌ |
| file | 文件附件 | 文件上传器 | ✅ |
| image | 图片 | 图片上传器 | ✅ |
| user | 用户关联 | 用户选择器 | ✅ |
| relation | 关联字段 | 关联选择器 | ❌ |
| formula | 公式计算 | 公式编辑器 | ❌ |
| autoNumber | 自动编号 | 自动生成 | ❌ |
| createdTime | 创建时间 | 自动生成 | ❌ |
| updatedTime | 更新时间 | 自动生成 | ❌ |
| createdBy | 创建人 | 自动生成 | ✅ |
| updatedBy | 更新人 | 自动生成 | ✅ |

#### 插件机制

```typescript
interface FieldTypePlugin {
  type: string                    // 字段类型标识
  name: string                    // 显示名称
  icon?: string                   // 图标
  defaultValue: any               // 默认值
  validate: (value: any) => boolean  // 值验证
  render: (props: CellRenderProps) => VNode  // 渲染函数
  renderEditor: (props: EditorProps) => VNode // 编辑器渲染
  parse: (value: any) => any      // 值解析
  stringify: (value: any) => string // 值序列化
}

// 注册插件示例
registerFieldType({
  type: 'rating',
  name: '评分',
  icon: '⭐',
  defaultValue: 0,
  validate: (value) => typeof value === 'number' && value >= 0 && value <= 5,
  render: ({ value }) => <Rating value={value} />,
})
```

### 3. 大数据优化 - 虚拟滚动

```
+------------------+
|    可见区域      |  ← 只渲染可见行
+------------------+
|                  |
|   虚拟滚动缓冲区  |  ← 上下预渲染缓冲
|                  |
+------------------+
|     占位区域     |  ← 不渲染，仅占位
+------------------+
```

**性能目标**：
- 支持 100,000+ 行数据流畅滚动
- 滚动帧率保持 60fps
- 内存占用优化（按需加载）

**技术方案**：
- 虚拟列表（基于 @tanstack/virtual 或自研）
- 列虚拟化（宽表格场景）
- 分块渲染与懒加载
- Web Worker 数据处理

### 4. 协同编辑（需要后端）

```
┌─────────────────────────────────────────────────┐
│                   客户端 A                        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ Local   │───▶│  OT/CRDT│───▶│  Sync   │     │
│  │ Changes │    │ Engine  │    │ Manager │     │
│  └─────────┘    └─────────┘    └────┬────┘     │
└─────────────────────────────────────┼───────────┘
                                      │
                                      ▼ WebSocket
                              ┌───────────────┐
                              │ Collaboration │
                              │    Server     │
                              └───────────────┘
                                      │
                                      ▼ WebSocket
┌─────────────────────────────────────┼───────────┐
│                   客户端 B           │           │
│  ┌─────────┐    ┌─────────┐    ┌────┴────┐     │
│  │ Remote  │◀───│  OT/CRDT│◀───│  Sync   │     │
│  │ Changes │    │ Engine  │    │ Manager │     │
│  └─────────┘    └─────────┘    └─────────┘     │
└─────────────────────────────────────────────────┘
```

**核心功能**：
- 实时同步：WebSocket 双向通信
- 冲突解决：OT 或 CRDT
- 光标同步：显示其他用户光标位置
- 在线状态：显示当前在线用户
- 操作广播：实时推送变更

---

## 架构设计

### 前端分层架构

```
┌────────────────────────────────────────────────────────┐
│                    UI Layer (React/Vue)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TableView   │  │  KanbanView  │  │  OtherViews  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├────────────────────────────────────────────────────────┤
│                    Component Layer                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Header │ │  Body  │ │ Footer │ │ Editor │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
├────────────────────────────────────────────────────────┤
│                    Core Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │VirtualSc │ │FieldTypes│ │Selection │ │Clipboard │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │RowManager│ │ColManager│ │DataManager│ │ History │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├────────────────────────────────────────────────────────┤
│                    Plugin Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │FieldType │ │ View     │ │ Adapter  │               │
│  │ Plugins  │ │ Plugins  │ │ Plugins │               │
│  └──────────┘ └──────────┘ └──────────┘               │
├────────────────────────────────────────────────────────┤
│                 Adapter Layer (可选)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Storage   │ │ Collab   │ │  File    │               │
│  │ Adapter  │ │ Adapter  │ │ Adapter  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└────────────────────────────────────────────────────────┘
```

### 包结构

```
packages/
├── core/                    # React 组件库
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   ├── views/           # 视图组件
│   │   ├── fields/          # 内置字段类型
│   │   ├── editors/         # 编辑器组件
│   │   └── index.ts
│   └── package.json
│
├── vue/                     # Vue 组件库
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── fields/
│   │   ├── editors/
│   │   └── index.ts
│   └── package.json
│
├── shared/                  # 共享逻辑
│   ├── src/
│   │   ├── core/            # 核心逻辑（框架无关）
│   │   │   ├── VirtualScroll.ts
│   │   │   ├── Selection.ts
│   │   │   ├── History.ts
│   │   │   └── PluginManager.ts
│   │   ├── data/            # 数据处理
│   │   │   ├── TableData.ts
│   │   │   ├── RowManager.ts
│   │   │   └── ColumnManager.ts
│   │   ├── adapters/        # 内置适配器
│   │   │   ├── localStorage.ts
│   │   │   ├── indexedDB.ts
│   │   │   └── types.ts
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   └── index.ts
│   └── package.json
│
├── plugins/                 # 官方插件
│   ├── field-rating/        # 评分字段插件
│   ├── field-progress/      # 进度条字段插件
│   └── view-gantt/          # 甘特图视图插件
│
├── server/                  # 官方后端服务（可选）
│   ├── packages/
│   │   ├── api/             # REST API
│   │   ├── collab/          # 协同服务
│   │   └── file/            # 文件服务
│   └── package.json
│
└── docs/                    # 文档站点
```

---

## 开发路线图

### Phase 1: 基础表格 (Week 1-3) - 纯前端

- [ ] 数据模型设计
- [ ] 基础表格渲染
- [ ] 基本字段类型（text, number, select, date, checkbox）
- [ ] 单元格选择与导航
- [ ] 单元格编辑
- [ ] 行列操作（新增、删除）

### Phase 2: 性能优化 (Week 4-5) - 纯前端

- [ ] 虚拟滚动实现
- [ ] 列虚拟化
- [ ] 渲染性能优化
- [ ] 内存优化

### Phase 3: 高级功能 (Week 6-8) - 纯前端

- [ ] 排序功能
- [ ] 筛选功能
- [ ] 分组功能
- [ ] 搜索功能
- [ ] 更多字段类型
- [ ] 插件机制
- [ ] 本地存储适配器

### Phase 4: 后端服务 (Week 9-12) - 可选

- [ ] 后端架构设计
- [ ] REST API 服务
- [ ] 数据库设计与迁移
- [ ] 文件存储服务
- [ ] 用户认证服务

### Phase 5: 协同编辑 (Week 13-16) - 可选

- [ ] WebSocket 服务
- [ ] OT/CRDT 实现
- [ ] 操作同步
- [ ] 光标同步
- [ ] 冲突解决

### Phase 6: 扩展视图 (Week 17-19) - 纯前端

- [ ] 看板视图
- [ ] 视图切换机制
- [ ] 视图状态持久化

### Phase 7: 完善 (Week 20+)

- [ ] 导入/导出
- [ ] 快捷键
- [ ] 主题系统
- [ ] 无障碍支持
- [ ] 文档完善

---

## API 设计草案

### 基础使用（纯前端）

```tsx
import { MultiTable } from '@multi-table/core'
import '@multi-table/core/style.css'

const columns = [
  { key: 'name', type: 'text', title: '姓名', width: 150 },
  { key: 'age', type: 'number', title: '年龄', width: 100 },
  { key: 'status', type: 'select', title: '状态', options: ['待办', '进行中', '已完成'] },
  { key: 'dueDate', type: 'date', title: '截止日期' },
]

const data = [
  { id: '1', name: '任务A', age: 1, status: '待办', dueDate: '2026-04-01' },
  { id: '2', name: '任务B', age: 2, status: '进行中', dueDate: '2026-04-15' },
]

function App() {
  return (
    <MultiTable
      columns={columns}
      data={data}
      onChange={(newData, changes) => console.log(newData, changes)}
    />
  )
}
```

### 本地存储模式

```tsx
<MultiTable
  columns={columns}
  data={data}
  storage="local"
  storageKey="my-table-data"
/>
```

### 自定义后端模式

```tsx
<MultiTable
  columns={columns}
  storageAdapter={myRestAdapter}
/>
```

### 协同编辑模式

```tsx
<MultiTable
  columns={columns}
  storageAdapter={collabAdapter}
  collaboration={{
    enabled: true,
    showCursors: true,
    showPresence: true,
  }}
/>
```

### 插件注册

```tsx
import { registerFieldType } from '@multi-table/core'

registerFieldType({
  type: 'rating',
  name: '评分',
  icon: '⭐',
  defaultValue: 0,
  validate: (value) => typeof value === 'number' && value >= 0 && value <= 5,
  render: ({ value, onChange }) => (
    <Rating value={value} max={5} onChange={onChange} />
  ),
})
```

### 虚拟滚动配置

```tsx
<MultiTable
  columns={columns}
  data={largeDataset}
  virtualScroll={{
    enabled: true,
    rowHeight: 40,
    overscan: 5,
    columnOverscan: 2,
  }}
/>
```

---

## 技术选型

### 前端

| 领域 | 技术选型 | 说明 |
|------|---------|------|
| 构建工具 | tsdown | 基于 Rolldown，快速构建 |
| React | React 19 | 支持 Concurrent 特性 |
| Vue | Vue 3.5+ | Composition API |
| 虚拟滚动 | 自研 / @tanstack/virtual | 需要评估 |
| 状态管理 | Zustand (React) / Pinia (Vue) | 轻量级状态管理 |
| 样式方案 | CSS Modules / Tailwind | 待定 |
| 测试 | Vitest | 单元测试 |
| 文档 | VitePress | 文档站点 |

### 后端（可选）

| 领域 | 技术选型 | 说明 |
|------|---------|------|
| 运行时 | Node.js | 与前端技术栈统一 |
| 框架 | NestJS / Fastify | 企业级框架 |
| 数据库 | PostgreSQL | 关系型数据库 |
| ORM | Prisma | 类型安全 |
| 缓存 | Redis | 缓存 + Pub/Sub |
| 协同 | Yjs + Hocuspocus | 开源协同方案 |
| 文件存储 | S3 / MinIO | 对象存储 |

---

## 性能指标

| 指标 | 目标值 |
|------|--------|
| 首次渲染 (1000行) | < 100ms |
| 滚动帧率 | ≥ 60fps |
| 编辑响应 | < 16ms |
| 内存占用 (10000行) | < 50MB |
| 打包体积 (gzip) | < 50KB (核心) |

---

## 参考项目

- [AG Grid](https://www.ag-grid.com/) - 功能最全的表格库
- [TanStack Table](https://tanstack.com/table) - 无样式表格核心
- [Notion](https://www.notion.so/) - 产品设计参考
- [AirTable](https://airtable.com/) - 多维表格概念
- [Yjs](https://yjs.dev/) - CRDT 协同框架
- [Hocuspocus](https://tiptap.dev/hocuspocus) - 协同服务器