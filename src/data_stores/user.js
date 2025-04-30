import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null);
  const token = ref(localStorage.getItem("token") || null);

  const isLoggedIn = computed(() => !!token.value);

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

  function logout() {
    userInfo.value = null;
    setToken(null);
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    setToken,
    logout,
  };
});
