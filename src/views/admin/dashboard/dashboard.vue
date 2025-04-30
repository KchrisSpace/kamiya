<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <stat-card
          title="总销售额"
          value="¥ 126,560"
          trend="12%"
          trend-type="up"
          period="月"
        />
      </el-col>
      <el-col :span="6">
        <stat-card
          title="访问量"
          value="8,846"
          trend="11%"
          trend-type="up"
          period="日"
        />
      </el-col>
      <el-col :span="6">
        <stat-card
          title="支付笔数"
          value="6,560"
          trend="5%"
          trend-type="down"
          period="周"
        />
      </el-col>
      <el-col :span="6">
        <stat-card
          title="运营活动效果"
          value="78%"
          trend="8%"
          trend-type="up"
          period="年"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售额趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <sales-chart />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门商品</span>
            </div>
          </template>
          <div class="hot-products">
            <hot-product-list />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import StatCard from "./components/StatCard.vue";
import SalesChart from "./components/SalesChart.vue";
import HotProductList from "./components/HotProductList.vue";
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.chart-row {
  margin-top: 20px;
}

.chart-container {
  height: 300px;
}
</style>
