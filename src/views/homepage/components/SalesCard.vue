<template>
  <div class="salescards">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="全部" name="全部"></el-tab-pane>
      <el-tab-pane label="上新" name="上新"></el-tab-pane>
      <el-tab-pane label="热销" name="热销"></el-tab-pane>
      <el-tab-pane label="特价" name="特价"></el-tab-pane>
    </el-tabs>

    <div class="list-show">
      <div class="product-count">共 {{ productCount }} 件商品</div>
      <div class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product"
          @click="goToProductDetails(product.id)"
        >
          <div class="image-container">
            <img :src="product.images" :alt="product.title" />
          </div>

          <div class="product-info">
            <p class="rating">评分：{{ product.sale_rate }}</p>
            <p class="title">{{ product.title }}</p>
            <hr />
            <div class="price">
              <span class="current-price"
                >￥{{ product.price_info.current_price }}</span
              >
              <span
                v-if="
                  product.price_info.original_price !==
                  product.price_info.current_price
                "
                class="original-price"
              >
                ￥{{ product.price_info.original_price }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { ElTabPane, ElTabs } from "element-plus";
import axios from "axios";

const router = useRouter();
const API_URL = "http://localhost:3001/product_list";
const ProductList = ref([]);
const activeName = ref("全部");
const productCount = ref(0);

// 计算属性，根据 activeName 过滤商品
const filteredProducts = computed(() => {
  if (activeName.value === "上新") {
    return ProductList.value.filter(
      (product) => product.main_category === "上新"
    );
  } else if (activeName.value === "热销") {
    return ProductList.value.filter(
      (product) => product.main_category === "热销"
    );
  } else if (activeName.value === "特价") {
    return ProductList.value.filter(
      (product) => product.main_category === "特价出售"
    );
  }
  return ProductList.value;
});

// 监听 filteredProducts 的变化，更新商品数量
watch(filteredProducts, (newVal) => {
  productCount.value = newVal.length;
});

// 获取商品数据
onMounted(async () => {
  try {
    const response = await axios.get(API_URL);
    ProductList.value = response.data;
    console.log("获取的商品数据:", ProductList.value);
  } catch (err) {
    console.error("获取商品数据失败:", err);
  }
});

// 跳转到商品详情页
const goToProductDetails = (productId) => {
  router.push({
    name: "ProductDetails",
    params: { id: productId },
  });
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// 标签切换处理
 
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.salescards {
  width: 100%;
  background-color: #f5f5f5;
  padding: 80px;
}

.demo-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ab4545;
  margin-bottom: 20px;
}

.demo-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: 18px;
  font-family: "微软雅黑";
}

.demo-tabs :deep(.el-tabs__item:hover) {
  color: rgba(242, 99, 113, 1);
}

.demo-tabs :deep(.el-tabs__item.is-active) {
  color: rgb(237, 120, 132);
}

.demo-tabs :deep(.el-tabs__active-bar) {
  background-color: rgba(242, 99, 113, 1);
}

.list-show {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-count {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
  font-size: 16px;
  width: 100%;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 20px;
}

.product {
  width: 235px;
  height: 400px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dddddda7;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.product:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(242, 146, 149, 0.5);
  border-color: rgba(242, 99, 113, 0.6);
}

.image-container {
  width: 100%;
  height: 240px;
  border-radius: 5px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 10px 0;
}

.rating {
  color: #666;
  font-size: 0.9rem;
}

.title {
  font-size: 1.1rem;
  margin: 10px 0;
  font-weight: 400;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

hr {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #eee;
}

.price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 1.2em;
  color: #000;
  font-weight: 500;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9em;
}
</style>
