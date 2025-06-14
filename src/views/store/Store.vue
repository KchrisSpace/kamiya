<template>
  <div class="store-container">
    <div class="store-content">
      <!-- left -->
      <div class="sidebar">
        <div class="sticky-sidebar">
          <!-- 搜索框 -->
          <div class="search-container">
            <input
              type="text"
              class="search-input"
              placeholder="搜索商品名称、关键词或描述..."
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              @input="debouncedSearch"
            />
            <font-awesome-icon
              :icon="['fas', 'magnifying-glass']"
              size="lg"
              :class="['search-icon', searchKeyword ? 'active' : 'inactive']"
              @click="handleSearch"
            />
          </div>
          <div class="price-section">
            <div class="section-title">价格</div>
            <div class="price-range">
              <p>范围</p>
              <div class="slider-container">
                <el-slider
                  v-model="priceRange"
                  range
                  show-stops
                  :max="600"
                  :format-tooltip="formatPrice"
                >
                </el-slider>
                <div class="price-labels">
                  <span>¥{{ priceRange[0] }}</span>
                  <span>¥{{ priceRange[1] }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="category-section">
            <div class="section-title">类别</div>
            <div class="category-list">
              <button
                v-for="category in categories"
                :key="category"
                :class="[
                  'category-btn',
                  selectedCategory === category ? 'active' : '',
                ]"
                @click="setCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- right -->
      <div class="product-grid">
        <template v-if="isLoading">
          <div class="loading-message">搜索中...</div>
        </template>
        <template v-else-if="filteredGoods.length === 0">
          <div class="empty-state">
            <font-awesome-icon
              :icon="['fas', 'magnifying-glass']"
              class="empty-icon"
            />
            <p class="empty-title">没有找到相关商品</p>
            <p class="empty-subtitle">尝试调整搜索关键词或筛选条件</p>
          </div>
        </template>
        <template v-else>
          <Goods :goods="filteredGoods" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Goods from "./components/goods.vue";
// import { API_URL } from "../../../constants/api";

const router = useRouter();

// 状态
const selectedCategory = ref("推荐");
const goods = ref([]);
const priceRange = ref([0, 600]);
const searchKeyword = ref("");
const searchResult = ref([]);
const isLoading = ref(false);
const categories = ["单品", "冷品", "暖品", "套餐"];

// 计算属性
const filteredGoods = computed(() => {
  if (isLoading.value) return [];

  const filtered = goods.value.filter((item) => {
    const categoryMatch =
      selectedCategory.value === "推荐" ||
      item.specification.category.includes(selectedCategory.value);

    const priceMatch =
      item.price_info.current_price >= priceRange.value[0] &&
      item.price_info.current_price <= priceRange.value[1];

    const keywordMatch =
      searchResult.value.length === 0 || searchResult.value.includes(item.id);

    return categoryMatch && priceMatch && keywordMatch;
  });

  return filtered.length === 0 ? [] : filtered;
});

// 方法
const setCategory = (category) => {
  selectedCategory.value = category;
};

const formatPrice = (value) => {
  return `¥${value}`;
};

const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResult.value = [];
    return;
  }

  isLoading.value = true;
  const keyword = searchKeyword.value.toLowerCase();

  setTimeout(() => {
    searchResult.value = goods.value
      .filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.promotion.keywords.some((k) =>
            k.toLowerCase().includes(keyword)
          ) ||
          item.promotion.main_description.toLowerCase().includes(keyword)
      )
      .map((item) => item.id);
    isLoading.value = false;
  }, 300);
};

const getGoods = async () => {
  try {
    const res = await axios.get(`http://localhost:3001/products_list`);
    goods.value = res.data.map((item) => ({ ...item, showCart: false }));
  } catch (error) {
    console.error("获取商品数据失败:", error);
  }
};

// 生命周期钩子
onMounted(() => {
  getGoods();
});

// 防抖搜索
const debouncedSearch = debounce(handleSearch, 500);
</script>

<style scoped>
.store-container {
  margin-left: 96px;
  margin-right: 96px;
  font-family: var(--font-Alibaba);
  height: 100vh;
  overflow: hidden;
}

.store-content {
  display: flex;
  color: var(--color-font-secondary);
  text-align: left;
  height: 100%;
}

.sidebar {
  width: 20%;
  margin-right: 40px;
  border: 2px solid var(--color-bg-primary);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(242, 99, 113, 0.1);
  background-color: white;
  padding: 22px;
  transform: translateY(-8px);
  position: relative;
  z-index: 1;
}

.sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #fff5f6);
  z-index: -1;
}

.sticky-sidebar {
  position: sticky;
  top: 40px;
  padding: 8px;
}

.search-container {
  padding: 12px 16px;
  border: 2px solid var(--color-bg-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  background-color: #fff5f6;
}

.search-container:hover {
  border-color: var(--color-font-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 99, 113, 0.1);
}

.search-input {
  height: 40px;
  width: 100%;
  outline: none;
  border: none;
  background: none;
  font-size: 16px;
}

.search-input::placeholder {
  color: var(--color-font-thirth);
}

.search-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
}

.search-icon:hover {
  background-color: rgba(242, 99, 113, 0.1);
  transform: scale(1.1);
}

.search-icon.active {
  color: var(--color-font-primary);
}

.search-icon.inactive {
  color: var(--color-font-thirth);
}

.section-title {
  margin-top: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-bg-primary);
  font-size: 24px;
  color: var(--color-font-primary);
  font-weight: 600;
}

.price-range {
  margin: 24px 0;
  font-size: 20px;
}

.slider-container {
  margin-top: 8px;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--color-font-thirth);
  font-size: 16px;
}

.category-section {
  margin-top: 24px;
}

.category-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.category-btn {
  font-size: 20px;
  padding: 12px 16px;
  color: var(--color-font-thirth);
  font-weight: 500;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  border: none;
  border-radius: 12px;
  width: 100%;
  text-align: left;
}

.category-btn:hover {
  background-color: rgba(242, 99, 113, 0.1);
  color: var(--color-font-primary);
  transform: translateX(8px);
}

.category-btn.active {
  background-color: rgba(242, 99, 113, 0.15);
  color: var(--color-font-primary);
  transform: translateX(8px);
}

.product-grid {
  width: 66.67%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  overflow-y: auto;
  height: 100%;
  padding-right: 16px;
}

/* 自定义滚动条样式 */
.product-grid::-webkit-scrollbar {
  width: 6px;
}

.product-grid::-webkit-scrollbar-track {
  background: #fff5f6;
  border-radius: 8px;
}

.product-grid::-webkit-scrollbar-thumb {
  background: rgba(242, 99, 113, 0.3);
  border-radius: 8px;
}

.product-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(242, 99, 113, 0.5);
}

.loading-message {
  width: 100%;
  text-align: center;
  padding: 32px 0;
  color: var(--color-font-thirth);
}

.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-font-thirth);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  color: var(--color-font-thirth);
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 18px;
  color: var(--color-font-thirth);
}

/* Element Plus Slider 样式覆盖 */
:deep(.el-slider__bar) {
  background-color: var(--btn-primary);
  top: -50%;
  height: 12px;
  border-radius: 6px;
}

:deep(.el-slider__button) {
  border-color: var(--color-font-primary);
  width: 16px;
  height: 16px;
  transition: all 0.3s;
}

:deep(.el-slider__button:hover) {
  transform: scale(1.2);
}

:deep(.el-slider) {
  --el-slider-main-bg-color: var(--color-font-primary);
  height: 12px;
}

:deep(.el-slider__stop) {
  background-color: var(--color-font-thirth);
  width: 4px;
  height: 12px;
  border-radius: 50%;
}
</style>
