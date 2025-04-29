<template>
  <div class="header">
    <div class="logo">
      <img src="/public/logo.png" alt="logo" />
      
    </div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :router="true"
    >
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/store">商店</el-menu-item>
      <el-menu-item index="/customize">定制</el-menu-item>
      <el-menu-item index="/cart">购物车</el-menu-item>
      <el-menu-item index="/order">订单</el-menu-item>
      <el-menu-item index="/contact">联系我们</el-menu-item>
      <div class="flex-grow" />
      <div class="right-menu">
        <el-menu-item index="/login">登录</el-menu-item>
        <el-menu-item index="/register">注册</el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const activeIndex = ref(route.path);

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath;
  }
);
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
}

.logo {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
 
.logo img {
  margin-left: 20px;
  height: 40px;
  width: auto;
}

.logo span {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.el-menu-demo {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.flex-grow {
  flex-grow: 1;
}

.right-menu {
  display: flex;
  align-items: center;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
}
</style>
