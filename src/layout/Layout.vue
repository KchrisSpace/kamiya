<template>
  <div class="layout">
    <Header />
    <main class="main-content">
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
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
  padding: 20px;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>
