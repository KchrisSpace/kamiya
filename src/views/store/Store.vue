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
const categories = ["推荐", "生日鲜花", "友情鲜花", "情人节鲜花"];

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
  /* margin-top: 0px; */
  margin-left: 96px;
  margin-right: 96px;
  font-family: var(--font-Alibaba);
}

.store-content {
  display: flex;
  color: var(--color-font-secondary);
  text-align: left;
}

.sidebar {
  width: 20%;
  margin-right: 40px;
}

.sticky-sidebar {
  position: sticky;
  top: 40px;
}

.search-container {
  padding-left: 16px;
  padding-right: 8px;
  border: 2px solid var(--color-bg-primary);
  display: flex;
  align-items: center;
  transition: border-color 0.3s;
}

.search-container:hover {
  border-color: var(--color-font-primary);
}

.search-input {
  height: 40px;
  width: 100%;
  outline: none;
  border: none;
  background: none;
}

.search-input::placeholder {
  color: var(--color-font-thirth);
}

.search-icon {
  cursor: pointer;
  transition: color 0.3s;
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
  padding-top: 16px;
  color: var(--color-font-thirth);
  font-weight: 500;
  margin-bottom: 0;
  cursor: pointer;
  transition: color 0.3s;
  background: none;
  border: none;
}

.category-btn:hover {
  color: rgba(242, 99, 113, 0.4);
}

.category-btn.active {
  color: rgba(242, 99, 113, 0.6);
}

.product-grid {
  width: 66.67%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
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
  background-color: var(--color-font-primary);
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
