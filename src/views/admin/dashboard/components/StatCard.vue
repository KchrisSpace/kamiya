<template>
  <el-card shadow="hover" class="stat-card" :class="`stat-card-${colorClass}`">
    <div class="stat-content">
      <div class="stat-icon" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="32" :color="color">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value" v-if="!loading">{{ value }}</div>
        <div class="stat-value" v-else>
          <el-skeleton :rows="1" animated />
        </div>
        <div class="stat-trend" v-if="!loading && trend">
          <span :class="`trend-${trendType}`">
            <el-icon>
              <component :is="trendType === 'up' ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
            {{ trend }}
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

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
    default: "",
  },
  trendType: {
    type: String,
    default: "up",
    validator: (value) => ["up", "down"].includes(value),
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#409EFF",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const iconComponent = computed(() => {
  return ElementPlusIconsVue[props.icon] || ElementPlusIconsVue["InfoFilled"];
});

const colorClass = computed(() => {
  if (props.color === "#f26371") return "pink";
  if (props.color === "#1890ff") return "blue";
  if (props.color === "#52c41a") return "green";
  if (props.color === "#faad14") return "orange";
  return "default";
});

const iconBgColor = computed(() => {
  return props.color + "15"; // 添加透明度
});
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.2;
  word-break: break-all;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-down {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-card-pink {
  border-left: 4px solid #f26371;
}

.stat-card-blue {
  border-left: 4px solid #1890ff;
}

.stat-card-green {
  border-left: 4px solid #52c41a;
}

.stat-card-orange {
  border-left: 4px solid #faad14;
}

.stat-card-default {
  border-left: 4px solid #409eff;
}
</style>
