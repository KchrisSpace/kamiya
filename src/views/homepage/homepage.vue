<!-- 首页 -->
<template>
  <div class="homepage">
    <div class="carousel-section">
      <Carousel />
    </div>
    <div class="sales-section">
      <SalesCard />
    </div>
  </div>
</template>

<script setup>
import Carousel from "./components/Carousel.vue";
import SalesCard from "./components/SalesCard.vue";
</script>

<style scoped>
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.carousel-section {
  width: 80%;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
 
</style>
