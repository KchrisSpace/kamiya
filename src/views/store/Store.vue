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
              placeholder="搜索商品名或关键词..."
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
const selectedCategory = ref("全部");
const goods = ref([]);
const priceRange = ref([0, 600]);
const searchKeyword = ref("");
const searchResult = ref([]);
const isLoading = ref(false);
const categories = ["全部", "单品", "冷品", "暖品", "套餐"];

// 计算属性
const filteredGoods = computed(() => {
  if (isLoading.value) return [];

  const filtered = goods.value.filter((item) => {
    // 只显示上架的商品（status === "1"）
    const statusMatch = item.status === "1" || item.status === 1;

    // 类别筛选：如果选择"全部"则显示所有，否则匹配 category 字段
    const categoryMatch =
      selectedCategory.value === "全部" ||
      (item.category && item.category === selectedCategory.value);

    // 价格筛选
    const priceMatch =
      item.price_info &&
      item.price_info.current_price >= priceRange.value[0] &&
      item.price_info.current_price <= priceRange.value[1];

    // 关键词搜索筛选：如果没有搜索关键词，则显示所有；如果有，则只显示匹配的商品
    const keywordMatch =
      !searchKeyword.value.trim() || searchResult.value.includes(item.id);

    return statusMatch && categoryMatch && priceMatch && keywordMatch;
  });

  return filtered;
});

// 方法
const setCategory = (category) => {
  selectedCategory.value = category;
  // 切换类别时，如果搜索框有内容，清空搜索结果以显示该类别的所有商品
  if (searchKeyword.value.trim()) {
    searchResult.value = [];
    searchKeyword.value = "";
  }
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
  // 将搜索关键词按空格拆分成多个词，支持多词搜索
  const searchTerms = searchKeyword.value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  setTimeout(() => {
    searchResult.value = goods.value
      .filter((item) => {
        // 合并所有可搜索的文本内容
        const searchableTexts = [];

        // 1. 商品标题
        if (item.title) {
          searchableTexts.push(item.title.toLowerCase());
        }

        // 2. 材料
        if (item.promotion?.material) {
          searchableTexts.push(item.promotion.material.toLowerCase());
        }

        // 3. 关键词数组
        if (
          item.promotion?.keywords &&
          Array.isArray(item.promotion.keywords)
        ) {
          const keywordsText = item.promotion.keywords
            .filter((k) => k)
            .map((k) => k.toLowerCase())
            .join(" ");
          searchableTexts.push(keywordsText);
        }

        // 将所有可搜索文本合并成一个字符串
        const combinedText = searchableTexts.join(" ");

        // 检查所有搜索词是否都在合并的文本中
        // 所有词都必须匹配才返回 true
        const allTermsMatch = searchTerms.every((term) =>
          combinedText.includes(term)
        );

        return allTermsMatch;
      })
      .map((item) => item.id);
    isLoading.value = false;
  }, 300);
};

const getGoods = async () => {
  try {
    const res = await axios.get(`http://localhost:3001/products_list`);
    // 只获取上架的商品，并移除库存字段（不在前台显示）
    goods.value = res.data
      .filter((item) => item.status === "1" || item.status === 1)
      .map((item) => {
        const { stock, ...rest } = item; // 移除库存字段
        return { ...rest, showCart: false };
      });
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
  margin-left: 10vw;
  margin-right: 96px;
  font-family: var(--font-Alibaba);
  margin-top: 3vh;
  height: 85vh;
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
  height: 80vh;
  border: 2px solid var(--color-bg-primary);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(242, 99, 113, 0.1);
  background-color: white;
  padding: 22px;
  transform: translateY(-8px);
  position: fixed;
  left: 96px;
  top: 10vh;
  z-index: 1;
  overflow: hidden;
  overflow-y: hidden;
  overflow-x: hidden;
}

/* 隐藏 sidebar 的滚动条 */
.sidebar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
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
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 隐藏 sticky-sidebar 的滚动条 */
.sticky-sidebar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.sticky-sidebar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.search-container {
  padding: 10px 16px;
  border: 2px solid rgba(242, 99, 113, 0.5);
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #fff5f6 100%);
}

.search-container:hover {
  border-color: #f26371;
  box-shadow: 0 4px 20px rgba(242, 99, 113, 0.18);
  background: linear-gradient(135deg, #fff6f7 0%, #ffeaea 100%);
}

.search-container:focus-within {
  border-color: #f26371;
  box-shadow: 0 4px 16px rgba(242, 99, 113, 0.22);
  background: linear-gradient(135deg, #fff3f6 0%, #ffffff 100%);
}

.search-input {
  flex: 1;
  height: 36px;
  width: 100%;
  outline: none;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  font-weight: 400;
  letter-spacing: 0.3px;
  caret-color: #f26371;
}

.search-input::selection {
  background-color: rgba(242, 99, 113, 0.2);
  color: #333;
}

.search-input::placeholder {
  color: #999;
  font-weight: 400;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.search-input:focus::placeholder {
  opacity: 0.5;
}

.search-icon {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-font-primary);
  background-color: rgba(242, 99, 113, 0.1);
}

.search-icon:hover {
  background-color: rgba(242, 99, 113, 0.15);
  transform: scale(1.15) rotate(5deg);
}

.search-icon:active {
  transform: scale(1.05) rotate(0deg);
}

.search-icon.active {
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b6b 0%, #f24253 100%);
  box-shadow: 0 2px 8px rgba(242, 99, 113, 0.3);
  transform: scale(1.1);
}

.search-icon.inactive {
  color: #999;
  background-color: transparent;
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
  margin-left: calc(20% + 40px);
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
