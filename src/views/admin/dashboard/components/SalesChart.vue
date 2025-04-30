<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";

const chartRef = ref(null);
let chart = null;

const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  const option = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "销售额",
        type: "line",
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: {
          opacity: 0.1,
        },
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#409EFF",
        },
      },
    ],
  };

  chart.setOption(option);
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", () => {
    chart?.resize();
  });
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
