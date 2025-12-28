# Kamiya 花卉商城 - 技术文档

## 项目概述

Kamiya 是一个基于 Vue 3 的现代化花卉/蛋糕电商平台，提供完整的商品展示、购物车、订单管理等核心功能，同时包含管理后台用于商品和订单管理。

## 技术栈

### 前端框架

- **Vue 3.5.13** - 渐进式 JavaScript 框架
- **Vite 6.0.1** - 下一代前端构建工具
- **Vue Router 4.5.1** - 官方路由管理器
- **Pinia 3.0.2** - Vue 官方状态管理库

### UI 组件库

- **Element Plus 2.9.9** - 基于 Vue 3 的组件库
- **Ant Design Vue 4.2.6** - 企业级 UI 组件库
- **Bootstrap 5.3.5** - CSS 框架

### 数据可视化

- **ECharts 5.6.0** - 数据可视化图表库

### HTTP 客户端

- **Axios 1.9.0** - 基于 Promise 的 HTTP 客户端

### 后端/数据

- **JSON Server 0.17.4** - 快速搭建 RESTful API 的 Mock 服务器
- **MongoDB 6.16.0** - NoSQL 数据库（可选）

### 开发工具

- **Concurrently 8.2.2** - 同时运行多个命令
- **Autoprefixer 10.4.17** - CSS 自动添加浏览器前缀

## 项目结构

```
Kamiya/
├── db/                      # 数据库配置
│   ├── config.js           # 数据库配置
│   └── connect-db.js       # 数据库连接
├── public/                  # 静态资源
│   └── images/            # 图片资源
├── src/
│   ├── assets/            # 资源文件
│   ├── data_stores/       # Pinia 状态管理
│   │   ├── cart.js         # 购物车状态
│   │   ├── normal-orders.js # 订单状态
│   │   ├── products.js     # 商品状态
│   │   └── user.js         # 用户状态
│   ├── layout/            # 布局组件
│   │   ├── admin/         # 管理后台布局
│   │   └── front/         # 前端布局
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── views/             # 页面组件
│   │   ├── about/         # 关于我们
│   │   ├── admin/         # 管理后台
│   │   │   ├── dashboard/ # 仪表盘
│   │   │   ├── orders/    # 订单管理
│   │   │   ├── products/   # 商品管理
│   │   │   ├── settings/   # 设置
│   │   │   └── users/     # 用户管理
│   │   ├── cart/          # 购物车
│   │   ├── customize/     # 定制页面
│   │   ├── homepage/      # 首页
│   │   ├── login/         # 登录
│   │   ├── order/         # 订单
│   │   ├── register/      # 注册
│   │   └── store/         # 商店
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── db.json                 # JSON Server 数据文件
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 核心功能模块

### 1. 状态管理 (Pinia Stores)

#### 用户状态 (`user.js`)

- 用户登录/登出
- 用户信息管理
- Token 管理
- 权限判断（管理员/普通用户）

#### 购物车状态 (`cart.js`)

- 购物车商品管理
- 商品数量增减
- 购物车数据持久化（localStorage）
- 购物车总价计算

#### 商品状态 (`products.js`)

- 商品列表获取
- 商品详情获取
- 商品分类筛选
- 商品搜索

#### 订单状态 (`normal-orders.js`)

- 订单创建
- 订单列表查询
- 订单状态管理
- 订单详情查看

### 2. 路由配置

#### 前端路由

- `/` - 首页
- `/store` - 商店（商品列表）
- `/product/:id` - 商品详情
- `/cart` - 购物车
- `/order` - 订单列表
- `/create-order` - 创建订单
- `/customize` - 定制页面
- `/about` - 关于我们
- `/login` - 登录
- `/register` - 注册

#### 管理后台路由

- `/admin` - 管理后台首页
- `/admin/dashboard` - 仪表盘
- `/admin/products` - 商品管理
- `/admin/orders` - 订单管理
- `/admin/users` - 用户管理
- `/admin/settings` - 系统设置

### 3. API 接口

项目使用 JSON Server 作为后端 API，默认运行在 `http://localhost:3001`

#### 主要接口

- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `GET /products_list` - 获取商品列表
- `GET /products_list/:id` - 获取商品详情
- `GET /cart` - 获取购物车
- `POST /cart` - 添加商品到购物车
- `PUT /cart/:id` - 更新购物车商品
- `DELETE /cart/:id` - 删除购物车商品
- `GET /orders` - 获取订单列表
- `POST /orders` - 创建订单

## 开发环境配置

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

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

### 预览生产构建

```bash
npm run preview
```

## 技术特点

### 1. 响应式设计

- 使用 Vue 3 Composition API
- 响应式数据管理
- 组件化开发

### 2. 状态管理

- 使用 Pinia 进行全局状态管理
- 模块化状态管理
- 数据持久化（localStorage）

### 3. 路由管理

- 基于 Vue Router 4
- 路由懒加载
- 路由守卫（可扩展）

### 4. UI/UX

- 现代化 UI 设计
- Element Plus 组件库
- 自定义样式系统
- 响应式布局

### 5. 数据交互

- Axios 进行 HTTP 请求
- RESTful API 设计
- 错误处理机制

## 代码规范

### 组件命名

- 使用 PascalCase 命名组件文件
- 组件名与文件名保持一致

### 代码风格

- 使用 `<script setup>` 语法
- 使用 Composition API
- 遵循 Vue 3 最佳实践

### 状态管理

- 使用 Pinia Store
- Store 文件使用 camelCase 命名
- 导出使用 `defineStore`

## 部署说明

### 构建步骤

1. 运行 `npm run build` 生成生产构建
2. 构建文件位于 `dist/` 目录
3. 将 `dist/` 目录部署到 Web 服务器

### 环境变量

- 开发环境：`http://localhost:3001`
- 生产环境：需要配置实际 API 地址

### 服务器要求

- 支持静态文件服务
- 支持 SPA 路由（需要配置重定向规则）

## 未来优化方向

1. **性能优化**

   - 图片懒加载
   - 路由预加载
   - 代码分割优化

2. **功能扩展**

   - 支付集成
   - 评论系统完善
   - 商品推荐算法
   - 优惠券系统

3. **技术升级**

   - TypeScript 支持
   - 单元测试
   - E2E 测试
   - CI/CD 集成

4. **后端升级**
   - 替换 JSON Server 为真实后端
   - 数据库优化
   - API 认证机制

## 常见问题

### Q: 如何修改 API 地址？

A: 在 `src/data_stores/` 下的各个 store 文件中，将 `http://localhost:3001` 替换为目标 API 地址。

### Q: 如何添加新的商品分类？

A: 在 `src/views/store/Store.vue` 中的 `categories` 数组中添加新分类，并在 `db.json` 中为商品添加对应的 `category` 字段。

### Q: 如何自定义主题颜色？

A: 修改 `src/style.css` 中的 CSS 变量，或在组件中使用 Element Plus 的主题定制功能。

## 联系方式

如有技术问题，请查看项目 Issues 或联系开发团队。
