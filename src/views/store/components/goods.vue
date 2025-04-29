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
        <div class="details-icon" @click.stop="handleShowDetails(item)">
          <el-icon :size="36"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    <div class="goods-info">
      <h6 class="goods-title">{{ item.title }}</h6>
      <!-- <span class="sales-count">已售{{ item.sales_data.sales_count }}件</span> -->
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
  margin-bottom: 20px;
  padding-bottom: 12px;
  font-family: var(--font-Alibaba);
  cursor: pointer;
  transition: all 0.3s;
}

.goods-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.goods-image-container {
  position: relative;
  width: 224px;
  background-color: var(--color-bg-thirth);
}

.discount-tag {
  position: absolute;
  top: 8px;
  width: 40px;
  height: 20px;
  background-color: #97b959;
  color: white;
  font-weight: 500;
  text-align: center;
  line-height: 20px;
}

.hot-tag {
  position: absolute;
  top: 8px;
  width: 40px;
  height: 20px;
  background-color: var(--color-font-primary);
  color: white;
  font-weight: 500;
  text-align: center;
  line-height: 20px;
}

.goods-image-container img {
  width: 100%;
  height: auto;
}

.hover-actions {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80px;
  background-color: rgba(204, 204, 204, 0.28);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
}

.add-to-cart-btn {
  width: 88px;
  height: 36px;
  background-color: var(--color-font-primary);
  color: white;
  font-size: 14px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: rgba(242, 99, 113, 0.8);
}

.details-icon {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.goods-info {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 8px;
  margin: 8px;
}

.goods-title {
  text-align: center;
  color: var(--color-font-secondary);
  margin: 0;
}

.sales-count {
  font-size: 12px;
  color: var(--color-font-fourth);
}

.price-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  margin: 0 8px;
}

.current-price {
  font-weight: 500;
  font-size: 16px;
  color: var(--color-font-primary);
}

.original-price {
  font-size: 12px;
  color: var(--color-font-fourth);
  text-decoration: line-through;
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
import DetailsEject from "./details-eject.vue";
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
    name: "ProductDetails",
    params: { id: itemid },
  });
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>
