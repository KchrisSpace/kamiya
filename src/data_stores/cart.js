import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import axios from "axios";

export const useCartStore = defineStore("cart", () => {
  // 从 localStorage 初始化购物车数据
  const initialCartItems = JSON.parse(
    localStorage.getItem("cartItems") || "[]"
  );
  const cartItems = ref(initialCartItems);
  const itemTotals = ref({});
  const isLoading = ref(false);

  // 监听购物车变化并保存到 localStorage
  watch(
    cartItems,
    (newValue) => {
      localStorage.setItem("cartItems", JSON.stringify(newValue));
    },
    { deep: true }
  );

  // 获取购物车数据
  const fetchCartData = async (userId = null) => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      // 如果有用户ID，只获取该用户的购物车
      const url = userId
        ? `http://localhost:3001/cart?user_id=${userId}`
        : `http://localhost:3001/cart`;
      const cartResponse = await axios.get(url);
      cartItems.value = cartResponse.data;

      // 获取每个商品的详细信息
      for (const item of cartItems.value) {
        try {
          const productId = item.product_id || item.id;
          const productResponse = await axios.get(
            `http://localhost:3001/products_list/${productId}`
          );
          item.product = productResponse.data;
        } catch (error) {
          console.error(`获取商品 ${item.product_id || item.id} 信息失败:`, error);
        }
      }

      // 初始化每个商品的总价为0
      cartItems.value.forEach((item) => {
        const itemId = item.id;
        itemTotals.value[itemId] = 0;
      });
    } catch (error) {
      console.error("获取购物车数据失败:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // 初始化时获取数据（如果有用户ID）
  const initialUserId = localStorage.getItem("userId");
  if (cartItems.value.length > 0 && initialUserId) {
    fetchCartData(initialUserId);
  }

  // 计算总价
  const total = computed(() => {
    return cartItems.value
      .reduce((acc, item) => {
        const itemTotal = itemTotals.value[item.id] || 0;
        return acc + itemTotal;
      }, 0)
      .toFixed(2);
  });

  // 更新商品总价
  const updateItemTotal = ({ id, total }) => {
    itemTotals.value[id] = total;
  };

  // 删除商品
  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:3001/cart/${cartItemId}`);
      // 从本地列表中移除商品
      cartItems.value = cartItems.value.filter((item) => item.id !== cartItemId);
      // 删除对应的总价记录
      delete itemTotals.value[cartItemId];
      // 更新本地存储
      localStorage.setItem("cartItems", JSON.stringify(cartItems.value));
    } catch (error) {
      console.error("删除商品失败:", error);
    }
  };

  // 更新商品数量
  const updateCartItem = async (item) => {
    try {
      await axios.put(`http://localhost:3001/cart/${item.id}`, {
        quantity: item.quantity,
      });
    } catch (error) {
      console.error("更新购物车商品失败:", error);
    }
  };

  // 添加商品到购物车
  const addItem = async (productId, quantity = 1, userId = null) => {
    try {
      const currentUserId = userId || localStorage.getItem("userId");
      if (!currentUserId) {
        throw new Error("用户未登录");
      }

      // 检查商品是否已经在当前用户的购物车中
      const existingItem = cartItems.value.find(
        (item) => (item.product_id || item.id) === productId && item.user_id === currentUserId
      );

      if (existingItem) {
        // 如果商品已存在，更新数量
        await axios.put(`http://localhost:3001/cart/${existingItem.id}`, {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        });
      } else {
        // 如果商品不存在，添加新商品
        const cartItemId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await axios.post("http://localhost:3001/cart", {
          id: cartItemId,
          user_id: currentUserId,
          product_id: productId,
          quantity: quantity,
          created_at: new Date().toISOString(),
        });
      }

      // 重新获取购物车数据以确保同步
      await fetchCartData(currentUserId);
      console.log("添加商品到购物车成功");
    } catch (error) {
      console.error("添加商品到购物车失败:", error);
      throw error; // 抛出错误以便组件可以处理
    }
  };

  // 清空购物车
  const clearCart = async (userId = null) => {
    try {
      const currentUserId = userId || localStorage.getItem("userId");
      // 只清空当前用户的购物车
      const userCartItems = currentUserId
        ? cartItems.value.filter((item) => item.user_id === currentUserId)
        : cartItems.value;

      // 清空服务器数据
      for (const item of userCartItems) {
        await axios.delete(`http://localhost:3001/cart/${item.id}`);
      }
      // 清空本地状态（只移除当前用户的商品）
      if (currentUserId) {
        cartItems.value = cartItems.value.filter((item) => item.user_id !== currentUserId);
      } else {
        cartItems.value = [];
      }
      itemTotals.value = {};
      // 清空 localStorage
      localStorage.setItem("cartItems", JSON.stringify(cartItems.value));
    } catch (error) {
      console.error("清空购物车失败:", error);
      throw error;
    }
  };

  return {
    cartItems,
    itemTotals,
    total,
    fetchCartData,
    updateItemTotal,
    removeItem,
    updateCartItem,
    clearCart,
    addItem,
    isLoading,
  };
});
