<template>
  <div class="profile-container">
    <h2 class="page-title">个人中心</h2>
    <!-- 未登录提示 -->
    <div v-if="!userid" class="login-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <el-icon :size="64"><User /></el-icon>
        </div>
        <p class="prompt-text">暂未登录</p>
        <p class="prompt-desc">请先登录后查看个人信息</p>
        <button class="login-btn" @click="goToLogin">去登录</button>
      </div>
    </div>
    <!-- 管理员提示 -->
    <div v-else-if="userStore.isAdmin" class="admin-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <el-icon :size="64"><Lock /></el-icon>
        </div>
        <p class="prompt-text">管理员账号</p>
        <p class="prompt-desc">管理员账号请前往管理后台</p>
        <button class="admin-btn" @click="goToAdmin">前往管理后台</button>
      </div>
    </div>
    <!-- 个人中心内容 -->
    <div v-else class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar :size="120" :src="userAvatar" class="user-avatar">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
            <div class="avatar-edit-overlay" @click="showAvatarDialog = true">
              <el-icon :size="24"><Camera /></el-icon>
            </div>
          </div>
          <div class="user-info">
            <div class="name-edit-section">
              <h3 class="user-name" v-if="!isEditingName">
                {{ userNickname || "未设置昵称" }}
                <el-icon class="edit-icon" @click="startEditName"
                  ><Edit
                /></el-icon>
              </h3>
              <div v-else class="name-edit-input">
                <el-input
                  v-model="editingNickname"
                  placeholder="请输入昵称"
                  maxlength="20"
                  @keyup.enter="saveNickname"
                  @keyup.esc="cancelEditName"
                  ref="nicknameInputRef"
                />
                <div class="edit-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="saveNickname"
                    :loading="saving"
                  >
                    保存
                  </el-button>
                  <el-button size="small" @click="cancelEditName"
                    >取消</el-button
                  >
                </div>
              </div>
            </div>
            <p class="user-id">用户ID: {{ userid }}</p>
          </div>
        </div>
      </div>

      <!-- 头像编辑对话框 -->
      <el-dialog
        v-model="showAvatarDialog"
        title="修改头像"
        width="450px"
        @open="initAvatarDialog"
        @close="resetAvatarForm"
      >
        <div class="avatar-edit-dialog">
          <div class="avatar-preview">
            <el-avatar :size="120" :src="avatarPreview">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="avatar-upload-section">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              accept="image/*"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                选择图片
              </el-button>
            </el-upload>
            <p class="avatar-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
            <div class="avatar-url-section">
              <el-divider>或</el-divider>
              <el-input
                v-model="avatarUrl"
                placeholder="输入头像URL链接"
                @input="updateAvatarPreview"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="showAvatarDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveAvatar"
            :loading="saving || uploading"
            :disabled="uploading"
          >
            {{ uploading ? "上传中..." : "保存" }}
          </el-button>
        </template>
      </el-dialog>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card" @click="goToOrders">
          <div class="stat-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ orderCount }}</p>
            <p class="stat-label">我的订单</p>
          </div>
        </div>
        <div class="stat-card" @click="goToCart">
          <div class="stat-icon">
            <el-icon :size="32"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ cartItemCount }}</p>
            <p class="stat-label">购物车</p>
          </div>
        </div>
      </div>

      <!-- 我的评价板块 -->
      <div class="comments-section">
        <h3 class="section-title">我的评价</h3>
        <div v-if="userComments.length === 0" class="empty-comments">
          <el-icon :size="48" class="empty-icon"><ChatDotRound /></el-icon>
          <p>暂无评价</p>
        </div>
        <div v-else class="comments-list">
          <div
            v-for="comment in userComments"
            :key="comment.id"
            class="comment-item"
            @click="goToProduct(comment.product_id)"
          >
            <div class="comment-product">
              <img
                :src="getProductImage(comment.product_id)"
                :alt="getProductName(comment.product_id)"
                class="product-thumb"
              />
              <div class="product-info">
                <p class="product-name">
                  {{ getProductName(comment.product_id) }}
                </p>
                <p class="comment-time">{{ formatDate(comment.created_at) }}</p>
              </div>
            </div>
            <div class="comment-content">
              <div class="comment-rating" v-if="comment.rating">
                <el-rate
                  :model-value="comment.rating"
                  disabled
                  :size="14"
                  show-score
                  text-color="#ff9900"
                />
              </div>
              <p>{{ comment.content }}</p>
              <div
                class="comment-meta"
                v-if="comment.useful_count !== undefined"
              >
                <span class="useful-count"
                  >有用 ({{ comment.useful_count }})</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <div class="menu-card" @click="goToOrders">
          <el-icon class="menu-icon"><Document /></el-icon>
          <span class="menu-text">我的订单</span>
          <el-icon class="menu-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-card" @click="goToCart">
          <el-icon class="menu-icon"><ShoppingCart /></el-icon>
          <span class="menu-text">购物车</span>
          <el-icon class="menu-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-card" @click="handleLogout">
          <el-icon class="menu-icon"><SwitchButton /></el-icon>
          <span class="menu-text">退出登录</span>
          <el-icon class="menu-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../data_stores/user";
import { useNormalOrdersStore } from "../../data_stores/normal-orders";
import { useCartStore } from "../../data_stores/cart";
import { useProductsStore } from "../../data_stores/products";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import {
  User,
  Document,
  ShoppingCart,
  ArrowRight,
  SwitchButton,
  Edit,
  Camera,
  ChatDotRound,
  Upload,
  Lock,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const normalOrdersStore = useNormalOrdersStore();
const cartStore = useCartStore();
const productsStore = useProductsStore();

const userid = computed(() => userStore.userId);
const userAvatar = computed(() => userStore.userAvatar);
const userNickname = computed(() => userStore.userNickname);

// 订单数量
const orderCount = ref(0);

// 购物车商品数量
const cartItemCount = computed(() => {
  return cartStore.cartItems.reduce((total, item) => total + item.quantity, 0);
});

// 编辑昵称相关
const isEditingName = ref(false);
const editingNickname = ref("");
const nicknameInputRef = ref(null);

// 头像编辑相关
const showAvatarDialog = ref(false);
const avatarUrl = ref("");
const avatarPreview = ref("");
const uploadedFile = ref(null);
const uploading = ref(false);

// 保存状态
const saving = ref(false);

// 我的评价
const userComments = ref([]);

// 跳转到登录页
function goToLogin() {
  router.push("/login");
}

// 跳转到管理后台
function goToAdmin() {
  router.push("/admin/dashboard");
}

// 跳转到订单页
function goToOrders() {
  router.push("/order");
}

// 跳转到购物车
function goToCart() {
  router.push("/cart");
}

// 开始编辑昵称
function startEditName() {
  editingNickname.value = userNickname.value || "";
  isEditingName.value = true;
  nextTick(() => {
    nicknameInputRef.value?.focus();
  });
}

// 取消编辑昵称
function cancelEditName() {
  isEditingName.value = false;
  editingNickname.value = "";
}

// 保存昵称
async function saveNickname() {
  if (!editingNickname.value.trim()) {
    ElMessage.warning("昵称不能为空");
    return;
  }
  if (editingNickname.value.trim() === userNickname.value) {
    cancelEditName();
    return;
  }

  saving.value = true;
  try {
    await userStore.updateUserInfo({
      nickname: editingNickname.value.trim(),
    });
    isEditingName.value = false;
  } catch (error) {
    console.error("保存昵称失败:", error);
  } finally {
    saving.value = false;
  }
}

// 初始化头像对话框
function initAvatarDialog() {
  avatarUrl.value = "";
  avatarPreview.value = userAvatar.value;
  uploadedFile.value = null;
}

// 重置头像表单
function resetAvatarForm() {
  avatarUrl.value = "";
  avatarPreview.value = userAvatar.value;
  uploadedFile.value = null;
}

// 上传前验证
function beforeAvatarUpload(file) {
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

  // 预览图片
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // 不阻止上传，让 http-request 处理
  return true;
}

// 处理头像上传
async function handleAvatarUpload(options) {
  const file = options.file || options;
  if (!file) {
    console.error("没有文件");
    return;
  }

  uploading.value = true;
  uploadedFile.value = file; // 保存文件引用

  try {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", userid.value);

    console.log("开始上传头像，用户ID:", userid.value);

    const response = await axios.post(
      "http://localhost:3002/api/upload/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30秒超时
      }
    );

    console.log("上传响应:", response.data);

    if (response.data && response.data.success) {
      // 使用上传后的路径（服务器返回的路径已经是相对于 public 的）
      // 在 Vite 中，public 目录的文件可以直接通过路径访问
      avatarUrl.value = response.data.path;
      avatarPreview.value = response.data.path;
      ElMessage.success("图片上传成功");
      console.log("头像上传成功，路径:", response.data.path);
    } else {
      throw new Error(response.data?.error || "上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    // 上传失败时清除文件引用，允许用户重新上传
    uploadedFile.value = null;
    avatarUrl.value = "";

    // 如果是网络错误，提示检查服务器
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      ElMessage.error("上传超时，请检查上传服务器是否运行（端口3002）");
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error") ||
      error.message.includes("Failed to fetch")
    ) {
      ElMessage.error(
        "无法连接到上传服务器，请确保服务器运行在 http://localhost:3002。\n运行命令: npm run server"
      );
    } else {
      ElMessage.error(
        error.response?.data?.error || error.message || "上传失败，请稍后重试"
      );
    }
  } finally {
    uploading.value = false;
  }
}

// 更新头像预览
function updateAvatarPreview() {
  if (avatarUrl.value) {
    // 如果是完整 URL，直接使用；否则使用相对路径
    if (avatarUrl.value.startsWith("http")) {
      avatarPreview.value = avatarUrl.value;
    } else {
      // Vite 中 public 目录的文件可以直接通过路径访问
      avatarPreview.value = avatarUrl.value.startsWith("/")
        ? avatarUrl.value
        : `/${avatarUrl.value}`;
    }
  } else {
    avatarPreview.value = userAvatar.value;
  }
}

// 保存头像
async function saveAvatar() {
  // 如果正在上传，提示等待
  if (uploading.value) {
    ElMessage.warning("请等待图片上传完成");
    return;
  }

  // 如果上传了文件但上传失败（没有URL），提示用户重新上传
  if (uploadedFile.value && !avatarUrl.value) {
    ElMessage.warning("图片上传失败，请重新选择图片或输入头像URL");
    uploadedFile.value = null; // 清除失败的文件引用
    return;
  }

  // 如果既没有上传文件也没有输入URL，提示用户
  const finalAvatarUrl = avatarUrl.value?.trim();
  if (!finalAvatarUrl && !uploadedFile.value) {
    ElMessage.warning("请选择图片或输入头像URL");
    return;
  }

  // 如果只有文件但没有URL（可能上传还在进行中），提示等待
  if (uploadedFile.value && !finalAvatarUrl) {
    ElMessage.warning("请等待图片上传完成后再保存");
    return;
  }

  saving.value = true;
  try {
    // 使用上传后的路径或输入的URL
    const avatarPath = finalAvatarUrl || userAvatar.value;

    if (!avatarPath) {
      ElMessage.warning("请选择图片或输入头像URL");
      return;
    }

    console.log("保存头像，路径:", avatarPath);

    await userStore.updateUserInfo({
      avatar: avatarPath,
    });

    ElMessage.success("头像保存成功");
    showAvatarDialog.value = false;
    resetAvatarForm();
  } catch (error) {
    console.error("保存头像失败:", error);
    ElMessage.error("保存头像失败，请稍后重试");
  } finally {
    saving.value = false;
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

// 跳转到商品详情
function goToProduct(productId) {
  router.push({
    name: "ProductDetail",
    params: { id: productId },
  });
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

// 获取我的评价
async function fetchUserComments() {
  if (!userid.value) return;

  try {
    const response = await axios.get(
      `http://localhost:3001/product_comments?user_id=${userid.value}`
    );
    // 按时间倒序排列
    userComments.value = (response.data || []).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (error) {
    console.error("获取评价失败:", error);
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    userStore.logout();
    ElMessage.success("已退出登录");
    router.push("/");
  } catch (error) {
    if (error !== "cancel") {
      console.error("退出登录失败:", error);
    }
  }
}

// 获取订单数量
onMounted(async () => {
  // 如果是管理员，直接重定向到管理后台
  if (userStore.isAdmin) {
    router.push("/admin/dashboard");
    return;
  }

  if (userid.value) {
    try {
      await normalOrdersStore.fetchOrders(userid.value);
      orderCount.value = normalOrdersStore.orders.length;
    } catch (error) {
      console.error("获取订单失败:", error);
    }
    // 确保购物车数据已加载
    try {
      await cartStore.fetchCartData(userid.value);
    } catch (error) {
      console.error("获取购物车失败:", error);
    }
    // 获取商品数据（用于显示评价中的商品信息）
    try {
      await productsStore.fetchProducts();
    } catch (error) {
      console.error("获取商品失败:", error);
    }
    // 获取我的评价
    await fetchUserComments();
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 200px);
}

.page-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 182, 193, 0.2);
  font-family: "Nunito", sans-serif;
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.prompt-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
}

.prompt-icon {
  margin-bottom: 20px;
  color: #ff6b9d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-text {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  font-family: "Nunito", sans-serif;
}

.prompt-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
  font-family: "Nunito", sans-serif;
}

.login-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 100%);
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Nunito", sans-serif;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.35);
}

.login-btn:hover {
  background: linear-gradient(135deg, #ff91a4 0%, #ff6b9d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.45);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 30px;
}

.user-avatar {
  border: 4px solid rgba(255, 182, 193, 0.3);
  box-shadow: 0 8px 24px rgba(255, 182, 193, 0.3);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(255, 182, 193, 0.4);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
  transition: all 0.3s ease;
  border: 3px solid white;
}

.avatar-edit-overlay:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.5);
}

.name-edit-section {
  position: relative;
}

.edit-icon {
  margin-left: 10px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  vertical-align: middle;
}

.edit-icon:hover {
  color: #ff6b9d;
  transform: scale(1.2);
}

.name-edit-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.avatar-edit-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.avatar-preview {
  margin-bottom: 10px;
}

.avatar-upload-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.avatar-uploader {
  width: 100%;
  display: flex;
  justify-content: center;
}

.avatar-url-section {
  width: 100%;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

:deep(.el-divider) {
  margin: 15px 0;
}

:deep(.el-divider__text) {
  color: #999;
  font-size: 12px;
}

.comments-section {
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
  font-family: "Nunito", sans-serif;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 182, 193, 0.2);
}

.empty-comments {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  color: #ddd;
  margin-bottom: 15px;
}

.empty-comments p {
  font-size: 16px;
  margin: 0;
  font-family: "Nunito", sans-serif;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 182, 193, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 182, 193, 0.2);
  border-color: rgba(255, 182, 193, 0.3);
}

.comment-product {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 182, 193, 0.1);
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 182, 193, 0.2);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
  font-family: "Nunito", sans-serif;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin: 0;
  font-family: "Nunito", sans-serif;
}

.comment-content {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  font-family: "Nunito", sans-serif;
}

.comment-content p {
  margin: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
  font-family: "Nunito", sans-serif;
}

.user-id {
  font-size: 16px;
  color: #666;
  margin: 5px 0;
  font-family: "Nunito", sans-serif;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 30px rgba(255, 182, 193, 0.25);
  border-color: rgba(255, 182, 193, 0.4);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 100%);
  border-radius: 16px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b9d;
  margin: 0 0 5px 0;
  font-family: "Nunito", sans-serif;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-family: "Nunito", sans-serif;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-card {
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.menu-card:hover {
  transform: translateX(10px) scale(1.02);
  box-shadow: 0 8px 30px rgba(255, 182, 193, 0.25);
  border-color: rgba(255, 182, 193, 0.4);
}

.menu-icon {
  font-size: 24px;
  color: #ff6b9d;
  transition: all 0.3s ease;
}

.menu-card:hover .menu-icon {
  transform: scale(1.2) rotate(10deg);
}

.menu-text {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: "Nunito", sans-serif;
}

.menu-arrow {
  font-size: 20px;
  color: #999;
  transition: all 0.3s ease;
}

.menu-card:hover .menu-arrow {
  color: #ff6b9d;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .profile-card {
    padding: 30px 20px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .menu-card {
    padding: 18px 20px;
  }

  .menu-text {
    font-size: 16px;
  }
}
</style>
