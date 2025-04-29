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

  // 监听购物车变化并保存到 localStorage
  watch(
    cartItems,
    (newValue) => {
      localStorage.setItem("cartItems", JSON.stringify(newValue));
    },
    { deep: true }
  );

  // 获取购物车数据
  const fetchCartData = async () => {
    try {
      const cartResponse = await axios.get("http://localhost:3000/cart");
      cartItems.value = cartResponse.data;

      // 获取每个商品的详细信息
      for (const item of cartItems.value) {
        try {
          const productResponse = await axios.get(
            `http://localhost:3000/product_list/${item.id}`
          );
          item.product = productResponse.data;
        } catch (error) {
          console.error(`获取商品 ${item.id} 信息失败:`, error);
        }
      }

      // 初始化每个商品的总价为0
      cartItems.value.forEach((item) => {
        itemTotals.value[item.id] = 0;
      });
    } catch (error) {
      console.error("获取购物车数据失败:", error);
    }
  };

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
  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/cart/${productId}`);
      // 从本地列表中移除商品
      cartItems.value = cartItems.value.filter((item) => item.id !== productId);
      // 删除对应的总价记录
      delete itemTotals.value[productId];
      // 重新获取购物车数据以确保同步
      await fetchCartData();
      // 重新计算总价
      cartItems.value.forEach((item) => {
        if (!itemTotals.value[item.id]) {
          itemTotals.value[item.id] =
            (item.product?.price_info?.current_price || 0) * item.quantity;
        }
      });
    } catch (error) {
      console.error("删除商品失败:", error);
    }
  };

  // 更新商品数量
  const updateCartItem = async (item) => {
    try {
      await axios.put(`http://localhost:3000/cart/${item.id}`, {
        quantity: item.quantity,
      });
    } catch (error) {
      console.error("更新购物车商品失败:", error);
    }
  };

  // 添加商品到购物车
  const addItem = async (productId, quantity = 1) => {
    try {
      // 检查商品是否已经在购物车中
      console.log("cartItems.value", cartItems.value);
      const existingItem = cartItems.value.find(
        (item) => item.id === productId
      );

      if (existingItem) {
        // 如果商品已存在，更新数量
        await axios.put(`http://localhost:3000/cart/${productId}`, {
          quantity: existingItem.quantity + quantity,
        });
      } else {
        // 如果商品不存在，添加新商品
        await axios.post("http://localhost:3000/cart", {
          id: productId,
          quantity: quantity,
        });
      }

      // 重新获取购物车数据以确保同步
      await fetchCartData();
      console.log("添加商品到购物车成功");
    } catch (error) {
      console.error("添加商品到购物车失败:", error);
      throw error; // 抛出错误以便组件可以处理
    }
  };

  // 清空购物车
  const clearCart = async () => {
    try {
      // 清空本地状态
      cartItems.value = [];
      itemTotals.value = {};
      // 清空 localStorage
      localStorage.removeItem("cartItems");
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
  };
});
