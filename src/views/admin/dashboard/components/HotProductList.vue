<template>
  <div class="hot-products">
    <div v-for="(product, index) in products" :key="index" class="product-item">
      <el-avatar :size="40" :src="product.image" />
      <div class="product-info">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-sales">销量: {{ product.sales }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const products = [
  {
    name: "商品名称 1",
    image: "/images/product-1.jpg",
    sales: 1100,
  },
  {
    name: "商品名称 2",
    image: "/images/product-2.jpg",
    sales: 1200,
  },
  {
    name: "商品名称 3",
    image: "/images/product-3.jpg",
    sales: 1300,
  },
  {
    name: "商品名称 4",
    image: "/images/product-4.jpg",
    sales: 1400,
  },
  {
    name: "商品名称 5",
    image: "/images/product-5.jpg",
    sales: 1500,
  },
];
</script>

<style scoped>
.hot-products {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 12px;
  color: #666;
}
</style>
