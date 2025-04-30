<!--  -->
<template>
  <div>
    <Header2 title="心愿单" subtext="wish list" />
    <div class="wishlist-container">
      <div v-if="wishlistStore.isLoading" class="loading-state">
        <p>正在加载心愿单...</p>
      </div>
      <div v-else-if="wishlistStore.isEmpty" class="empty-state">
        <p>您的心愿单是空的</p>
      </div>
      <div v-else class="wishlist-items">
        <div
          v-for="item in wishlistStore.wishlistItems"
          :key="item.id"
          class="wishlist-item"
        >
          <button class="delete-btn" @click="removeFromWishlist(item.id)">
            ×
          </button>
          <div class="item-image">
            <img :src="item.product?.images[0]" :alt="item.product?.title" />
          </div>
          <div class="item-details">
            <div class="item-info">
              <h3 class="item-title">{{ item.product?.title }}</h3>
              <p class="item-price">
                ¥{{ item.product?.price_info?.current_price }}
              </p>
            </div>
          </div>
          <div class="item-promotion">
            <p class="flower-language">
              {{ item.product?.promotion?.flower_language }}
            </p>
            <p class="promotion-desc">
              {{ item.product?.promotion?.main_description }}
            </p>
          </div>
          <div class="item-actions">
            <button class="add-to-cart-btn" @click="moveToCart(item)">
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header2 from "../components/Header2.vue";
import { useWishlistStore } from "../stores/wishlist.js";
import { useCartStore } from "../stores/cart";
import { onMounted } from "vue";

const wishlistStore = useWishlistStore();
const cartStore = useCartStore();

const removeFromWishlist = async (productId) => {
  try {
    await wishlistStore.removeItem(productId);
  } catch (error) {
    console.error("删除商品失败:", error);
  }
};

const moveToCart = async (item) => {
  try {
    await cartStore.addItem(item.id);
    await wishlistStore.removeItem(item.id);
  } catch (error) {
    console.error("移动商品到购物车失败:", error);
  }
};

onMounted(() => {
  wishlistStore.fetchWishlistData();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.wishlist-container {
  width: 80%;
  max-width: 1200px;
  margin: 2rem auto;
  /* padding: 20px; */
 
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.wishlist-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  height: 55vh;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.wishlist-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.785);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(182, 58, 58, 0.15);
  position: relative;
  transition: all 0.3s ease;
}

.wishlist-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 50%;
}

.delete-btn:hover {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  margin-right: 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-image:hover img {
  transform: scale(1.05);
}

.item-details {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: 2rem;
  text-align: left;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.item-title {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  font-weight: 500;
  text-align: left;
}

.item-price {
  font-size: 1.3rem;
  color: #ff6b6b;
  font-weight: 600;
  margin: 0;
  text-align: left;
}

.item-promotion {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
  border-left: 1px solid #ff6b6b;
  border-right: 1px solid #ff6b6b;
}

.promotion-desc {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

.flower-language {
  color: #888;
  font-size: 1.2rem;
  /* font-style: italic; */
  margin: 0;
  line-height: 1.4;
}

.item-actions {
  display: flex;
  align-items: center;
  margin-left: 2rem;
}

.add-to-cart-btn {
  padding: 0.8rem 2rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.add-to-cart-btn:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

@media (max-width: 768px) {
  .wishlist-container {
    width: 95%;
    padding: 10px;
  }

  .wishlist-item {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .item-image {
    width: 100%;
    height: 200px;
    margin: 0 0 1.5rem 0;
  }

  .item-details {
    flex: none;
    width: 100%;
    margin: 0 0 1rem 0;
    align-items: center;
  }

  .item-promotion {
    width: 100%;
    margin: 1rem 0;
    padding: 1rem 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .item-actions {
    margin: 1rem 0 0 0;
    width: 100%;
  }

  .delete-btn {
    top: 0.5rem;
    right: 0.5rem;
  }

  .add-to-cart-btn {
    width: 100%;
  }

  .item-info {
    align-items: center;
  }

  .item-title,
  .item-price {
    text-align: center;
  }
}
/* 自定义滚动条样式 */
.wishlist-items::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.wishlist-items::-webkit-scrollbar-track {
  background: #fdfdfd; /* 滚动条轨道颜色 */
  border: 1px solid #e9bfbf;
  border-radius: 4px;
}

  .wishlist-items::-webkit-scrollbar-thumb {
  background: #ff6b6b3a; /* 滚动条滑块颜色 */
  border-radius: 4px;
}

 .wishlist-items::-webkit-scrollbar-thumb:hover {
  background: #ff6b6b; /* 滚动条滑块悬停颜色 */
}

</style>
