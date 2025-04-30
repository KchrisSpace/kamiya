<!-- 轮播图组件 -->
<template>
  <div class="carousel">
    <el-carousel :interval="4000" type="card" height="200px">
      <el-carousel-item v-for="item in carouselList" :key="item.id">
        <img :src="item.img" alt="activity" />
    </el-carousel-item>
  </el-carousel>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref } from "vue";
const activeIndex = ref(0);
const carouselList = ref([]);
axios.get("http://localhost:3001/carousel").then((res) => {
  carouselList.value = res.data;
  console.log(carouselList.value);
});
</script>
<style scoped>
.carousel {
  background-color: inherit;
}

 .el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
