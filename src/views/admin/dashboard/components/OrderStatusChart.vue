<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const chartRef = ref(null);
let chart = null;

const statusColors = {
  待商家确认: "#909399",
  待用户确定订单: "#e6a23c",
  进行中: "#409eff",
  预备出餐中: "#f56c6c",
  已出餐: "#67c23a",
  已完成: "#52c41a",
  已取消: "#f56c6c",
  协商中: "#e6a23c",
};

const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chart || !props.data) return;

  const data = Object.entries(props.data).map(([name, value]) => ({
    name,
    value,
    itemStyle: {
      color: statusColors[name] || "#409eff",
    },
  }));

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        color: "#666",
        fontSize: 12,
      },
    },
    series: [
      {
        name: "订单状态",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          fontSize: 12,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        data: data,
      },
    ],
  };

  chart.setOption(option, true);
};

const resizeChart = () => {
  chart?.resize();
};

watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chart?.dispose();
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>

