<template>
  <router-view></router-view>
</template>

<script setup>
// 不需要在这里导入布局组件，因为路由已经配置了对应的布局
</script>

<style>
/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
