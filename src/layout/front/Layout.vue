<template>
  <div class="layout">
    <Header v-if="!isAuthPage" />
    <main class="main-content" :class="{ 'with-header': !isAuthPage }">
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isAuthPage = computed(() => {
  return route.path === "/login" || route.path === "/register";
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
  padding-top: 40px !important;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.main-content.with-header {
  margin-top: 40px; /* 只在有header时添加上边距 */
}

.content-wrapper {
  width: 100%;
  /* padding: 20px; */
  box-sizing: border-box;
}
</style>
