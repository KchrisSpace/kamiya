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
    </el-menu>
    <div class="right-menu">
      <template v-if="!isLoggedIn">
        <el-dropdown trigger="hover" @command="handleCommand">
          <span class="menu-item">
            <el-icon><User /></el-icon>
            <span>未登录</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="login">登录</el-dropdown-item>
              <el-dropdown-item command="register">注册</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-dropdown trigger="hover" @command="handleCommand">
          <span class="menu-item">
            <el-avatar :size="24" :src="userStore.userAvatar" />
            <span>{{ userStore.userNickname }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <el-badge class="cart-badge">
        <span class="menu-item" @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
        </span>
      </el-badge>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../../../data_stores/user";
import { User, ShoppingCart } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const activeIndex = ref(route.path);

const isLoggedIn = computed(() => userStore.isLoggedIn);

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.getUserInfo();
  }
});

const handleCommand = (command) => {
  switch (command) {
    case "login":
      router.push("/login");
      break;
    case "register":
      router.push("/register");
      break;
    case "profile":
      router.push("/profile");
      break;
    case "logout":
      userStore.logout();
      router.push("/");
      break;
  }
};

const goToCart = () => {
  router.push("/cart");
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
  gap: 20px;
  padding-right: 20px;
  height: 60px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #424443;
  font-size: 14px;
  padding: 0;
  height: 100%;
  line-height: 60px;
  outline: none;
}

.menu-item:hover {
  color: #f26371;
}

.menu-item .el-icon {
  font-size: 16px;
  vertical-align: middle;
}

.menu-item span {
  vertical-align: middle;
}

.menu-item .el-avatar {
  margin-right: 4px;
  width: 24px;
  height: 24px;
}

.cart-badge {
  margin-right: 8px;
}

:deep(.el-badge__content) {
  background-color: #f26371;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
  color: #f26371;
}

:deep(.el-dropdown-menu__item--divided) {
  border-top: 1px solid #ebeef5;
}

:deep(.el-dropdown) {
  border: none;
  outline: none;
}

:deep(.el-dropdown .el-dropdown-link) {
  color: #424443;
  font-size: 14px;
  outline: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-dropdown .el-dropdown-link:hover) {
  color: #f26371;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  height: 60px;
  line-height: 60px;
  outline: none;
}

:deep(.el-menu-item:hover) {
  outline: none;
}

:deep(.el-menu-item:focus) {
  outline: none;
}

:deep(.el-dropdown) {
  cursor: pointer;
  outline: none;
}

:deep(.el-avatar) {
  margin-right: 4px;
  width: 24px;
  height: 24px;
}

:deep(.el-dropdown__popper) {
  outline: none;
}

:deep(.el-dropdown__popper .el-dropdown-menu) {
  outline: none;
}

:deep(.el-dropdown__popper .el-dropdown-menu__item) {
  outline: none;
}

:deep(.el-dropdown__popper .el-dropdown-menu__item:focus) {
  outline: none;
}

:deep(.el-dropdown__popper .el-dropdown-menu__item:hover) {
  outline: none;
}
</style>
