<template>
  <div class="header">
    <div class="logo">
      <img src="/logo.png" alt="logo" />
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
      <el-menu-item index="/about">关于我们</el-menu-item>
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
            <el-avatar :size="24" :src="currentUserAvatar" />
            <span>{{ currentUserNickname }}</span>
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

// 前台只显示普通用户登录状态
const isLoggedIn = computed(() => {
  // 前台只检查普通用户登录状态
  const userToken = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId");
  
  // 如果是admin用户ID，前台不显示为已登录
  if (userId === "admin") {
    return false;
  }
  
  return !!(userToken && userId);
});

// 获取当前用户头像和昵称（前台只显示普通用户）
const currentUserAvatar = computed(() => {
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr);
    return userInfo?.user_info?.avatar || userInfo?.["user-info"]?.avatar || "/images/users/avater/user1.png";
  }
  return userStore.userAvatar || "/images/users/avater/user1.png";
});

const currentUserNickname = computed(() => {
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr);
    return userInfo?.user_info?.nickname || userInfo?.["user-info"]?.nickname || "用户";
  }
  return userStore.userNickname || "用户";
});

onMounted(async () => {
  // 前台只加载普通用户信息
  const userToken = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId");
  
  if (userToken && userId && userId !== "admin") {
    // 从localStorage恢复用户信息
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      userStore.setUserInfo(JSON.parse(userInfoStr));
    } else {
      await userStore.getUserInfo();
    }
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
/* 使用可爱的字体 */
* {
  font-family: "Nunito", "Comfortaa", -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  background: linear-gradient(180deg, #fff9fb 0%, #fff5f7 50%, #ffffff 100%);
  box-shadow: 0 4px 20px rgba(255, 182, 193, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  height: 75px;
  border-bottom: 2px solid rgba(255, 182, 193, 0.2);
}

.logo {
  margin-left: 35px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
}

.logo:hover {
  transform: scale(1.08) rotate(-3deg);
}

.logo img {
  height: 50px;
  width: auto;
  filter: drop-shadow(0 3px 10px rgba(255, 182, 193, 0.4));
  transition: filter 0.3s ease;
}

.logo:hover img {
  filter: drop-shadow(0 5px 15px rgba(255, 182, 193, 0.6));
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.el-menu-demo {
  flex: 1;
  max-width: 1200px;
  margin: 0;
  padding: 0 35px;
  display: flex;
  align-items: center;
  background: transparent;
  justify-content: flex-start;
}

.flex-grow {
  flex-grow: 1;
}

.right-menu {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 35px;
  height: 75px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  outline: none;
  position: relative;
  white-space: nowrap;
  font-family: "Nunito", sans-serif;
}

.menu-item::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 25px;
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.2) 0%,
    rgba(255, 192, 203, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.menu-item:hover {
  color: #ff6b9d;
  transform: translateY(-3px) scale(1.05);
}

.menu-item:hover::before {
  opacity: 1;
}

.menu-item .el-icon {
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 1;
}

.menu-item:hover .el-icon {
  transform: scale(1.2) rotate(10deg);
  color: #ff6b9d;
}

.menu-item span {
  position: relative;
  z-index: 1;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.menu-item .el-avatar {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 182, 193, 0.3);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 1;
  box-shadow: 0 3px 10px rgba(255, 182, 193, 0.25);
  border-radius: 50%;
}

.menu-item:hover .el-avatar {
  border-color: rgba(255, 182, 193, 0.6);
  box-shadow: 0 5px 15px rgba(255, 182, 193, 0.4);
  transform: scale(1.15) rotate(5deg);
}

.cart-badge {
  position: relative;
}

.cart-badge .menu-item {
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 50%, #ff6b9d 100%);
  color: #ffffff;
  padding: 12px 26px;
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cart-badge .menu-item::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.15) 100%
  );
}

.cart-badge .menu-item:hover {
  background: linear-gradient(135deg, #ff91a4 0%, #ff6b9d 50%, #ff4d7a 100%);
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.5);
  color: #ffffff;
}

.cart-badge .menu-item .el-icon {
  color: #ffffff;
  font-size: 22px;
}

.cart-badge .menu-item:hover .el-icon {
  animation: cart-bounce 0.6s ease;
}

@keyframes cart-bounce {
  0%,
  100% {
    transform: scale(1.2) rotate(10deg);
  }
  50% {
    transform: scale(1.3) rotate(-10deg);
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-badge__content) {
  background: linear-gradient(135deg, #ff91a4 0%, #ff6b9d 100%);
  border: 3px solid #ffffff;
  box-shadow: 0 3px 10px rgba(255, 107, 157, 0.5);
  font-weight: 700;
  font-size: 12px;
  min-width: 22px;
  height: 22px;
  line-height: 16px;
  border-radius: 12px;
  font-family: "Nunito", sans-serif;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(255, 182, 193, 0.25);
  border: 2px solid rgba(255, 182, 193, 0.2);
  padding: 12px 10px;
  background: linear-gradient(135deg, #ffffff 0%, #fff9fb 100%);
  margin-top: 10px;
  overflow: hidden;
}

:deep(.el-dropdown-menu__item) {
  border-radius: 15px;
  margin: 6px 4px;
  padding: 14px 24px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: #666;
  font-weight: 600;
  font-size: 15px;
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.3px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.2) 0%,
    rgba(255, 192, 203, 0.3) 100%
  );
  color: #ff6b9d;
  transform: translateX(8px) scale(1.05);
}

:deep(.el-dropdown-menu__item--divided) {
  border-top: 2px solid rgba(255, 182, 193, 0.2);
  margin-top: 10px;
  padding-top: 18px;
}

/* 导航菜单项样式 */
:deep(.el-menu--horizontal) {
  border-bottom: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 75px;
  line-height: 75px;
  outline: none;
  border-radius: 25px;
  margin: 0 4px;
  padding: 0 20px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: #666;
  font-weight: 600;
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.3px;
  position: relative;
}

:deep(.el-menu-item::before) {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.15) 0%,
    rgba(255, 192, 203, 0.25) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

:deep(.el-menu-item:hover) {
  outline: none;
  color: #ff6b9d;
  background: transparent;
  transform: translateY(-3px) scale(1.05);
}

:deep(.el-menu-item:hover::before) {
  opacity: 1;
}

:deep(.el-menu-item.is-active) {
  color: #ff6b9d;
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.2) 0%,
    rgba(255, 192, 203, 0.3) 100%
  );
  border-bottom: none;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(255, 182, 193, 0.3);
}

:deep(.el-menu-item.is-active::before) {
  opacity: 0;
}

:deep(.el-menu-item.is-active::after) {
  display: none;
}

:deep(.el-menu-item:focus) {
  outline: none;
  background: transparent;
}

/* 下拉组件样式 */
:deep(.el-dropdown) {
  cursor: pointer;
  outline: none;
}

:deep(.el-dropdown .el-dropdown-link) {
  color: inherit;
  font-size: inherit;
  outline: none;
  display: flex;
  align-items: center;
  gap: inherit;
}

:deep(.el-avatar) {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-menu-demo {
    padding: 0 20px;
  }

  .right-menu {
    padding-right: 20px;
    gap: 10px;
  }

  .menu-item {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .logo {
    margin-left: 20px;
  }

  .logo img {
    height: 40px;
  }

  .header {
    height: 65px;
  }

  :deep(.el-menu-item) {
    height: 65px;
    line-height: 65px;
    padding: 0 18px;
    font-size: 14px;
  }

  .right-menu {
    height: 65px;
    padding-right: 16px;
  }
}
</style>
