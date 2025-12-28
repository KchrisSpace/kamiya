<template>
  <div class="order-review-container">
    <div class="review-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h2 class="review-title">发表评价</h2>
    </div>

    <div class="review-content">
      <!-- 订单信息 -->
      <div class="order-info-card">
        <div class="order-header-info">
          <span class="order-label">订单号：</span>
          <span class="order-value">{{ orderId }}</span>
        </div>
        <div class="review-progress">
          <span class="progress-text"
            >商品评价({{ completedCount }}/{{ totalCount }})</span
          >
        </div>
      </div>

      <!-- 商品评价列表 -->
      <div class="products-review-list">
        <div
          v-for="(product, index) in products"
          :key="product.product_id"
          class="product-review-card"
        >
          <div class="product-info">
            <img
              :src="getProductImage(product.product_id)"
              :alt="getProductName(product.product_id)"
              class="product-image"
            />
            <div class="product-details">
              <p class="product-name">
                {{ getProductName(product.product_id) }}
              </p>
              <p class="product-spec" v-if="product.quantity">
                数量：{{ product.quantity }}
              </p>
            </div>
          </div>

          <!-- 评分 -->
          <div class="rating-section">
            <span class="rating-label">评分</span>
            <el-rate
              v-model="reviews[index].rating"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              :size="24"
            />
          </div>

          <!-- 标签建议 -->
          <div class="tags-section">
            <span class="tags-label">猜你想说</span>
            <div class="tags-list">
              <el-tag
                v-for="tag in getSuggestedTags(product.product_id)"
                :key="tag"
                :type="reviews[index].tags.includes(tag) ? 'primary' : 'info'"
                class="suggested-tag"
                @click="toggleTag(index, tag)"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 文字评价 -->
          <div class="text-review-section">
            <p class="hint-text">图片和文字可以帮助其他人更好地了解商品</p>
            <el-input
              v-model="reviews[index].content"
              type="textarea"
              :rows="4"
              placeholder="请输入您的评价..."
              maxlength="500"
              show-word-limit
              class="review-textarea"
            />
          </div>

          <!-- 图片上传 -->
          <div class="image-upload-section">
            <el-upload
              :file-list="reviews[index].images"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="(file) => handleRemove(index, file)"
              :on-change="
                (file, fileList) => handleChange(index, file, fileList)
              "
              :before-upload="beforeUpload"
              :limit="3"
              accept="image/*"
              class="review-upload"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <el-dialog v-model="dialogVisible" width="50%">
              <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
          class="submit-btn"
        >
          {{ submitting ? "提交中..." : "提交评价" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../../../data_stores/user";
import { useNormalOrdersStore } from "../../../data_stores/normal-orders";
import { useProductsStore } from "../../../data_stores/products";
import { ElMessage } from "element-plus";
import { ArrowLeft, Plus } from "@element-plus/icons-vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const normalOrdersStore = useNormalOrdersStore();
const productsStore = useProductsStore();

const orderId = ref(null);
const order = ref(null);
const products = ref([]);
const reviews = ref([]);
const submitting = ref(false);
const dialogVisible = ref(false);
const dialogImageUrl = ref("");

// 获取订单信息
onMounted(async () => {
  orderId.value = route.params.orderId;
  if (!orderId.value) {
    ElMessage.error("订单ID不存在");
    router.push("/order");
    return;
  }

  try {
    // 获取订单数据
    await normalOrdersStore.fetchOrders(userStore.userId);
    order.value = normalOrdersStore.orders.find((o) => o.id == orderId.value);

    if (!order.value) {
      ElMessage.error("订单不存在");
      router.push("/order");
      return;
    }

    // 检查订单状态
    if (order.value.status !== "已完成") {
      ElMessage.warning("只有已完成的订单才能评价");
      router.push("/order");
      return;
    }

    // 获取商品数据
    await productsStore.fetchProducts();

    // 初始化商品列表和评价数据
    products.value = order.value.items || [];
    reviews.value = products.value.map(() => ({
      rating: 0,
      content: "",
      tags: [],
      images: [],
    }));

    // 检查是否已评价
    await checkExistingComments();
  } catch (error) {
    console.error("加载订单失败:", error);
    ElMessage.error("加载订单失败");
    router.push("/order");
  }
});

// 检查是否已有评价
async function checkExistingComments() {
  try {
    const response = await axios.get(
      `http://localhost:3001/product_comments?user_id=${userStore.userId}`
    );
    const userComments = response.data || [];

    // 检查每个商品是否已有评价
    products.value.forEach((product, index) => {
      const existingComment = userComments.find(
        (c) => c.product_id === product.product_id
      );
      if (existingComment) {
        reviews.value[index] = {
          rating: existingComment.rating || 0,
          content: existingComment.content || "",
          tags: existingComment.tags || [],
          images: existingComment.images || [],
        };
      }
    });
  } catch (error) {
    console.error("检查评价失败:", error);
  }
}

// 获取商品图片
function getProductImage(productId) {
  const product = productsStore.products.find((p) => p.id === productId);
  return product?.images || "";
}

// 获取商品名称
function getProductName(productId) {
  const product = productsStore.products.find((p) => p.id === productId);
  return product?.title || `商品 ${productId}`;
}

// 获取建议标签
function getSuggestedTags(productId) {
  // 根据商品类型返回不同的标签建议
  const commonTags = ["品质很好", "味道鲜美", "分量很足", "包装精美"];
  const product = productsStore.products.find((p) => p.id === productId);

  if (product?.category === "热销") {
    return ["炒菜很香", "营养丰富", "品质很好", "肉厚"];
  }
  return commonTags;
}

// 切换标签
function toggleTag(index, tag) {
  const tagIndex = reviews.value[index].tags.indexOf(tag);
  if (tagIndex > -1) {
    reviews.value[index].tags.splice(tagIndex, 1);
  } else {
    reviews.value[index].tags.push(tag);
  }
}

// 图片上传前验证
function beforeUpload(file) {
  const isImage = file.type.startsWith("image/");
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return false;
  }
  // 阻止自动上传，使用自定义处理
  return false;
}

// 图片预览
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url || file.raw;
  dialogVisible.value = true;
}

// 移除图片
function handleRemove(index, file) {
  const fileList = reviews.value[index].images;
  const fileIndex = fileList.findIndex((f) => f.uid === file.uid);
  if (fileIndex > -1) {
    fileList.splice(fileIndex, 1);
  }
}

// 图片变化
function handleChange(index, file, fileList) {
  // 如果是新上传的文件，转换为base64
  if (file.raw && !file.url) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // 将图片转换为base64
      const imageUrl = e.target.result;
      const imageFile = {
        uid: file.uid,
        name: file.name,
        url: imageUrl,
        status: "success",
      };
      // 更新文件列表
      const fileIndex = reviews.value[index].images.findIndex(
        (img) => img.uid === file.uid
      );
      if (fileIndex > -1) {
        reviews.value[index].images[fileIndex] = imageFile;
      } else {
        reviews.value[index].images.push(imageFile);
      }
    };
    reader.onerror = () => {
      ElMessage.error("图片读取失败");
    };
    reader.readAsDataURL(file.raw);
  } else {
    // 更新文件列表
    reviews.value[index].images = fileList;
  }
}

// 返回
function goBack() {
  router.push("/order");
}

// 计算已完成评价数量
const completedCount = computed(() => {
  return reviews.value.filter(
    (review) => review.rating > 0 || review.content.trim()
  ).length;
});

// 总商品数
const totalCount = computed(() => {
  return products.value.length;
});

// 是否可以提交
const canSubmit = computed(() => {
  return reviews.value.some(
    (review) => review.rating > 0 || review.content.trim()
  );
});

// 提交评价
async function handleSubmit() {
  if (!canSubmit.value) {
    ElMessage.warning("请至少完成一个商品的评价");
    return;
  }

  submitting.value = true;
  try {
    const userId = userStore.userId;
    const userName = userStore.userNickname || "用户";
    const userAvatar = userStore.userAvatar || "/images/users/avater/user1.png";

    if (!userId) {
      ElMessage.error("请先登录");
      router.push("/login");
      return;
    }

    // 提交每个商品的评价
    const promises = [];
    for (let i = 0; i < products.value.length; i++) {
      const product = products.value[i];
      const review = reviews.value[i];

      // 如果已评价（有评分或内容），则提交
      if (review.rating > 0 || review.content.trim()) {
        const commentData = {
          product_id: product.product_id,
          user_id: userId,
          user_name: userName,
          avatar: userAvatar,
          content: review.content.trim() || "",
          rating: review.rating || 5,
          tags: review.tags,
          images: review.images
            .map((img) => {
              // 如果是base64，可以保存，但实际项目中应该上传到服务器后保存URL
              if (img.url && img.url.startsWith("data:image")) {
                // base64图片，实际项目中应该上传到服务器
                return img.url;
              }
              return img.url || "";
            })
            .filter(Boolean),
          useful_count: 0,
          is_audited: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        promises.push(
          axios.post("http://localhost:3001/product_comments", commentData)
        );
      }
    }

    await Promise.all(promises);
    ElMessage.success("评价提交成功！");

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push("/order");
      // 触发页面刷新，更新评论状态
      window.dispatchEvent(new Event("comments-updated"));
    }, 1500);
  } catch (error) {
    console.error("提交评价失败:", error);
    ElMessage.error("提交评价失败，请稍后重试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.order-review-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.review-header {
  position: sticky;
  top: 0;
  background: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-icon {
  font-size: 24px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.back-icon:hover {
  color: #f26371;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.review-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.order-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-header-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.order-label {
  font-size: 14px;
  color: #666;
}

.order-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-left: 8px;
}

.review-progress {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.progress-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.products-review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-review-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-info {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.product-spec {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.rating-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.tags-section {
  margin-bottom: 20px;
}

.tags-label {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggested-tag:hover {
  transform: translateY(-2px);
}

.text-review-section {
  margin-bottom: 20px;
}

.hint-text {
  font-size: 12px;
  color: #999;
  margin: 0 0 12px 0;
}

.review-textarea {
  width: 100%;
}

.image-upload-section {
  margin-bottom: 20px;
}

.review-upload :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.review-upload :deep(.el-upload:hover) {
  border-color: #f26371;
}

.submit-section {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 20px;
  margin: 20px -20px -20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.submit-btn {
  width: 100%;
  max-width: 400px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f26371 0%, #ff8a95 100%);
  border: none;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(242, 99, 113, 0.3);
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(242, 99, 113, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
