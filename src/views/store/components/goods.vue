<template>
  <div
    class="goods-item"
    v-for="item in goods"
    :key="item.id"
    @click="handleToDetails(item.id)"
  >
    <div
      class="goods-image-container"
      @mouseenter="item.showCart = true"
      @mouseleave="item.showCart = false"
    >
      <div
        v-if="
          item.price_info.current_price != item.price_info.original_price &&
          item.promotion.is_hot == false
        "
        class="discount-tag"
      >
        {{
          parseInt(
            ((item.price_info.original_price - item.price_info.current_price) /
              item.price_info.original_price) *
              100
          )
        }}%
      </div>
      <div v-else-if="item.promotion.is_hot" class="hot-tag">Hot</div>
      <img :src="item.images" :alt="item.title" />
      <!-- 鼠标移入效果 -->
      <div v-show="item.showCart" class="hover-actions">
        <button class="add-to-cart-btn" @click.stop="handleAddToCart(item)">
          加入购物车
        </button>
      </div>
    </div>
    <div class="goods-info">
      <h6 class="goods-title">{{ item.title }}</h6>
    </div>

    <div class="price-container">
      <span class="current-price">￥{{ item.price_info.current_price }}</span>
      <span
        v-if="item.price_info.current_price != item.price_info.original_price"
        class="original-price"
        >￥{{ item.price_info.original_price }}</span
      >
    </div>
  </div>
  <DetailsEject
    v-if="showDetails"
    :title="selectedProduct.title"
    :image="selectedProduct?.images"
    :current_price="selectedProduct?.price_info.current_price"
    :original_price="selectedProduct?.price_info.original_price"
    :main_description="selectedProduct?.promotion.main_description"
    :flower_language="selectedProduct?.promotion.flower_language"
    :sale_rate="selectedProduct?.sale_rate"
    :id="selectedProduct?.id"
    @close="showDetails = false"
  />
  <JoinCart
    v-if="showJoinCart"
    :title="selectedProduct?.title"
    :image="selectedProduct?.images"
    @close="showJoinCart = false"
  />
</template>

<style scoped>
.goods-item {
  position: relative;
  width: 235px;
  height: 360px;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.goods-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.goods-image-container {
  position: relative;
  width: 100%;
  height: 240px;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.goods-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.goods-item:hover .goods-image-container img {
  transform: scale(1.05);
}

.discount-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background-color: #ff4d4f;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hot-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background-color: #ff4d4f;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hover-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  opacity: 0;
  transition: all 0.3s ease;
}

.goods-image-container:hover .hover-actions {
  opacity: 1;
}

.add-to-cart-btn {
  padding: 8px 20px;
  background-color: #fff;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-to-cart-btn:hover {
  background-color: #ff4d4f;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
}

.details-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.details-icon:hover {
  background-color: #ff4d4f;
  transform: translateX(4px);
}

.details-icon .el-icon {
  color: #ff4d4f;
  transition: all 0.3s ease;
}

.details-icon:hover .el-icon {
  color: white;
}

.goods-info {
  margin-top: 16px;
  padding: 0 8px;
}

.goods-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
  padding: 0 8px;
}

.current-price {
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .goods-item {
    padding: 12px;
  }

  .goods-image-container {
    height: 240px;
  }

  .goods-title {
    font-size: 15px;
  }

  .current-price {
    font-size: 18px;
  }

  .original-price {
    font-size: 13px;
  }

  .add-to-cart-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>

<script>
export default {
  name: "Goods",
  props: {
    goods: {
      type: Array,
      required: true,
    },
  },
};
</script>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import DetailsEject from "./product-detail.vue";
import JoinCart from "../components/join-cart.vue";
import { useCartStore } from "../../../data_stores/cart";
import { ElMessage } from "element-plus";

const showDetails = ref(false);
const showJoinCart = ref(false);
const selectedProduct = ref({
  title: "",
  images: [""],
  price_info: {
    current_price: 0,
    original_price: 0,
  },
  promotion: {
    main_description: "",
    flower_language: "",
  },
  sales_data: {
    rating: 0,
  },
  id: "",
});

const router = useRouter();
const cartStore = useCartStore();

const handleAddToCart = async (item) => {
  try {
    await cartStore.addItem(item.id, 1);
    selectedProduct.value = { ...item };
    showJoinCart.value = true;
    ElMessage({
      message: "商品已成功添加到购物车",
      type: "success",
    });
  } catch (error) {
    console.error("添加商品到购物车失败:", error);
    ElMessage({
      message: "添加商品失败，请重试",
      type: "error",
    });
  }
};

const handleShowDetails = (item) => {
  selectedProduct.value = { ...item };
  showDetails.value = true;
};

const handleToDetails = (itemid) => {
  router.push({
    name: "ProductDetail",
    params: { id: itemid },
  });
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>
