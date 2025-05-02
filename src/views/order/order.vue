<template>
  <div class="orders-container">
    <h2 class="page-title">我的订单</h2>
    <div class="orders-list">
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
            <div class="summary-item">
              <span>运费：</span>
              <span class="shipping-fee">¥{{ order.shipping_fee || 0 }}</span>
            </div>
            <div class="summary-item total">
              <span>实付款：</span>
              <span class="total-price"
                >¥{{
                  (
                    parseFloat(calcTotal(order.items)) +
                    (order.shipping_fee || 0)
                  ).toFixed(2)
                }}</span
              >
            </div>
          </div>
          <div class="order-actions">
            <button
              v-if="order.status === '进行中'"
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
  </div>
</template>

<script>
export default {
  name: "UserOrders",
};
</script>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useNormalOrdersStore } from "../../data_stores/normal-orders";
import { useCartStore } from "../../data_stores/cart";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProductsStore } from "../../data_stores/products";

const router = useRouter();
const normalOrdersStore = useNormalOrdersStore();
const cartStore = useCartStore();
const productsStore = useProductsStore();
const currentUserId = "02";

// 获取订单数据
onMounted(async () => {
  try {
    await normalOrdersStore.fetchOrders(currentUserId);
    await productsStore.fetchProducts(); // 确保商品数据已加载
  } catch (error) {
    console.error("获取订单失败:", error);
    ElMessage.error("获取订单失败，请重试");
  }
});

// 订单列表
const orders = computed(() => {
  return [...normalOrdersStore.orders].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // 降序排序，最新的在前面
  });
});

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
    进行中: "status-processing",
    已完成: "status-completed",
    已取消: "status-cancelled",
  };
  return statusMap[status] || "";
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
  font-size: 12px;
  font-weight: normal;
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
