<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">
        <div class="admin-title">admin</div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Monitor /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="username">{{ username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout"
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <div class="admin-content">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../../data_stores/user";
import { Monitor, Goods, List, User, Setting } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const username = computed(() => userStore.userInfo?.username || "管理员");
const userAvatar = computed(
  () => userStore.userInfo?.avatar || "/images/default-avatar.png"
);

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
}

.admin-title {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-menu {
  border-right: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-menu::-webkit-scrollbar {
  width: 6px;
}

.admin-menu::-webkit-scrollbar-track {
  background: #2b2f3a;
}

.admin-menu::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 3px;
}

.admin-menu::-webkit-scrollbar-thumb:hover {
  background: #5a6578;
}

.admin-content {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  position: fixed;
  top: 0;
  right: 0;
  left: 200px;
  height: 60px;
  z-index: 999;
}

.el-main {
  margin-left: 200px;
  margin-top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}

.el-main::-webkit-scrollbar {
  width: 8px;
}

.el-main::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.el-main::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.el-main::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}
</style>
