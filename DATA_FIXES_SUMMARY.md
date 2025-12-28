# 数据设计修复总结

## 已修复的高优先级问题

### ✅ 1. 购物车添加 `user_id` 字段

**修复内容：**
- 在 `db.json` 中，购物车数据结构从：
  ```json
  {
    "id": "P02",
    "quantity": 1
  }
  ```
  改为：
  ```json
  {
    "id": "cart_1",
    "user_id": "user1",
    "product_id": "P02",
    "quantity": 1,
    "created_at": "2025-01-01T00:00:00Z"
  }
  ```

- 更新了 `src/data_stores/cart.js`：
  - `fetchCartData()` 现在支持按 `user_id` 过滤
  - `addItem()` 现在会自动添加 `user_id` 字段
  - `clearCart()` 现在只清空当前用户的购物车

- 更新了相关页面：
  - `src/views/cart/cart.vue` - 获取购物车时传入用户ID
  - `src/views/order/components/create-order.vue` - 创建订单时使用正确的字段
  - `src/views/profile/profile.vue` - 获取购物车时传入用户ID

### ✅ 2. 用户表添加 `role` 字段

**修复内容：**
- 在 `db.json` 中，为所有用户添加了 `role` 字段：
  - `admin` 用户：`"role": "admin"`
  - 普通用户：`"role": "user"`

- 更新了 `src/views/register/register.vue`：
  - 注册新用户时自动添加 `"role": "user"` 字段
  - 注册时检查用户名是否已存在
  - 自动生成用户ID（格式：`user{timestamp}`）

### ✅ 3. 订单 `total_price` 改为数字类型

**修复内容：**
- 在 `db.json` 中，将所有订单的 `total_price` 从字符串改为数字：
  - `"total_price": "758.90"` → `"total_price": 758.90`
  - `"total_price": "559.90"` → `"total_price": 559.90`
  - `"total_price": "1357.90"` → `"total_price": 1357.90`

- 更新了 `src/views/order/components/create-order.vue`：
  - 创建订单时使用 `parseFloat()` 确保 `total_price` 是数字类型

### ✅ 4. 统一用户ID格式

**修复内容：**
- 在 `db.json` 中，统一了所有用户ID格式：
  - `product_comments` 表中的 `"user_id": "2"` → `"user_id": "user2"`
  - `custom` 表中的 `"user_id": "02"` → `"user_id": "user2"`
  - `feedback` 表中的 `"user_id": "02"` → `"user_id": "user2"`

- 更新了相关代码：
  - `src/views/about/components/feedback.vue` - 使用当前登录用户的ID，而不是硬编码
  - `src/layout/front/components/comment/comments.vue` - 使用当前登录用户的ID和用户信息

## 数据一致性改进

### 用户ID格式统一
- ✅ 所有用户ID现在统一使用格式：`user1`, `user2`, `admin`
- ✅ 移除了不一致的格式：`"2"`, `"02"`

### 购物车数据结构
- ✅ 每个购物车项现在都有唯一的 `id`（格式：`cart_{timestamp}_{random}`）
- ✅ 每个购物车项都关联到特定用户（`user_id`）
- ✅ 使用 `product_id` 字段明确标识商品

### 订单数据
- ✅ `total_price` 现在是数字类型，便于计算和比较
- ✅ 订单项使用 `product_id` 字段

## 代码更新说明

### 购物车相关
- `fetchCartData(userId)` - 现在接受用户ID参数，只获取该用户的购物车
- `addItem(productId, quantity, userId)` - 现在接受用户ID参数，自动关联到用户
- `clearCart(userId)` - 现在只清空指定用户的购物车

### 用户相关
- 注册功能现在会自动添加 `role: "user"` 字段
- 注册时会检查用户名是否已存在
- 自动生成格式统一的用户ID

### 评论相关
- 评论功能现在使用当前登录用户的ID和信息
- 未登录用户无法发表评论（会提示）

## 注意事项

1. **数据迁移**：如果已有生产数据，需要手动迁移：
   - 为现有用户添加 `role` 字段
   - 为现有购物车项添加 `user_id` 和 `product_id` 字段
   - 将订单的 `total_price` 从字符串转换为数字
   - 统一所有用户ID格式

2. **向后兼容**：代码中保留了对旧数据结构的兼容处理（如 `item.product_id || item.id`）

3. **测试建议**：
   - 测试不同用户登录后购物车是否隔离
   - 测试注册新用户是否正确添加 `role` 字段
   - 测试订单创建时 `total_price` 是否为数字
   - 测试评论功能是否使用正确的用户ID

