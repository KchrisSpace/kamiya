<template>
  <div class="product-container">
    <div class="product-content">
      <!-- 左侧商品图片 -->
      <div class="product-image">
        <div class="img-main">
          <img :src="getImagePath(product?.images)" alt="商品主图" />
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
              v-if="
                product?.price_info?.current_price !==
                product?.price_info?.original_price
              "
              class="original-price"
            >
              ￥{{ product?.price_info?.original_price }}
            </span>
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
        <div class="description">
          <!-- 花语 -->
          <div
            class="flower-language"
            v-if="product?.promotion?.flower_language"
          >
            <span class="label">花语：</span>
            <span class="content">{{ product.promotion.flower_language }}</span>
          </div>

          <!-- 主体 -->
          <div
            class="main_description"
            v-if="product?.promotion?.main_description"
          >
            <span class="label">主体：</span>
            <span class="content">{{
              product.promotion.main_description
            }}</span>
          </div>
        </div>

        <!-- 数量和购物车 -->
        <div class="action-buttons">
          <div class="quantity-selector">
            <el-button @click="decreaseQuantity" :disabled="quantity <= 1">
              <el-icon><Minus /></el-icon>
            </el-button>
            <span class="quantity">{{ quantity }}</span>
            <el-button @click="increaseQuantity">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <el-button
            type="primary"
            class="add-to-cart"
            @click="addItem(productId, quantity)"
            :loading="isAddingToCart"
          >
            加入购物车
          </el-button>
          <el-button
            class="wishlist-btn"
            @click="addToWishlist"
            :loading="isAddingToWishlist"
          >
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
import { ref, onMounted } from "vue";
import { Plus, Minus, Star } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../../../data_stores/cart.js";
import { useWishlistStore } from "../../../data_stores/wishlist.js";
import { ElMessage } from "element-plus";

const route = useRoute();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const productId = route.params.id;
const product = ref(null);
const quantity = ref(1);
const rating = ref(5);
const isAddingToCart = ref(false);
const isAddingToWishlist = ref(false);

// 处理图片路径
const getImagePath = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  if (imagePath.includes("public/")) return imagePath.replace("public/", "/");
  return `/images/products_list/${productId}/${imagePath}`;
};

// 获取商品详情
const fetchProductDetails = async () => {
  try {
    const response = await fetch(
      `http://localhost:3001/products_list/${productId}`
    );
    if (!response.ok) throw new Error("获取商品详情失败");
    const data = await response.json();
    product.value = data;
  } catch (error) {
    console.error("获取商品详情失败:", error);
    ElMessage.error("获取商品详情失败，请重试");
  }
};

// 数量控制
const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 添加商品到购物车
const addItem = async () => {
  if (!product.value) return;

  try {
    isAddingToCart.value = true;
    await cartStore.addItem(productId, quantity.value);
    ElMessage.success("商品已成功添加到购物车");
  } catch (error) {
    console.error("添加商品到购物车失败:", error);
    ElMessage.error("添加商品失败，请重试");
  } finally {
    isAddingToCart.value = false;
  }
};

// 添加商品到心愿单
const addToWishlist = async () => {
  if (!product.value) return;

  try {
    isAddingToWishlist.value = true;
    await wishlistStore.addItem(productId, 1);
    ElMessage.success("商品已成功添加到心愿单");
  } catch (error) {
    console.error("添加商品到心愿单失败:", error);
    ElMessage.error("添加商品到心愿单失败，请重试");
  } finally {
    isAddingToWishlist.value = false;
  }
};

onMounted(() => {
  fetchProductDetails();
});
</script>

<style scoped>
.product-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 100px);
  padding: 40px 220px;
  box-sizing: border-box;
  background-color: #f8f9fa;
}

.product-content {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background-color: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.product-image {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.img-main {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.img-main:hover {
  transform: scale(1.02);
}

.img-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-info {
  flex: 1;
  padding: 20px;
}

.product-title {
  font-size: 28px;
  margin-bottom: 24px;
  color: #2c3e50;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  font-size: 32px;
  color: #ff4d4f;
  font-weight: 700;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.description {
  margin: 24px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.description > div {
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px dashed #e8e8e8;
  display: flex;
  align-items: flex-start;
}

.description > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.description .label {
  min-width: 60px;
  color: #666;
  font-size: 15px;
  margin-right: 12px;
  flex-shrink: 0;
  font-weight: 500;
}

.description .content {
  color: #2c3e50;
  font-size: 15px;
  line-height: 1.6;
  flex: 1;
}

.flower-language .label {
  color: #ff6b6b;
}

.main_description .label {
  color: #1890ff;
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quantity-selector .quantity {
  margin: 0 20px;
  font-size: 18px;
  min-width: 30px;
  text-align: center;
  color: #2c3e50;
  font-weight: 500;
}

.add-to-cart {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.add-to-cart:hover {
  background-color: #ff7875;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 77, 79, 0.3);
}

.wishlist-btn {
  padding: 12px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.wishlist-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .product-container {
    padding: 30px;
  }

  .product-content {
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .product-container {
    padding: 20px;
  }

  .product-content {
    flex-direction: column;
    padding: 20px;
    gap: 30px;
  }

  .product-image {
    max-width: 100%;
  }

  .img-main {
    height: 300px;
  }

  .product-title {
    font-size: 24px;
  }

  .current-price {
    font-size: 28px;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 15px;
  }

  .add-to-cart {
    width: 100%;
    padding: 12px 24px;
  }

  .description {
    padding: 20px;
  }
}
</style>
