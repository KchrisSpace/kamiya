<template>
  <div class="order-detail">
    <!-- 需要确认的闪烁提示 -->
    <div v-if="order.status === '待客户确认' && !isAdmin" class="confirm-alert">
      <div class="alert-content">
        <el-icon class="alert-icon"><WarningFilled /></el-icon>
        <span class="alert-text">订单需要您的确认，请查看详情并确认订单</span>
      </div>
    </div>

    <el-descriptions title="订单信息" :column="2" border>
      <el-descriptions-item label="订单号">{{
        order.orderNo
      }}</el-descriptions-item>
      <el-descriptions-item label="下单时间">{{
        order.createTime
      }}</el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="getStatusType(order.status)">
          {{ getStatusName(order.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="订单金额"
        >¥{{ order.totalAmount }}</el-descriptions-item
      >
    </el-descriptions>

    <div class="pickup-info-compact mt-20">
      <div class="info-row">
        <span class="info-label">姓名：</span>
        <span class="info-value">{{ order.customer?.name || "未知" }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">电话：</span>
        <span class="info-value">{{ order.customer?.phone || "" }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">预计取餐时间：</span>
        <span class="info-value">{{ order.delivery_time || "" }}</span>
      </div>
    </div>

    <div class="mt-20">
      <h3>商品信息</h3>
      <el-table :data="order.products || []" style="width: 100%">
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <img
              :src="row.image"
              :alt="row.name"
              class="product-image"
              v-if="row.image"
            />
            <span v-else class="no-image">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }"> ¥{{ row.price }} </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ (row.price * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="mt-20" v-if="order.remark">
      <h3>订单备注</h3>
      <p class="remark-text">{{ order.remark }}</p>
    </div>

    <!-- 交流协商区域 -->
    <div class="communication-section mt-20">
      <h3>订单协商</h3>

      <!-- 协商记录列表 -->
      <div
        class="communication-list"
        v-if="communications && communications.length > 0"
      >
        <div
          v-for="(msg, index) in communications"
          :key="index"
          :class="[
            'message-item',
            msg.role === 'admin' ? 'admin-message' : 'customer-message',
          ]"
        >
          <div class="message-header">
            <span class="message-role">{{
              msg.role === "admin" ? "商家" : "客户"
            }}</span>
            <span class="message-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div class="message-content">
            <p v-if="msg.text" class="message-text">{{ msg.text }}</p>
            <div
              v-if="msg.images && msg.images.length > 0"
              class="message-images"
            >
              <img
                v-for="(img, imgIndex) in msg.images"
                :key="imgIndex"
                :src="img"
                alt="协商图片"
                class="message-image"
                @click="previewImage(img)"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-communication">
        <p>暂无协商记录</p>
      </div>

      <!-- 发送消息区域 -->
      <div class="send-message-area">
        <el-input
          v-model="newMessage"
          type="textarea"
          :rows="3"
          placeholder="输入协商内容..."
          class="message-input"
        />
        <div class="upload-section">
          <el-upload
            v-model:file-list="uploadedImages"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handleImagePreview"
            :on-remove="handleImageRemove"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
        <div class="action-buttons">
          <!-- 管理员按钮 -->
          <template v-if="isAdmin">
            <!-- 待商家确认状态：确认订单和协商订单 -->
            <el-button
              v-if="order.status === '待商家确认'"
              type="success"
              @click="handleConfirmOrder"
            >
              确认订单
            </el-button>
            <el-button
              v-if="order.status === '待商家确认'"
              type="warning"
              @click="handleNegotiateOrder"
            >
              协商订单
            </el-button>
            <!-- 待客户确认状态：确认订单和协商订单 -->
            <el-button
              v-if="order.status === '待客户确认'"
              type="success"
              @click="handleConfirmOrder"
            >
              确认订单
            </el-button>
            <el-button
              v-if="order.status === '待客户确认'"
              type="warning"
              @click="handleNegotiateOrder"
            >
              协商订单
            </el-button>
            <!-- 其他状态：协商订单 -->
            <el-button
              v-if="
                order.status === '待用户确定订单' ||
                order.status === '协商中' ||
                order.status === '预备出餐中'
              "
              type="warning"
              @click="handleNegotiateOrder"
              :disabled="!newMessage.trim() && uploadedImages.length === 0"
            >
              协商订单
            </el-button>
          </template>
          <!-- 客户按钮 -->
          <template v-else>
            <!-- 待客户确认状态：确认订单和协商订单 -->
            <el-button
              v-if="order.status === '待客户确认'"
              type="success"
              @click="confirmOrder"
            >
              确认订单
            </el-button>
            <el-button
              v-if="order.status === '待客户确认'"
              type="warning"
              @click="handleNegotiateOrder"
            >
              协商订单
            </el-button>
            <!-- 待商家确认状态：协商订单 -->
            <el-button
              v-if="order.status === '待商家确认'"
              type="warning"
              @click="handleNegotiateOrder"
              :disabled="!newMessage.trim() && uploadedImages.length === 0"
            >
              协商订单
            </el-button>
            <!-- 其他状态：协商订单 -->
            <el-button
              v-if="
                order.status === '协商中' ||
                order.status === '待用户确定订单' ||
                order.status === '预备出餐中'
              "
              type="warning"
              @click="handleNegotiateOrder"
              :disabled="!newMessage.trim() && uploadedImages.length === 0"
            >
              协商订单
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <div class="footer">
      <el-button @click="$emit('close')">关闭</el-button>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imagePreviewVisible" title="图片预览" width="50%">
      <img :src="previewImageUrl" alt="预览" class="preview-image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, WarningFilled } from "@element-plus/icons-vue";
import axios from "axios";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "update"]);

// 判断是否为管理员（这里可以根据实际需求调整）
const isAdmin = computed(() => {
  // 可以从localStorage或其他地方获取用户角色
  // 如果是在admin路由下，默认为admin；否则从localStorage获取
  const userRole = localStorage.getItem("userRole");
  if (userRole) {
    return userRole === "admin";
  }
  // 默认根据路由判断
  const path = window.location.pathname;
  return path.includes("/admin");
});

const newMessage = ref("");
const uploadedImages = ref([]);
const imagePreviewVisible = ref(false);
const previewImageUrl = ref("");

// 协商记录
const communications = computed(() => {
  const comms = props.order?.originalOrder?.communications || [];
  // 确保返回数组
  return Array.isArray(comms) ? comms : [];
});

const getStatusType = (status) => {
  const types = {
    待商家确认: "warning",
    待客户确认: "warning",
    待用户确定订单: "warning",
    协商中: "warning",
    预备出餐中: "primary",
    进行中: "primary",
    已完成: "success",
    已取消: "danger",
  };
  return types[status] || "info";
};

const getStatusName = (status) => {
  // 用户端将"已出餐"显示为"可取餐"，管理员端保持原样
  if (!isAdmin.value && status === "已出餐") {
    return "可取餐";
  }
  return status || "未知";
};

const order = computed(() => {
  const o = props.order || {};
  // 确保products是数组
  if (!o.products || !Array.isArray(o.products)) {
    o.products = [];
  }
  return o;
});

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  try {
    const date = new Date(timeStr);
    return date.toLocaleString("zh-CN");
  } catch {
    return timeStr;
  }
};

// 图片预览
const previewImage = (url) => {
  previewImageUrl.value = url;
  imagePreviewVisible.value = true;
};

// 处理图片预览
const handleImagePreview = (file) => {
  if (file.url) {
    previewImageUrl.value = file.url;
  } else if (file.raw) {
    previewImageUrl.value = URL.createObjectURL(file.raw);
  }
  imagePreviewVisible.value = true;
};

// 将文件转换为base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 移除图片
const handleImageRemove = (file, fileList) => {
  uploadedImages.value = fileList;
};

// 申请协商
const requestNegotiation = async () => {
  try {
    await ElMessageBox.confirm("确定要申请订单协商吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;
    const updatedOrder = {
      ...originalOrder,
      status: "待客户确认",
      communications: [
        ...communications.value,
        {
          role: "admin",
          text: "商家申请订单协商",
          created_at: new Date().toISOString(),
          images: [],
        },
      ],
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );
    ElMessage.success("已申请协商，等待客户确认");
    emit("update");
  } catch (error) {
    if (error !== "cancel") {
      console.error("申请协商失败:", error);
      ElMessage.error("申请协商失败");
    }
  }
};

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() && uploadedImages.value.length === 0) {
    ElMessage.warning("请输入消息内容或上传图片");
    return;
  }

  try {
    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;

    // 将上传的图片转换为base64
    const imagePromises = uploadedImages.value.map(async (file) => {
      if (file.url && file.url.startsWith("data:")) {
        // 已经是base64格式
        return file.url;
      } else if (file.url) {
        // 如果是已有的URL，直接使用
        return file.url;
      } else if (file.raw) {
        // 新上传的文件，转换为base64
        return await fileToBase64(file.raw);
      }
      return "";
    });

    const imageUrls = await Promise.all(imagePromises);

    const newCommunication = {
      role: isAdmin.value ? "admin" : "customer",
      text: newMessage.value.trim(),
      images: imageUrls.filter((url) => url),
      created_at: new Date().toISOString(),
    };

    // 确定新的订单状态（发送消息时不改变状态，保持当前状态）
    let newStatus = order.value.status;

    const updatedOrder = {
      ...originalOrder,
      communications: [...communications.value, newCommunication],
      status: newStatus,
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );
    ElMessage.success("消息发送成功");

    // 清空输入
    newMessage.value = "";
    uploadedImages.value = [];

    emit("update");
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
  }
};

// 管理员确认订单（根据当前状态确定新状态）
const handleConfirmOrder = async () => {
  try {
    const currentStatus = order.value.status;
    let confirmMessage = "确定要确认此订单吗？";
    let newStatus = "预备出餐中";

    if (currentStatus === "待商家确认") {
      confirmMessage = "确定要确认此订单吗？确认后订单将进入预备出餐状态。";
      newStatus = "预备出餐中";
    } else if (currentStatus === "待客户确认") {
      confirmMessage = "确定要确认此订单吗？确认后订单将进入预备出餐状态。";
      newStatus = "预备出餐中";
    }

    await ElMessageBox.confirm(confirmMessage, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;
    const updatedOrder = {
      ...originalOrder,
      status: newStatus,
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );
    ElMessage.success("订单已确认，进入预备出餐状态");
    emit("update");
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认订单失败:", error);
      ElMessage.error("确认订单失败");
    }
  }
};

// 协商订单（根据角色改变状态并添加协商记录）
const handleNegotiateOrder = async () => {
  if (!newMessage.value.trim() && uploadedImages.value.length === 0) {
    ElMessage.warning("请输入协商内容或上传图片");
    return;
  }

  try {
    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;

    // 获取协商区域的内容
    const negotiateText =
      newMessage.value.trim() || "发起了订单协商，请查看订单详情。";

    // 处理图片
    let imageUrls = [];
    if (uploadedImages.value.length > 0) {
      imageUrls = await Promise.all(
        uploadedImages.value.map(async (file) => {
          if (file.url && file.url.startsWith("data:")) {
            return file.url;
          } else if (file.url) {
            return file.url;
          } else if (file.raw) {
            return await fileToBase64(file.raw);
          }
          return "";
        })
      );
      imageUrls = imageUrls.filter((url) => url);
    }

    // 根据角色确定新的订单状态
    let newStatus = order.value.status;
    if (isAdmin.value) {
      // 商家点击协商订单，状态变为待客户确认
      newStatus = "待客户确认";
    } else {
      // 客户点击协商订单，状态变为待商家确认
      newStatus = "待商家确认";
    }

    // 添加协商记录
    const newCommunication = {
      role: isAdmin.value ? "admin" : "customer",
      text: negotiateText,
      images: imageUrls,
      created_at: new Date().toISOString(),
    };

    const updatedOrder = {
      ...originalOrder,
      status: newStatus,
      communications: [...communications.value, newCommunication],
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );

    // 清空输入框
    newMessage.value = "";
    uploadedImages.value = [];

    ElMessage.success("协商订单已发起，等待对方确认");
    emit("update");
  } catch (error) {
    console.error("协商订单失败:", error);
    ElMessage.error("协商订单失败");
  }
};

// 客户确认订单（状态变为待商家确认）
const handleCustomerConfirm = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要确认此订单吗？确认后订单将返回待商家确认状态。",
      "确认订单",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;
    const updatedOrder = {
      ...originalOrder,
      status: "待商家确认",
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );
    ElMessage.success("订单已确认，已返回待商家确认状态");
    emit("update");
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认订单失败:", error);
      ElMessage.error("确认订单失败");
    }
  }
};

// 客户确认订单（状态变为进行中）- 保留用于其他场景
const confirmOrder = async () => {
  try {
    await ElMessageBox.confirm("确定要确认此订单吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const orderId = order.value.originalOrder?.id || order.value.id;
    const originalOrder = order.value.originalOrder || order.value;
    const updatedOrder = {
      ...originalOrder,
      status: "进行中",
    };

    await axios.put(
      `http://localhost:3001/normal_orders/${orderId}`,
      updatedOrder
    );
    ElMessage.success("订单已确认");
    emit("update");
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认订单失败:", error);
      ElMessage.error("确认订单失败");
    }
  }
};
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.remark-text {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.footer {
  margin-top: 20px;
  text-align: right;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.no-image {
  color: #999;
  font-size: 12px;
}

.pickup-info-compact {
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #666;
  font-weight: 500;
  min-width: 100px;
}

.info-value {
  color: #333;
}

.communication-section {
  border-top: 2px solid #eee;
  padding-top: 20px;
}

.communication-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message-item {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f5f5f5;
}

.admin-message {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.customer-message {
  background: #f3e5f5;
  border-left: 4px solid #9c27b0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.message-role {
  font-weight: 600;
  color: #666;
}

.message-time {
  color: #999;
}

.message-content {
  margin-top: 8px;
}

.message-text {
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.6;
}

.message-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.message-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.05);
}

.no-communication {
  text-align: center;
  padding: 40px;
  color: #999;
}

.send-message-area {
  margin-top: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.message-input {
  margin-bottom: 12px;
}

.upload-section {
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* 需要确认的闪烁提示 */
.confirm-alert {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.alert-icon {
  font-size: 24px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.alert-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
