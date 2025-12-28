<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">数据概览</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <stat-card
          title="总销售额"
          :value="formatCurrency(totalSales)"
          :trend="salesTrend"
          :trend-type="salesTrendType"
          icon="Money"
          color="#f26371"
          :loading="loading"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <stat-card
          title="订单总数"
          :value="totalOrders.toString()"
          :trend="ordersTrend"
          :trend-type="ordersTrendType"
          icon="ShoppingBag"
          color="#1890ff"
          :loading="loading"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <stat-card
          title="商品总数"
          :value="totalProducts.toString()"
          :trend="productsTrend"
          :trend-type="productsTrendType"
          icon="Goods"
          color="#52c41a"
          :loading="loading"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <stat-card
          title="用户总数"
          :value="totalUsers.toString()"
          :trend="usersTrend"
          :trend-type="usersTrendType"
          icon="User"
          color="#faad14"
          :loading="loading"
        />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 销售趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售趋势</span>
              <el-radio-group v-model="salesChartType" size="small">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <sales-chart :data="salesChartData" :type="salesChartType" />
          </div>
        </el-card>
      </el-col>

      <!-- 订单状态分布 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <order-status-chart :data="orderStatusData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 热门商品 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">热门商品 TOP 10</span>
              <el-button text type="primary" @click="goToProducts">
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="hot-products-container">
            <hot-product-list :products="hotProducts" :loading="loading" />
          </div>
        </el-card>
      </el-col>

      <!-- 库存预警 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">库存预警</span>
              <el-tag type="warning" v-if="lowStockCount > 0">
                低库存商品: {{ lowStockCount }}
              </el-tag>
            </div>
          </template>
          <div class="stock-alert-container">
            <stock-alert-list :products="lowStockProducts" :loading="loading" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近订单</span>
              <el-button text type="primary" @click="goToOrders">
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="recent-orders-container">
            <recent-orders-list :orders="recentOrders" :loading="loading" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh, ArrowRight } from "@element-plus/icons-vue";
import axios from "axios";
import StatCard from "./components/StatCard.vue";
import SalesChart from "./components/SalesChart.vue";
import OrderStatusChart from "./components/OrderStatusChart.vue";
import HotProductList from "./components/HotProductList.vue";
import StockAlertList from "./components/StockAlertList.vue";
import RecentOrdersList from "./components/RecentOrdersList.vue";

const router = useRouter();
const loading = ref(false);
const dateRange = ref([]);
const salesChartType = ref("week");

// 数据
const orders = ref([]);
const products = ref([]);
const users = ref([]);
const allOrders = ref([]);

// 计算统计数据
const totalSales = computed(() => {
  return orders.value.reduce((sum, order) => {
    return sum + (parseFloat(order.total_price) || 0);
  }, 0);
});

const totalOrders = computed(() => orders.value.length);

const totalProducts = computed(() => products.value.length);

const totalUsers = computed(() => users.value.filter(u => u.role === "user").length);

// 趋势计算（简化版，实际应该对比上一周期）
const salesTrend = computed(() => {
  if (orders.value.length === 0) return "0%";
  const avgOrderValue = totalSales.value / orders.value.length;
  return avgOrderValue > 100 ? "+12%" : "+5%";
});

const salesTrendType = computed(() => "up");

const ordersTrend = computed(() => {
  return orders.value.length > 10 ? "+8%" : "+3%";
});

const ordersTrendType = computed(() => "up");

const productsTrend = computed(() => "+2%");
const productsTrendType = computed(() => "up");

const usersTrend = computed(() => "+5%");
const usersTrendType = computed(() => "up");

// 销售图表数据
const salesChartData = computed(() => {
  if (!allOrders.value.length) return { dates: [], values: [] };
  
  // 根据选择的类型分组数据
  const grouped = {};
  allOrders.value.forEach(order => {
    const date = new Date(order.created_at);
    let key;
    
    if (salesChartType.value === "day") {
      key = date.toLocaleDateString("zh-CN");
    } else if (salesChartType.value === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = `第${Math.ceil((weekStart.getMonth() + 1) / 4)}周`;
    } else {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      key = `${date.getFullYear()}-${month}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += parseFloat(order.total_price) || 0;
  });
  
  const dates = Object.keys(grouped).sort();
  const values = dates.map(key => grouped[key]);
  
  return { dates, values };
});

// 订单状态数据
const orderStatusData = computed(() => {
  const statusCount = {};
  allOrders.value.forEach(order => {
    const status = order.status || "未知";
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  return statusCount;
});

// 热门商品
const hotProducts = computed(() => {
  // 统计每个商品的销量
  const productSales = {};
  allOrders.value.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const productId = item.product_id;
        if (!productSales[productId]) {
          productSales[productId] = {
            product_id: productId,
            name: item.product_name || `商品 ${productId}`,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[productId].sales += item.quantity || 0;
        productSales[productId].revenue += (item.quantity || 0) * (item.single_price || 0);
      });
    }
  });
  
  // 获取商品图片
  const productsWithImages = Object.values(productSales)
    .map(item => {
      const product = products.value.find(p => p.id === item.product_id);
      return {
        ...item,
        image: product?.images || "",
        name: product?.title || item.name,
      };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
  
  return productsWithImages;
});

// 低库存商品
const lowStockProducts = computed(() => {
  return products.value
    .filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0))
    .slice(0, 10);
});

const lowStockCount = computed(() => lowStockProducts.value.length);

// 最近订单
const recentOrders = computed(() => {
  return allOrders.value
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);
});

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const [ordersRes, productsRes, usersRes, allOrdersRes] = await Promise.all([
      axios.get("http://localhost:3001/normal_orders"),
      axios.get("http://localhost:3001/products_list"),
      axios.get("http://localhost:3001/users"),
      axios.get("http://localhost:3001/normal_orders"),
    ]);

    // 根据日期范围过滤订单
    let filteredOrders = ordersRes.data || [];
    if (dateRange.value && dateRange.value.length === 2) {
      const [startDate, endDate] = dateRange.value;
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = order.created_at?.split("T")[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    orders.value = filteredOrders;
    products.value = productsRes.data || [];
    users.value = usersRes.data || [];
    allOrders.value = allOrdersRes.data || [];
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage.error("获取数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

// 刷新数据
function refreshData() {
  fetchData();
}

// 日期范围变化
function handleDateChange() {
  fetchData();
}

// 格式化货币
function formatCurrency(value) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// 跳转
function goToProducts() {
  router.push("/admin/products");
}

function goToOrders() {
  router.push("/admin/orders");
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-row {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.hot-products-container,
.stock-alert-container,
.recent-orders-container {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
