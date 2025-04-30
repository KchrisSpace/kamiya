import axios from "axios";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const loading = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const userAvatar = computed(
    () => userInfo.value?.["user-info"]?.avatar || ""
  );
  const userNickname = computed(
    () => userInfo.value?.["user-info"]?.nickname || ""
  );
  const isAdmin = computed(() => userInfo.value?.role === "admin");

  async function login(username, password, remember = false) {
    loading.value = true;
    try {
      // 验证管理员账号
      if (username === "admin" && password === "000000") {
        const adminUser = {
          username: "admin",
          role: "admin",
          "user-info": {
            nickname: "管理员",
            avatar: "/public/images/users/avater/user0.png",
          },
        };

        setUserInfo(adminUser);
        setToken("admin-token");

        if (remember) {
          localStorage.setItem("remember", "true");
        }

        ElMessage.success("登录成功");
        return { success: true, isAdmin: true };
      }

      // 验证普通用户账号
      const response = await axios.get("http://localhost:3001/users");
      console.log("用户数据:", response.data); // 添加日志查看数据结构

      // 确保数据结构正确
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("用户数据格式错误");
      }

      // 查找匹配的用户
      const user = response.data.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        setUserInfo(user);
        setToken("user-token");

        if (remember) {
          localStorage.setItem("remember", "true");
        }

        ElMessage.success("登录成功");
        return { success: true, isAdmin: false };
      }

      throw new Error("用户名或密码错误");
    } catch (error) {
      console.error("登录失败:", error);
      ElMessage.error(error.message || "登录失败，请稍后重试");
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  async function getUserInfo() {
    if (!token.value) return;

    loading.value = true;
    try {
      // 从 users 接口获取所有用户数据
      const response = await axios.get("http://localhost:3001/users");

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("用户数据格式错误");
      }

      // 根据当前用户信息查找对应的用户数据
      const currentUser = response.data.find(
        (user) => user.username === userInfo.value?.username
      );

      if (currentUser) {
        setUserInfo(currentUser);
      } else {
        throw new Error("用户信息不存在");
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      ElMessage.error(error.message || "获取用户信息失败");
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      loading.value = false;
    }
  }

  function setUserInfo(info) {
    userInfo.value = info;
    if (info) {
      localStorage.setItem("userInfo", JSON.stringify(info));
    } else {
      localStorage.removeItem("userInfo");
    }
  }

  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }

  function logout() {
    userInfo.value = null;
    setToken(null);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("remember");
  }

  function initUserInfo() {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo);
      } catch (error) {
        console.error("解析用户信息失败:", error);
        localStorage.removeItem("userInfo");
      }
    }
  }

  initUserInfo();

  return {
    userInfo,
    token,
    isLoggedIn,
    isAdmin,
    loading,
    userAvatar,
    userNickname,
    login,
    getUserInfo,
    setUserInfo,
    setToken,
    logout,
  };
});
