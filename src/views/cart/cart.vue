<!--  -->
<template>
  <div class="cart">
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-icon">
        <el-icon><ShoppingCart /></el-icon>
      </div>
    </div>
    <div v-if="cartStore.isLoading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <template v-else>
      <div class="cart-container" :class="{ 'empty-state': cartStore.cartItems.length === 0 }">
        <div v-if="cartStore.cartItems.length > 0">
          <div
            class="cart-item"
            v-for="item in cartStore.cartItems"
            :key="item.id"
          >
            <button class="remove-btn" @click="removeItem(item.id)">
              <el-icon><Close /></el-icon>
            </button>
            <img
              class="item-image"
              :src="item.product?.images"
              :alt="item.product?.title"
            />
            <div class="item-info">
              <span class="item-name">{{ item.product?.title }}</span>
              <span class="item-price"
                >¥{{ item.product?.price_info.current_price }}</span
              >

              <div class="counter">
                <button @click="decrement(item)">
                  <el-icon><Minus /></el-icon>
                </button>
                <span class="count-input">
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    min="1"
                    @change="handleQuantityChange(item)"
                  />
                </span>
                <button @click="increment(item)">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
            </div>
            <p class="total-price">
              ¥{{ calculateItemTotal(item).toFixed(2) }}
            </p>
          </div>
        </div>
        <div v-else class="empty-cart">
          <el-icon class="empty-icon"><ShoppingCart /></el-icon>
          <p>购物车是空的</p>
          <p class="empty-tip">快去挑选美味的甜点吧~</p>
        </div>
      </div>
      <!-- 合计付款 -->
      <div class="checkout-area" v-if="cartStore.cartItems.length > 0">
        <div class="total-wrapper">
          <p class="total">
            订单总计：<i>￥{{ lastTotalPrice.toFixed(2) }}</i>
          </p>
          <div class="sweet-decoration"></div>
        </div>
        <button class="pay-button" @click="createOrder">
          <el-icon><ShoppingCart /></el-icon>
          去创建订单
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../data_stores/cart";
import { ElMessage } from "element-plus";
import { ShoppingCart, Close, Plus, Minus } from "@element-plus/icons-vue";

const router = useRouter();
const cartStore = useCartStore();
const lastTotalPrice = ref(0);

const calculateItemTotal = (item) => {
  if (!item.product?.price_info?.current_price) return 0;
  return item.quantity * item.product.price_info.current_price;
};

const calculateTotal = () => {
  return cartStore.cartItems.reduce((total, item) => {
    return total + calculateItemTotal(item);
  }, 0);
};

// 监听总价变化，更新lastTotalPrice
watch(
  () => calculateTotal(),
  (newTotal) => {
    lastTotalPrice.value = newTotal;
  },
  { immediate: true }
);

const createOrder = () => {
  if (cartStore.cartItems.length === 0) {
    ElMessage.warning("购物车为空，请先添加商品");
    return;
  }
  router.push("/create-order");
};

const handleQuantityChange = (item) => {
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  updateCartItem(item);
};

const increment = (item) => {
  item.quantity += 1;
  updateCartItem(item);
};

const decrement = (item) => {
  if (item.quantity > 1) {
    item.quantity -= 1;
    updateCartItem(item);
  }
};

const updateCartItem = (item) => {
  cartStore.updateCartItem({
    id: item.id,
    quantity: item.quantity,
  });
};

const removeItem = async (itemId) => {
  try {
    // 先保存当前总价
    const currentTotal = lastTotalPrice.value;
    // 移除商品
    await cartStore.removeItem(itemId);
    // 如果移除后购物车为空，总价设为0
    if (cartStore.cartItems.length === 0) {
      lastTotalPrice.value = 0;
    }
    ElMessage.success("商品已从购物车移除");
  } catch (error) {
    console.error("删除商品失败:", error);
    ElMessage.error("删除商品失败，请重试");
  }
};

import { useUserStore } from "../../data_stores/user";

const userStore = useUserStore();

onMounted(async () => {
  const userId = userStore.userId;
  if (cartStore.cartItems.length === 0) {
    await cartStore.fetchCartData(userId);
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.cart {
  width: 100vw;
  height: 80vh;
  position: relative;
  background-color: var(--background-color);
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.cart-header h2 {
  color: #ff6b6b;
  font-size: 20px;
  margin: 0;
}

.cart-icon {
  background-color: #ff6b6b;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.cart-container {
  margin: 0 auto;
  width: 90%;
  height: calc(80vh - 180px);
  padding: 35px;
  border-radius: 15px;
  box-shadow: 0 0 20px 0 rgba(255, 107, 107, 0.1);
  background-color: white;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.cart-container.empty-state {
  overflow-y: hidden;
  justify-content: center;
  align-items: center;
}

.cart-container::-webkit-scrollbar {
  width: 6px;
}

.cart-container::-webkit-scrollbar-track {
  background: #fff5f5;
  border-radius: 3px;
}

.cart-container::-webkit-scrollbar-thumb {
  background: #ffd3d3;
  border-radius: 3px;
}

.cart-container::-webkit-scrollbar-thumb:hover {
  background: #ff6b6b;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ffe0e0;
  position: relative;
  transition: all 0.3s ease;
  min-height: 100px;
}

.cart-item:hover {
  background-color: #fff5f5;
  border-radius: 10px;
}

.remove-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  color: #ff6b6b;
  transform: scale(1.2);
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  color: #ff6b6b;
  font-size: 16px;
  font-weight: 500;
}

.counter {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
}

.counter button {
  width: 24px;
  height: 34px;
  border: 1px solid #ffd3d3;
  background: white;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 14px;
  border-radius: 250%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.count-input {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.count-input input {
  width: 34px;
  height: 34px;
  text-align: center !important;
  border: 1px solid #ffd3d3;
  border-radius: 50%;
  color: #ff6b6b;
  font-size: 14px;
  padding: 0 !important;
  margin: 0;
  line-height: 34px;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  direction: ltr;
  text-indent: 0;
}

/* 隐藏 number 类型 input 的上下加减按钮 */
.count-input input::-webkit-outer-spin-button,
.count-input input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}

.count-input input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}
.total-price {
  margin-left: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #ff6b6b;
  flex-shrink: 0;
}

.checkout-area {
  position: fixed;
  right: 80px;
  bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.total-wrapper {
  position: relative;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 0 20px 0 rgba(255, 107, 107, 0.1);
  min-width: 250px;
}

.sweet-decoration {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 15px;
  background-color: #ff6b6b;
  border-radius: 15px 15px 0 0;
}

.total {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.total i {
  color: #ff6b6b;
  font-style: normal;
  margin: 0 5px;
}

.pay-button {
  margin-top: 15px;
  padding: 12px 30px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.pay-button:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  color: #666;
  flex: 1;
}

.empty-icon {
  font-size: 36px;
  color: #ffd3d3;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 4px;
}

.loading {
  padding: 15px;
  width: 90%;
  margin: 0 auto;
  height: calc(100vh - 180px);
}

:deep(.el-skeleton) {
  padding: 15px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 0 20px 0 rgba(255, 107, 107, 0.1);
}
</style>
