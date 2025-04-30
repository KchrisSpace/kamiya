<!--  -->
<template>
  <div class="cart">
    <div class="cart-container" v-if="cartStore.cartItems.length > 0">
      <div class="cart-item" v-for="item in cartStore.cartItems" :key="item.id">
        <button class="remove-btn" @click="removeItem(item.id)">X</button>
        <img
          class="item-image"
          :src="item.product?.images || 'https://via.placeholder.com/150'"
          :alt="item.product?.title"
        />
        <div class="item-info">
          <span class="item-name">{{
            item.product?.title || "加载中..."
          }}</span>
          <span class="item-price"
            >¥{{ item.product?.price_info.current_price || "加载中..." }}</span
          >
          <div class="counter">
            <button @click="decrement(item)">-</button>
            <span class="count-input">
              <input
                type="number"
                v-model.number="item.quantity"
                min="1"
                @change="handleQuantityChange(item)"
              />
            </span>
            <button @click="increment(item)">+</button>
          </div>
        </div>
        <p class="total-price">¥{{ calculateItemTotal(item).toFixed(2) }}</p>
      </div>
    </div>
    <div v-else class="empty-cart">
      <p>购物车是空的</p>
    </div>
    <!-- 合计付款 -->
    <div class="checkout-area" v-if="cartStore.cartItems.length > 0">
      <p class="total">
        订单总计：<i>￥{{ lastTotalPrice.toFixed(2) }}</i>
      </p>
      <button class="pay-button" @click="createOrder">去创建订单</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../data_stores/cart";
import { ElMessage } from "element-plus";

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

onMounted(async () => {
  await cartStore.fetchCartData();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.cart {
  width: 100vw;
  /* height: 100vh; */
  position: relative;
}

.cart-container {
  margin: 10px;
  width: 80%;
  height: 60vh;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);

  overflow-y: auto;
}

.cart-container::-webkit-scrollbar {
  width: 8px;
}

.cart-container::-webkit-scrollbar-track {
  background: #fdfdfd;
  border: 1px solid #e9bfbf;
  border-radius: 4px;
}

.cart-container::-webkit-scrollbar-thumb {
  background: #ff6b6b3a;
  border-radius: 4px;
}

.cart-container::-webkit-scrollbar-thumb:hover {
  background: #ff6b6b;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  position: relative;
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
}

.remove-btn:hover {
  color: #ff6b6b;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
}

.item-price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: 500;
}

.counter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.counter button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  color: #000;
  cursor: pointer;
  font-size: 16px;
}

.counter button:hover {
  background: #f5f5f5;
}

.count-input input {
  width: 50px;
  height: 30px;
  text-align: center;
  border: 1px solid #ddd;
}

.total-price {
  margin-left: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #ff6b6b;
}

.checkout-area {
  position: fixed;
  right: 150px;
  display: flex;
  flex-direction: column;
}

.total {
  font-size: 20px;
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
  margin-top: 40px;
  padding: 10px 30px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pay-button:hover {
  background-color: #ff5252;
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}
</style>
