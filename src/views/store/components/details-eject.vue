<template>
  <div class="product-container">
    <div class="product-content">
      <!-- 左侧商品图片 -->
      <div class="product-image">
        <div class="img-main">
          <img :src="getImagePath(currentImage)" alt="商品主图" />
        </div>
        <div class="img-list">
          <div
            class="img-item"
            v-for="(item, index) in product?.images"
            :key="index"
            @mouseenter="changeMainImage(index)"
            @mouseleave="resetMainImage"
          >
            <img :src="getImagePath(item)" alt="商品图片" />
          </div>
        </div>
      </div>

      <!-- 右侧商品信息 -->
      <div class="product-info">
        <h1 class="product-title">{{ product?.title || "加载中..." }}</h1>

        <!-- 价格区域 -->
        <div class="price-section">
          <div class="price">
            <span class="current-price"
              >￥{{ product?.price_info?.current_price || "0.00" }}</span
            >
            <span
              class="original-price"
              v-if="
                product?.price_info?.current_price !==
                product?.price_info?.original_price
              "
              >￥{{ product.price_info.original_price }}</span
            >
          </div>

          <!-- 评分区域 -->
          <div class="rating">
            <el-rate
              v-model="rating"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="`评论（${product?.reviews || 0}）`"
            />
          </div>
        </div>

        <!-- 商品描述 -->
        <!-- <div class="description">
          <p>{{ product?.description || "暂无描述" }}</p>
        </div> -->

        <div class="description">
          <!-- 花语 -->
          <div
            class="flower-language"
            v-if="product?.promotion.flower_language"
          >
            <span class="label">花语：</span>
            <span class="content">{{ product.promotion.flower_language }}</span>
          </div>

          <!-- 主体 -->
          <div
            class="main_description"
            v-if="product?.promotion.main_description"
          >
            <span class="label">主体：</span>
            <span class="content">{{
              product.promotion.main_description
            }}</span>
          </div>
          <!-- 材料 -->
          <div class="material" v-if="product?.specification.materials">
            <span class="label">材料：</span>
            <span class="content">{{ product.specification.materials }}</span>
          </div>
          <!-- 包装 -->
          <div class="packaging" v-if="product?.specification.packaging">
            <span class="label">包装：</span>
            <span class="content">{{ product.specification.packaging }}</span>
          </div>
        </div>

        <!-- 数量和购物车 -->
        <div class="action-buttons">
          <div class="quantity-selector">
            <el-button @click="decreaseQuantity"
              ><el-icon><Minus /></el-icon
            ></el-button>
            <span class="quantity">{{ quantity }}</span>
            <el-button @click="increaseQuantity"
              ><el-icon><Plus /></el-icon
            ></el-button>
          </div>
          <el-button
            type="primary"
            class="add-to-cart"
            @click="addItem(productId, quantity)"
            >加入购物车</el-button
          >
          <el-button class="wishlist-btn" @click="addToWishlist">
            <el-icon><Star /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DetailsEject",
  emits: ["close"],
};
</script>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Plus, Minus, Star } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../../../data_stores/cart.js";
import { useWishlistStore } from "../../../data_stores/wishlist.js";
import { ElMessage } from "element-plus";

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const route = useRoute();
const productId = route.params.id;
// console.log(productId)
const quantity = ref(1);
const rating = ref(5);
const product = ref(null);
const hoveredImageIndex = ref(-1);

const emit = defineEmits();

// 计算当前应该显示的主图
const currentImage = computed(() => {
  if (
    hoveredImageIndex.value >= 0 &&
    product.value?.images?.[hoveredImageIndex.value]
  ) {
    return product.value.images[hoveredImageIndex.value];
  }
  return product.value?.images?.[0];
});

// 处理图片路径
const getImagePath = (imagePath) => {
  if (!imagePath) return "";

  // 如果已经是完整的URL，直接返回
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // 处理相对路径
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // 处理 public 目录下的图片
  if (imagePath.includes("public/")) {
    return imagePath.replace("public/", "/");
  }

  // 默认处理
  return `/images/products_list/${productId}/${imagePath}`;
};

// 获取商品详情
const fetchProductDetails = async () => {
  try {
    const response = await fetch(
      `http://localhost:3001/product_list/${productId}`
    );
    const data = await response.json();
    product.value = data;
    console.log("Product data:", product.value);
    console.log("Images array:", product.value?.images);
  } catch (error) {
    console.error("获取商品详情失败:", error);
  }
};

// 切换主图
const changeMainImage = (index) => {
  hoveredImageIndex.value = index;
};

// 重置主图
const resetMainImage = () => {
  hoveredImageIndex.value = -1;
};

onMounted(() => {
  fetchProductDetails();
});

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 添加商品到购物车
const addItem = async (productId, quantity) => {
  try {
    await cartStore.addItem(productId, quantity);
    ElMessage({
      message: "商品已成功添加到购物车",
      type: "success",
    });
    emit("close");
  } catch (error) {
    console.error("添加商品到购物车失败:", error);
    ElMessage({
      message: "添加商品失败，请重试",
      type: "error",
    });
  }
};

// 添加商品到心愿单
const addToWishlist = async () => {
  try {
    await wishlistStore.addItem(productId, 1);
    ElMessage({
      message: "商品已成功添加到心愿单",
      type: "success",
    });
  } catch (error) {
    console.error("添加商品到心愿单失败:", error);
    ElMessage({
      message: "添加商品到心愿单失败，请重试",
      type: "error",
    });
  }
};
</script>

<style scoped>
.product-container {
  padding: 0 220px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-content {
  display: flex;
  gap: 40px;
}

.product-image {
  flex: 1;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.img-main {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.img-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.img-list {
  display: flex;
  justify-content: center;
  gap: 2rem;
  overflow-x: auto;
  padding: 10px 0;
}

.img-item {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.img-item:hover {
  border-color: #ff6b6b;
}

.img-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  padding: 20px 0;
}

.product-title {
  text-align: left;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.price .current-price {
  font-size: 24px;
  color: #ff4d4f;
  margin-right: 10px;
}

.price .original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.description {
  margin: 20px 0;
  padding: 0;
  text-align: left;
}

.description > div {
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed #e8e8e8;
  display: flex;
  align-items: flex-start;
}

.description > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.description .label {
  display: inline-block;
  min-width: 50px;
  color: #666;
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
}

.description .content {
  display: inline-block;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
  text-align: left;
}

/* 花语样式 */
.flower-language .label {
  color: #ff6b6b;
}

/* 主体样式 */
.main_description .label {
  color: #1890ff;
}

/* 材料样式 */
.material .label {
  color: #52c41a;
}

/* 包装样式 */
.packaging .label {
  color: #fa8c16;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .description > div {
    margin-bottom: 12px;
    padding: 8px 0;
  }

  .description .label,
  .description .content {
    font-size: 13px;
  }
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 5px;
  border-radius: 4px;
}

.quantity-selector .quantity {
  margin: 0 15px;
  font-size: 16px;
}

.add-to-cart {
  position: relative;
  top: 5px;
  background-color: rgba(242, 99, 113, 1);
  color: white;
  border: none;
}

.wishlist-btn {
  position: relative;
  scale: 2;
  top: 5px;
  /* background: #f5f5f5; */
  border: none;
}

:deep(.el-radio-button__inner) {
  border-color: #ddd;
  background: white;
  color: #333;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #6c4141;
  border-color: #6c4141;
  box-shadow: -1px 0 0 0 #6c4141;
}
</style>
