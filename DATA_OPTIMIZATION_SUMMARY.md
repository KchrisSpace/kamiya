# 数据设计优化总结（问题5-8）

## ✅ 已完成的优化

### 5. 统一字段命名：`user-info` → `user_info`

**修复内容：**
- 在 `db.json` 中，将所有用户的 `user-info` 字段改为 `user_info`
- 更新了相关代码以兼容新旧格式：
  - `src/data_stores/user.js` - 支持读取 `user_info` 和 `user-info`（向后兼容）
  - `src/views/register/register.vue` - 注册时使用 `user_info`
  - `src/views/admin/users/users.vue` - 管理员用户管理支持新旧格式

**向后兼容性：**
- 代码中同时支持 `user_info` 和 `user-info`，确保平滑迁移
- 读取时优先使用 `user_info`，如果没有则使用 `user-info`

### 6. 添加时间戳字段：`created_at` 和 `updated_at`

**修复内容：**
- 为所有表添加了时间戳字段：
  - **users 表**：添加 `created_at` 和 `updated_at`
  - **products_list 表**：添加 `created_at` 和 `updated_at`
  - **product_comments 表**：添加 `updated_at`（已有 `created_at`）
  - **normal_orders 表**：添加 `updated_at`（已有 `created_at`）
  - **custom 表**：添加 `updated_at`（已有 `created_at`）
  - **feedback 表**：添加 `updated_at`（已有 `created_at`）

**代码更新：**
- `src/views/register/register.vue` - 注册时自动添加时间戳
- `src/data_stores/user.js` - 更新用户信息时自动更新 `updated_at`
- `src/views/order/components/create-order.vue` - 创建订单时添加时间戳

### 7. 订单项添加价格快照

**修复内容：**
- 在 `db.json` 中，为所有订单的 `items` 添加了价格快照：
  - `product_name`：商品名称快照
  - `single_price`：商品单价快照

**示例：**
```json
{
  "items": [
    {
      "product_id": "P01",
      "product_name": "星与你皆浪漫",
      "quantity": 1,
      "single_price": 559.9
    }
  ]
}
```

**代码更新：**
- `src/views/order/components/create-order.vue` - 创建订单时自动添加价格快照
  - 从购物车商品信息中获取商品名称和价格
  - 确保即使商品信息变更，订单历史记录仍然准确

### 8. 统一图片路径格式

**修复内容：**
- 在 `db.json` 中，统一了图片路径格式：
  - `carousel` 表：`/public/images/...` → `/images/...`
- 在代码中，修复了所有使用 `/public/` 前缀的路径：
  - `src/layout/front/components/Header.vue` - Logo 路径
  - `src/layout/admin/AdminLayout.vue` - 默认头像路径
  - `src/views/admin/dashboard/components/HotProductList.vue` - 商品图片路径
  - `src/data_stores/user.js` - 管理员头像路径

**统一规则：**
- 所有静态资源路径统一使用 `/images/...` 格式
- 移除了 `/public/` 前缀（Vite 会自动处理 public 目录）

## 数据一致性改进

### 字段命名规范
- ✅ 所有字段使用下划线命名（`user_info` 而不是 `user-info`）
- ✅ 时间戳字段统一使用 `created_at` 和 `updated_at`

### 数据完整性
- ✅ 所有表都有时间戳字段，便于追踪数据变更
- ✅ 订单项包含价格快照，确保历史订单数据准确

### 路径规范
- ✅ 所有图片路径统一格式，便于维护和部署

## 代码更新说明

### 用户相关
- `user.js` store 现在兼容新旧格式，支持平滑迁移
- 注册和更新用户信息时自动添加/更新时间戳

### 订单相关
- 创建订单时自动添加价格快照
- 订单项包含完整的商品信息快照（名称、价格）

### 图片路径
- 所有图片路径统一使用 `/images/` 格式
- 移除了 `/public/` 前缀，符合 Vite 规范

## 注意事项

1. **数据迁移**：如果已有生产数据，需要手动迁移：
   - 将 `user-info` 改为 `user_info`
   - 为所有记录添加 `created_at` 和 `updated_at` 字段
   - 为现有订单的 `items` 添加价格快照
   - 统一图片路径格式

2. **向后兼容**：代码中保留了对旧数据结构的兼容处理，确保平滑迁移

3. **测试建议**：
   - 测试用户注册和更新是否自动添加时间戳
   - 测试创建订单时是否正确添加价格快照
   - 测试图片路径是否正确显示
   - 测试新旧格式的用户信息是否都能正常读取

