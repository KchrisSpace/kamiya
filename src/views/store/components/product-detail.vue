<template>
  <div class="product-container">
    <div class="product-content">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">
        <el-icon><Close /></el-icon>
      </button>
      
      <!-- 商品主要信息区域 -->
      <div class="product-main">
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
          <!-- 商品描述 -->
          <div class="product-description" v-if="product?.description">
            <span class="label">商品描述：</span>
            <span class="content">{{ product.description }}</span>
          </div>
          <!-- 主要材料 -->
          <div class="flower-language" v-if="product?.promotion?.material">
            <span class="label">材料：</span>
            <span class="content">{{ product.promotion.material }}</span>
          </div>
          <!-- 关键词 -->
          <div class="keywords" v-if="product?.promotion?.keywords">
            <span class="label">关键词：</span>
            <span class="content">{{ product.promotion.keywords }}</span>
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
          >
            加入购物车
          </el-button>
        </div>
      </div>
      </div>

      <!-- 评论区 -->
      <div id="comments" class="comments-section">
        <h3 class="comments-title">商品评价</h3>
        <div v-if="commentsLoading" class="comments-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="productComments.length === 0" class="no-comments">
          <el-icon><ChatDotRound /></el-icon>
          <p>暂无评价，快来发表第一条评价吧~</p>
        </div>
        <div v-else class="comments-list">
          <div
            v-for="comment in productComments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <el-avatar :src="comment.avatar || '/images/users/avater/user1.png'" :size="40" />
              <div class="comment-user-info">
                <div class="comment-user-name">{{ comment.user_name || "匿名用户" }}</div>
                <div class="comment-meta">
                  <el-rate
                    v-if="comment.rating"
                    :model-value="comment.rating"
                    disabled
                    :size="14"
                    show-score
                    text-color="#ff9900"
                  />
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
            </div>
            <div class="comment-content">
              <p class="comment-text">{{ comment.content }}</p>
              <!-- 标签 -->
              <div v-if="comment.tags && comment.tags.length > 0" class="comment-tags">
                <el-tag
                  v-for="tag in comment.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                  class="comment-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <!-- 评论图片 -->
              <div v-if="comment.images && comment.images.length > 0" class="comment-images">
                <img
                  v-for="(img, idx) in comment.images"
                  :key="idx"
                  :src="img"
                  alt="评价图片"
                  class="comment-image"
                  @click="previewImage(img)"
                />
              </div>
              <!-- 有用数 -->
              <div v-if="comment.useful_count !== undefined" class="comment-useful">
                <span>有用 ({{ comment.useful_count }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片预览对话框 -->
  <el-dialog v-model="imagePreviewVisible" width="50%">
    <img :src="previewImageUrl" alt="预览图片" style="width: 100%" />
  </el-dialog>
</template>

<script>
export default {
  name: "DetailsEject",
  emits: ["close"],
};
</script>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Plus, Minus, Star, Close, Loading, ChatDotRound } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "../../../data_stores/cart.js";
import { ElMessage } from "element-plus";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const productId = route.params.id;
const product = ref(null);
const quantity = ref(1);
const rating = ref(5);
const isAddingToCart = ref(false);

// 评论相关
const productComments = ref([]);
const commentsLoading = ref(false);
const imagePreviewVisible = ref(false);
const previewImageUrl = ref("");

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

// 处理关闭按钮
const handleClose = () => {
  // 返回到上一级路由，如果没有历史记录则返回到商店页面
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/store");
  }
};

// 获取商品评论
async function fetchProductComments() {
  if (!productId) return;
  
  commentsLoading.value = true;
  try {
    const response = await axios.get(
      `http://localhost:3001/product_comments?product_id=${productId}`
    );
    // 按时间倒序排列
    productComments.value = (response.data || []).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (error) {
    console.error("获取商品评论失败:", error);
  } finally {
    commentsLoading.value = false;
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 预览图片
function previewImage(imgUrl) {
  previewImageUrl.value = imgUrl;
  imagePreviewVisible.value = true;
}

// 监听商品ID变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchProductDetails();
      fetchProductComments();
    }
  }
);

// 滚动到评论区
function scrollToComments() {
  if (route.hash === '#comments') {
    setTimeout(() => {
      const commentsSection = document.getElementById('comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  }
}

// 监听路由hash变化
watch(
  () => route.hash,
  (newHash) => {
    if (newHash === '#comments') {
      scrollToComments();
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchProductDetails();
  fetchProductComments();
  scrollToComments();
});
</script>

<style scoped>
.product-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 100px);
  padding: 40px 220px;
  box-sizing: border-box;
  background-color: var(--bg-primary);
  overflow-y: auto;
  overflow-x: hidden;
}

.product-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background-color: #fff7f7;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.product-main {
  display: flex;
  gap: 40px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #fff9fa 100%);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.3);
  color: #ff6b9d;
  font-size: 28px;
  border: 3px solid rgba(255, 107, 157, 0.2);
}

.close-btn:hover {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff91a4 100%);
  color: #ffffff;
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.5);
  border-color: rgba(255, 107, 157, 0.4);
}

.close-btn:active {
  transform: scale(1.05) rotate(90deg);
}

.product-image {
  flex: 1;
  max-width: 400px;
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
  background: #fff5f5;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(255, 182, 193, 0.2);
  border: 2px solid #ffe4e1;
}

.description > div {
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 2px dotted #ffc0cb;
  display: flex;
  align-items: flex-start;
  color: #d87093;
}

.description > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.description .label {
  font-weight: 600;
  color: #ff69b4;
}

.description .content {
  color: #db7093;
  line-height: 1.6;
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
  background-color: #ff7875;
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
  background-color: rgb(248, 169, 180);
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

  .close-btn {
    top: 10px;
    right: 10px;
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-width: 2px;
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

/* 评论区样式 */
.comments-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #ffe4e1;
}

.comments-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ffc0cb;
}

.comments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #999;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.no-comments .el-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 16px;
}

.no-comments p {
  font-size: 16px;
  margin: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #fff5f5;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #ffd3d3;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #ff6b6b;
}

.comment-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-user-info {
  flex: 1;
}

.comment-user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-left: 52px;
}

.comment-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  word-break: break-word;
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-tag {
  font-size: 12px;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #f0f0f0;
}

.comment-image:hover {
  transform: scale(1.1);
  border-color: #ff6b6b;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.comment-useful {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .product-main {
    flex-direction: column;
  }

  .comments-list {
    max-height: 400px;
  }

  .comment-content {
    margin-left: 0;
  }
}
</style>
