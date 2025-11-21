# Kamiya 花卉商城

一个基于 Vue 3 的现代化花卉/蛋糕电商平台，提供完整的商品展示、购物车、订单管理等核心功能。

## 📚 文档

- [技术文档](./TECHNICAL_DOCS.md) - 技术栈、项目结构、开发指南
- [功能文档](./FEATURE_DOCS.md) - 功能说明、使用指南、数据模型

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 启动前端开发服务器（端口 5173）
npm run dev

# 启动 JSON Server（端口 3001）
npm run start

# 同时启动前端和后端
npm run dev:all
```

### 构建生产版本

```bash
npm run build
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 官方状态管理库
- **Element Plus** - 基于 Vue 3 的组件库
- **Axios** - HTTP 客户端
- **JSON Server** - Mock 后端服务器

## ✨ 主要功能

### 用户端

- 🏠 首页展示（轮播图、商品分类）
- 🛍️ 商品浏览和筛选（搜索、价格、类别）
- 🛒 购物车管理
- 📦 订单创建和管理
- 👤 用户注册和登录
- ℹ️ 关于我们页面

### 管理后台

- 📊 数据仪表盘
- 📦 商品管理
- 📋 订单管理
- 👥 用户管理
- ⚙️ 系统设置

## 📁 项目结构

```
Kamiya/
├── src/
│   ├── views/          # 页面组件
│   ├── data_stores/    # Pinia 状态管理
│   ├── layout/         # 布局组件
│   ├── router/          # 路由配置
│   └── assets/          # 静态资源
├── db.json             # JSON Server 数据文件
└── public/             # 公共资源
```

## 🔑 默认账号

### 管理员

- 用户名：`admin`
- 密码：`000000`

### 普通用户

- 用户名：`user1`
- 密码：`000000`

## 📝 开发说明

详细的技术文档和功能文档请查看：

- [技术文档](./TECHNICAL_DOCS.md)
- [功能文档](./FEATURE_DOCS.md)

## 📄 License

MIT
