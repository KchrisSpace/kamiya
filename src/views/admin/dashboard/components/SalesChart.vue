<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ dates: [], values: [] }),
  },
  type: {
    type: String,
    default: "week",
  },
});

const chartRef = ref(null);
let chart = null;

const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chart || !props.data) return;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${param.seriesName}: ¥${param.value.toLocaleString()}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: props.data.dates || [],
      axisLine: {
        lineStyle: {
          color: "#e0e0e0",
        },
      },
      axisLabel: {
        color: "#666",
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#666",
        formatter: (value) => {
          if (value >= 1000) {
            return `¥${(value / 1000).toFixed(1)}k`;
          }
          return `¥${value}`;
        },
      },
      splitLine: {
        lineStyle: {
          color: "#f0f0f0",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "销售额",
        type: "line",
        smooth: true,
        data: props.data.values || [],
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(242, 99, 113, 0.5)" },
            { offset: 1, color: "rgba(242, 99, 113, 0.1)" },
          ]),
        },
        lineStyle: {
          width: 3,
          color: "#f26371",
        },
        itemStyle: {
          color: "#f26371",
          borderWidth: 2,
          borderColor: "#fff",
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(242, 99, 113, 0.5)",
          },
        },
      },
    ],
  };

  chart.setOption(option, true);
};

const resizeChart = () => {
  chart?.resize();
};

watch(
  () => [props.data, props.type],
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
