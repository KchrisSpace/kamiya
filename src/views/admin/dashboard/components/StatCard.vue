<template>
  <el-card shadow="hover" class="stat-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
        <el-tag :type="getTagType">{{ period }}</el-tag>
      </div>
    </template>
    <div class="card-content">
      <div class="number">{{ value }}</div>
      <div class="trend">
        <span>{{ period }}同比 {{ trend }}</span>
        <el-icon :color="trendType === 'up' ? '#67c23a' : '#f56c6c'">
          <component :is="trendType === 'up' ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  trend: {
    type: String,
    required: true,
  },
  trendType: {
    type: String,
    required: true,
    validator: (value) => ["up", "down"].includes(value),
  },
  period: {
    type: String,
    required: true,
  },
});

const getTagType = computed(() => {
  const types = {
    月: "success",
    日: "warning",
    周: "danger",
    年: "info",
  };
  return types[props.period] || "info";
});
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.number {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.trend {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
