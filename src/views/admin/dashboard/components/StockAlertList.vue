<template>
  <div class="stock-alert">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="products.length === 0" class="empty-container">
      <el-empty description="暂无低库存商品" :image-size="100" />
    </div>
    <div v-else class="product-list">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-item"
        :class="getStockClass(product.stock)"
      >
        <el-avatar
          :size="50"
          :src="getProductImage(product.images)"
          shape="square"
          class="product-avatar"
        />
        <div class="product-info">
          <div class="product-name" :title="product.title">
            {{ product.title }}
          </div>
          <div class="product-stock">
            <el-tag
              :type="getStockTagType(product.stock)"
              size="small"
              effect="dark"
            >
              库存: {{ product.stock }} 件
            </el-tag>
            <el-button
              text
              type="primary"
              size="small"
              @click="goToProduct(product.id)"
            >
              去补货
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";

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

const router = useRouter();

function getProductImage(image) {
  if (!image) return "/images/products_list/default.jpg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return image;
  return image;
}

function getStockClass(stock) {
  if (stock === 0) return "stock-out";
  if (stock <= 3) return "stock-critical";
  if (stock <= 5) return "stock-low";
  return "stock-normal";
}

function getStockTagType(stock) {
  if (stock === 0) return "danger";
  if (stock <= 3) return "danger";
  if (stock <= 5) return "warning";
  return "info";
}

function goToProduct(productId) {
  router.push({
    path: "/admin/products",
    query: { edit: productId },
  });
}
</script>

<style scoped>
.stock-alert {
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
  border-left: 4px solid #e0e0e0;
}

.product-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.product-item.stock-out {
  background: linear-gradient(135deg, #fff1f0 0%, #fff 100%);
  border-left-color: #ff4d4f;
}

.product-item.stock-critical {
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
  border-left-color: #ff7875;
}

.product-item.stock-low {
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border-left-color: #faad14;
}

.product-item.stock-normal {
  border-left-color: #52c41a;
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

.product-stock {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

