<template>
  <div class="hot-products">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="products.length === 0" class="empty-container">
      <el-empty description="暂无数据" :image-size="100" />
    </div>
    <div v-else class="product-list">
      <div
        v-for="(product, index) in products"
        :key="product.product_id"
        class="product-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>
        <el-avatar
          :size="50"
          :src="getProductImage(product.image)"
          shape="square"
          class="product-avatar"
        />
        <div class="product-info">
          <div class="product-name" :title="product.name">
            {{ product.name }}
          </div>
          <div class="product-stats">
            <span class="stat-item">
              <el-icon><ShoppingBag /></el-icon>
              销量: {{ product.sales }}
            </span>
            <span class="stat-item">
              <el-icon><Money /></el-icon>
              销售额: ¥{{ product.revenue.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingBag, Money } from "@element-plus/icons-vue";

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function getProductImage(image) {
  if (!image) return "/images/products_list/default.jpg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return image;
  return image;
}
</script>

<style scoped>
.hot-products {
  width: 100%;
}

.loading-container,
.empty-container {
  padding: 20px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  position: relative;
}

.product-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.product-item.top-three {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffe0e0;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
  background: #909399;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #333;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a23c 100%);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.product-avatar {
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item .el-icon {
  font-size: 14px;
}
</style>
