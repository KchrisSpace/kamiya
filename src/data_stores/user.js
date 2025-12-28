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
  const userAvatar = computed(
    () => userInfo.value?.user_info?.avatar || userInfo.value?.["user-info"]?.avatar || ""
  );
  const userNickname = computed(
    () => userInfo.value?.user_info?.nickname || userInfo.value?.["user-info"]?.nickname || ""
  );
  const isAdmin = computed(() => userInfo.value?.role === "admin");

  async function login(identifier, password, remember = false) {
    loading.value = true;
    try {
      // 管理员登录（支持admin用户名）
      if (identifier === "admin" && password === "000000") {
        const adminUser = {
          id: "admin",
          username: "admin",
          role: "admin",
          user_info: {
            nickname: "管理员",
            avatar: "/images/users/avater/user0.png",
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

      // 判断输入的是ID还是手机号
      const isPhone = /^1[3-9]\d{9}$/.test(identifier); // 手机号格式：11位数字，以1开头，第二位是3-9
      const isUserId = identifier.startsWith("user"); // ID格式：以user开头

      let user = null;

      if (isPhone) {
        // 通过手机号登录
        user = response.data.find(
          (u) => u.phone === identifier && u.password === password
        );
      } else if (isUserId) {
        // 通过用户ID登录
        user = response.data.find(
          (u) => u.id === identifier && u.password === password
        );
      } else {
        // 兼容旧方式：通过用户名登录
        user = response.data.find(
          (u) => u.username === identifier && u.password === password
        );
      }

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

      throw new Error("用户ID/手机号或密码错误");
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
      const response = await axios.get(
        `http://localhost:3001/users/${userId.value}`
      );
      if (response.data) {
        setUserInfo(response.data);
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

  async function updateUserInfo(updates) {
    if (!userId.value) {
      throw new Error("用户未登录");
    }

    loading.value = true;
    try {
      // 获取当前用户信息
      const currentUserResponse = await axios.get(
        `http://localhost:3001/users/${userId.value}`
      );
      const currentUser = currentUserResponse.data;

      // 更新用户信息（兼容新旧格式）
      const userInfoField = currentUser.user_info || currentUser["user-info"] || {};
      const updatedUser = {
        ...currentUser,
        user_info: {
          ...userInfoField,
          ...updates,
        },
        updated_at: new Date().toISOString(),
      };

      // 保存到服务器
      const response = await axios.put(
        `http://localhost:3001/users/${userId.value}`,
        updatedUser
      );

      // 更新本地状态
      setUserInfo(response.data);
      ElMessage.success("更新成功");
      return response.data;
    } catch (error) {
      console.error("更新用户信息失败:", error);
      ElMessage.error(error.message || "更新失败，请稍后重试");
      throw error;
    } finally {
      loading.value = false;
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
    updateUserInfo,
    logout,
  };
});
