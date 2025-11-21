<template>
  <div class="orders-container">
    <h2 class="page-title">我的订单</h2>
    <!-- 未登录提示 -->
    <div v-if="!userid" class="login-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <el-icon :size="64"><User /></el-icon>
        </div>
        <p class="prompt-text">暂未登录</p>
        <p class="prompt-desc">请先登录后查看订单信息</p>
        <button class="login-btn" @click="goToLogin">去登录</button>
      </div>
    </div>
    <!-- 订单列表 -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-time">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ order.status }}
          </div>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.product_id"
            class="order-item-wrapper"
          >
            <div class="order-item" @click="goToDetail(item.product_id)">
              <img
                :src="getProductImage(item.product_id)"
                :alt="getProductName(item.product_id)"
                class="product-image"
              />
              <div class="item-info">
                <div class="item-name">
                  {{ getProductName(item.product_id) }}
                </div>
                <div class="item-desc">
                  {{ getProductDesc(item.product_id) }}
                </div>
              </div>
              <div class="item-price-quantity">
                <span class="item-price"
                  >¥{{
                    item.single_price || getProductPrice(item.product_id)
                  }}</span
                >
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <button
                v-if="order.status !== '已取消'"
                class="rebuy-btn"
                @click.stop="rebuyItem(item.product_id)"
              >
                再买一单
              </button>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-summary">
            <div class="summary-item">
              <span>商品总价：</span>
              <span>¥{{ calcTotal(order.items) }}</span>
            </div>
            <div class="summary-item total">
              <span>暂未支付：</span>
              <span class="total-price"
                >¥{{ parseFloat(calcTotal(order.items)).toFixed(2) }}</span
              >
            </div>
          </div>
          <div class="order-actions">
            <button
              :class="[
                'detail-btn',
                { 'detail-btn-alert': order.status === '待客户确认' },
              ]"
              @click="viewOrderDetail(order)"
            >
              <span
                v-if="order.status === '待客户确认'"
                class="alert-badge"
              ></span>
              查看详情
            </button>
            <button
              v-if="order.status === '待客户确认'"
              class="confirm-btn"
              @click="confirmOrderFromList(order.id)"
            >
              确认订单
            </button>
            <button
              v-if="
                order.status === '进行中' ||
                order.status === '待商家确认' ||
                order.status === '待用户确定订单' ||
                order.status === '协商中'
              "
              class="cancel-btn"
              @click="cancelOrder(order.id)"
            >
              取消订单
            </button>
            <button class="delete-btn" @click="deleteOrder(order.id)">
              删除订单
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="70%"
      @close="handleCloseDetailDialog"
    >
      <OrderDetail
        v-if="currentOrderDetail"
        :order="currentOrderDetail"
        @close="handleCloseDetailDialog"
        @update="handleOrderUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "UserOrders",
};
</script>

<script setup>
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useNormalOrdersStore } from "../../data_stores/normal-orders";
import { useCartStore } from "../../data_stores/cart";
import { ElMessage, ElMessageBox, ElIcon } from "element-plus";
import { User } from "@element-plus/icons-vue";
import { useProductsStore } from "../../data_stores/products";
import OrderDetail from "../admin/orders/components/OrderDetail.vue";
import axios from "axios";

const router = useRouter();
const normalOrdersStore = useNormalOrdersStore();
const cartStore = useCartStore();
const productsStore = useProductsStore();
const userid = localStorage.getItem("userId");
const currentUserId = userid;
// const currentUserId = "";

// 订单详情对话框
const detailDialogVisible = ref(false);
const currentOrderDetail = ref(null);

// 跳转到登录页
function goToLogin() {
  router.push("/login");
}

// 定时刷新订单的定时器
let refreshTimer = null;

// 获取订单数据
onMounted(async () => {
  if (!userid) {
    return; // 未登录时不获取订单数据
  }
  try {
    await normalOrdersStore.fetchOrders(currentUserId);
    await productsStore.fetchProducts(); // 确保商品数据已加载

    // 设置定时刷新订单列表（每30秒刷新一次）
    refreshTimer = setInterval(async () => {
      try {
        await normalOrdersStore.fetchOrders(currentUserId);
      } catch (error) {
        console.error("自动刷新订单失败:", error);
      }
    }, 30000); // 30秒刷新一次
  } catch (error) {
    console.error("获取订单失败:", error);
    ElMessage.error("获取订单失败，请重试");
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});

// 订单列表
const orders = computed(() => {
  if (!userid) return [];
  return [...normalOrdersStore.orders].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // 降序排序，最新的在前面
  });
});
console.log(orders);

// 删除订单
async function deleteOrder(orderId) {
  try {
    await ElMessageBox.confirm("确定要删除该订单吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await normalOrdersStore.deleteOrder(orderId);
    ElMessage.success("订单删除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除订单失败:", error);
      ElMessage.error("删除订单失败，请重试");
    }
  }
}

// 从订单列表确认订单（状态变为待商家确认）
async function confirmOrderFromList(orderId) {
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
    await normalOrdersStore.updateOrder(orderId, { status: "待商家确认" });
    ElMessage.success("订单已确认，已返回待商家确认状态");
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认订单失败:", error);
      ElMessage.error("确认订单失败，请重试");
    }
  }
}

// 取消订单
async function cancelOrder(orderId) {
  try {
    await ElMessageBox.confirm("确定要取消该订单吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await normalOrdersStore.updateOrder(orderId, { status: "已取消" });
    ElMessage.success("订单已取消");
  } catch (error) {
    if (error !== "cancel") {
      console.error("取消订单失败:", error);
      ElMessage.error("取消订单失败，请重试");
    }
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

// 计算订单总价
function calcTotal(items) {
  if (!items || !Array.isArray(items)) return 0;
  return items
    .reduce((sum, item) => {
      const price = item.single_price || getProductPrice(item.product_id);
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);
}

// 获取商品信息
function getProductInfo(productId) {
  return (
    productsStore.products.find((product) => product.id === productId) || null
  );
}

// 获取商品图片
function getProductImage(productId) {
  const product = getProductInfo(productId);
  return product?.images || "";
}

// 获取商品名称
function getProductName(productId) {
  const product = getProductInfo(productId);
  return product?.title || `商品 ${productId}`;
}

// 获取商品价格
function getProductPrice(productId) {
  const product = getProductInfo(productId);
  return product?.price_info?.current_price || 0;
}

// 获取商品描述
function getProductDesc(productId) {
  const product = getProductInfo(productId);
  return product?.promotion?.main_description || "暂无描述";
}

// 获取状态对应的样式类
function getStatusClass(status) {
  const statusMap = {
    待商家确认: "status-processing",
    待客户确认: "status-processing",
    待用户确定订单: "status-processing",
    协商中: "status-processing",
    预备出餐中: "status-processing",
    进行中: "status-processing",
    已完成: "status-completed",
    已取消: "status-cancelled",
  };
  return statusMap[status] || "";
}

// 查看订单详情
function viewOrderDetail(order) {
  // 设置用户角色为customer
  localStorage.setItem("userRole", "customer");

  // 格式化订单数据供详情页使用
  const products =
    order.items?.map((item) => {
      const product = productsStore.products.find(
        (p) => p.id === item.product_id
      );
      const price =
        item.single_price || product?.price_info?.current_price || 0;
      return {
        name: product?.title || `商品 ${item.product_id}`,
        price: price,
        quantity: item.quantity,
        image: product?.images || "",
        product_id: item.product_id,
      };
    }) || [];

  // 格式化取餐时间
  const formatDeliveryTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const timeMap = {
        morning: "09:00-12:00",
        afternoon: "12:00-18:00",
        evening: "18:00-21:00",
      };
      const dateMatch = timeStr.match(/^(\d{4}-\d{2}-\d{2})T/);
      const timeMatch = timeStr.match(/T(\w+):/);
      if (dateMatch && timeMatch) {
        const date = dateMatch[1];
        const timeKey = timeMatch[1];
        const timeSlot = timeMap[timeKey] || timeKey;
        return `${date} ${timeSlot}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  currentOrderDetail.value = {
    id: order.id,
    orderNo: `ORDER${String(order.id).padStart(6, "0")}`,
    createTime: order.created_at
      ? new Date(order.created_at).toLocaleString("zh-CN")
      : "",
    totalAmount: order.total_price || "0.00",
    status: order.status || "待商家确认",
    customer: {
      name: order.consignee || "未知",
      phone: order.phone || "",
    },
    delivery_time: formatDeliveryTime(order.delivery_time),
    remark: order.remark || "",
    products: products,
    originalOrder: order, // 保存原始数据
  };

  detailDialogVisible.value = true;
}

// 关闭详情对话框
function handleCloseDetailDialog() {
  detailDialogVisible.value = false;
  currentOrderDetail.value = null;
}

// 订单更新后刷新列表
async function handleOrderUpdate() {
  await normalOrdersStore.fetchOrders(currentUserId);
  // 如果当前订单对话框打开，重新加载当前订单详情
  if (detailDialogVisible.value && currentOrderDetail.value) {
    const orderId = currentOrderDetail.value.id;
    await normalOrdersStore.fetchOrders(currentUserId);
    const updatedOrder = normalOrdersStore.orders.find((o) => o.id === orderId);
    if (updatedOrder) {
      viewOrderDetail(updatedOrder);
    }
  }
}

// 跳转到商品详情
function goToDetail(productId) {
  router.push({
    name: "ProductDetails",
    params: { id: productId },
  });
}

// 再买一单
async function rebuyItem(productId) {
  try {
    // 阻止事件冒泡，避免触发商品详情跳转
    event?.stopPropagation();

    // 获取原订单中的商品数量
    const order = orders.value.find((order) =>
      order.items.some((item) => item.product_id === productId)
    );
    const orderItem = order?.items.find(
      (item) => item.product_id === productId
    );
    const quantity = orderItem?.quantity || 1;

    // 添加到购物车
    await cartStore.addItem(productId, quantity);
    ElMessage.success("已添加到购物车");
  } catch (error) {
    console.error("添加到购物车失败:", error);
    ElMessage.error("添加到购物车失败，请重试");
  }
}
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.page-title {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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

.login-btn:active {
  transform: translateY(0);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 0;
  margin-bottom: 10px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f8f8;
  border-radius: 4px 4px 0 0;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.order-id {
  font-weight: normal;
  color: #666;
  font-size: 12px;
}

.order-time {
  color: #666;
  font-size: 12px;
}

.order-status {
  color: #f26371;
  font-size: 16px;
  font-weight: 700;
  font-family: "Nunito", sans-serif;
}

.status-processing {
  background: #e6f7ff;
  color: #1890ff;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
}

.status-cancelled {
  background: #fff1f0;
  color: #f5222d;
}

.order-items {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item-wrapper {
  position: relative;
  padding-right: 100px;
  margin-bottom: 15px;
}

.order-item-wrapper:last-child {
  margin-bottom: 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  position: relative;
}

.order-item:hover {
  background: transparent;
  transform: none;
  box-shadow: none;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
  border-radius: 0;
  box-shadow: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-size: 12px;
  color: #333;
  text-align: left;
  font-weight: normal;
  line-height: 1.4;
}

.item-desc {
  width: 280px;
  font-size: 12px;
  color: #999;
  margin: 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-attrs {
  font-size: 12px;
  color: #999;
}

.item-price-quantity {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 12px;
  margin-top: 3px;
}

.item-price {
  color: #333;
  font-weight: normal;
  font-size: 16px;
}

.item-quantity {
  color: #999;
  font-size: 12px;
}

.rebuy-btn {
  position: absolute;
  right: 0;
  padding: 5px 12px;
  border-radius: 2px;
  font-size: 12px;
  background: white;
  border: 1px solid #f26371;
  color: #f26371;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
}

.rebuy-btn:hover {
  background: #fff1f0;
}

.rebuy-btn:active {
  background: #f26371;
  color: white;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 0 0 4px 4px;
}

.order-summary {
  display: flex;
  gap: 20px;
  text-align: right;
}

.summary-item {
  display: flex;
  justify-content: flex-end;
  color: #666;
  font-size: 12px;
}

.summary-item.total {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
  color: #333;
}

.total-price {
  color: #f26371;
  font-size: 14px;
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.detail-btn,
.confirm-btn,
.cancel-btn,
.delete-btn {
  padding: 5px 12px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: normal;
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.detail-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 需要确认的订单按钮闪烁提示 */
.detail-btn-alert {
  position: relative;
  border-color: #ff6b6b !important;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white !important;
  animation: blink-button 1.5s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.detail-btn-alert:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
  border-color: #ff5252 !important;
  color: white !important;
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.5);
  transform: translateY(-2px);
}

@keyframes blink-button {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }
  50% {
    opacity: 0.85;
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.6);
  }
}

.alert-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  animation: pulse-badge 1s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

@keyframes pulse-badge {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

.confirm-btn {
  color: #52c41a;
  border-color: #52c41a;
}

.confirm-btn:hover {
  color: #52c41a;
  border-color: #52c41a;
  background: #f6ffed;
}

.cancel-btn:hover,
.delete-btn:hover {
  color: #f26371;
  border-color: #f26371;
}

.shipping-fee {
  color: #999;
  font-size: 12px;
}

@media (max-width: 768px) {
  .orders-container {
    padding: 8px;
  }

  .order-card {
    margin-bottom: 8px;
  }

  .order-header {
    padding: 8px 12px;
  }

  .order-items {
    padding: 12px;
  }

  .order-item {
    flex-direction: row;
    gap: 12px;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .order-footer {
    padding: 8px 12px;
    flex-direction: column;
    gap: 10px;
  }

  .order-summary {
    width: 100%;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
