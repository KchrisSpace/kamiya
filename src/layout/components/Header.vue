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
        <template v-if="!isLoggedIn">
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
        <template v-else>
          <el-dropdown>
            <el-avatar :size="40" :src="userAvatar" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../../data_stores/user"

const route = useRoute();
const userStore = useUserStore();
const activeIndex = ref(route.path);

const isLoggedIn = computed(() => userStore.isLoggedIn);
const userAvatar = computed(
  () => userStore.userInfo?.avatar || "/public/default-avatar.png"
);

const handleLogout = () => {
  userStore.logout();
};

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
  gap: 10px;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
}

:deep(.el-dropdown) {
  cursor: pointer;
}

:deep(.el-avatar) {
  margin-right: 20px;
}
</style>
