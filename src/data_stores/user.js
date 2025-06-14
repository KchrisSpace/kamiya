import axios from "axios";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const userId = ref(localStorage.getItem("userId") || null);
  const loading = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const userAvatar = computed(() => userInfo.value?.["user-info"]?.avatar || "");
  const userNickname = computed(() => userInfo.value?.["user-info"]?.nickname || "");
  const isAdmin = computed(() => userInfo.value?.role === "admin");

  async function login(username, password, remember = false) {
    loading.value = true;
    try {
      if (username === "admin" && password === "000000") {
        const adminUser = {
          id: "admin",
          username: "admin",
          role: "admin",
          "user-info": {
            nickname: "管理员",
            avatar: "/public/images/users/avater/user0.png",
          },
        };

        setUserInfo(adminUser);
        setToken("admin-token");
        setUserId("admin");

        if (remember) {
          localStorage.setItem("remember", "true");
        }

        ElMessage.success("登录成功");
        return { success: true, isAdmin: true };
      }

      const response = await axios.get("http://localhost:3001/users");
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("用户数据格式错误");
      }

      const user = response.data.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        setUserInfo(user);
        setToken("user-token");
        setUserId(user.id);

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
    if (!token.value || !userId.value) return;

    loading.value = true;
    try {
      const response = await axios.get(`http://localhost:3001/users/${userId.value}`);
      if (response.data) {
        setUserInfo(userId.value);
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
  }

  function setToken(newToken) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }

  function setUserId(newUserId) {
    userId.value = newUserId;
    if (newUserId) {
      localStorage.setItem("userId", newUserId);
    } else {
      localStorage.removeItem("userId");
    }
  }

  function logout() {
    userInfo.value = null;
    setToken(null);
    setUserId(null);
    localStorage.removeItem("remember");
  }

  // Initial load of user info if token and userId exist
  if (token.value && userId.value) {
    getUserInfo();
  }

  return {
    userInfo,
    token,
    userId,
    isLoggedIn,
    isAdmin,
    loading,
    userAvatar,
    userNickname,
    login,
    getUserInfo,
    setUserInfo,
    setToken,
    setUserId,
    logout,
  };
});
