import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useWishlistStore = defineStore("wishlist", () => {
  // 状态
  const wishlistItems = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // 计算属性
  const totalItems = computed(() => wishlistItems.value.length);
  const isEmpty = computed(() => totalItems.value === 0);

  // 获取心愿单数据
  const fetchWishlistData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("http://localhost:3001/wishlist");
      wishlistItems.value = response.data;

      // 获取每个商品的详细信息
      for (const item of wishlistItems.value) {
        try {
          const productResponse = await axios.get(
            `http://localhost:3001/product_list/${item.id}`
          );
          item.product = productResponse.data;
        } catch (error) {
          console.error(`获取商品 ${item.id} 信息失败:`, error);
        }
      }
    } catch (error) {
      error.value = error.message;
      wishlistItems.value = [];
      console.error("获取心愿单数据失败:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // 删除商品
  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:3001/wishlist/${productId}`);
      // 从本地列表中移除商品
      wishlistItems.value = wishlistItems.value.filter(
        (item) => item.id !== productId
      );
      // 重新获取心愿单数据以确保同步
      await fetchWishlistData();
    } catch (error) {
      console.error("删除商品失败:", error);
    }
  };

  // 添加商品到心愿单
  const addItem = async (productId) => {
    try {
      // 检查商品是否已经在心愿单中
      const existingItem = wishlistItems.value.find(
        (item) => item.id === productId
      );

      if (!existingItem) {
        // 如果商品不存在，添加新商品
        await axios.post("http://localhost:3001/wishlist", {
          id: productId,
          created_at: new Date().toISOString(),
        });
        // 重新获取心愿单数据以确保同步
        await fetchWishlistData();
      }
    } catch (error) {
      console.error("添加商品到心愿单失败:", error);
      throw error;
    }
  };

  // 清空心愿单
  const clearWishlist = async () => {
    try {
      // 清空服务器数据
      for (const item of wishlistItems.value) {
        await axios.delete(`http://localhost:3001/wishlist/${item.id}`);
      }
      // 清空本地状态
      wishlistItems.value = [];
    } catch (error) {
      console.error("清空心愿单失败:", error);
    }
  };

  return {
    // 状态
    wishlistItems,
    isLoading,
    error,

    // 计算属性
    totalItems,
    isEmpty,

    // 方法
    fetchWishlistData,
    removeItem,
    addItem,
    clearWishlist,
  };
});
