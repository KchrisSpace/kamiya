<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">登录</h2>
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            type="text"
            v-model="formData.username"
            placeholder="用户名"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            v-model="formData.password"
            placeholder="密码"
            class="form-input"
            required
          />
        </div>
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="formData.remember" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>
        <button type="submit" class="submit-button">登录</button>
        <div class="auth-switch">
          还没有账号？
          <router-link to="/register" class="switch-link">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
};
</script>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const formData = ref({
  username: "",
  password: "",
  remember: false,
});

const handleLogin = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3001/login",
      formData.value
    );
    if (response.data.success) {
      // 存储用户信息和token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 如果选择记住我，设置更长的过期时间
      if (formData.value.remember) {
        localStorage.setItem("remember", "true");
      }

      // 跳转到首页
      router.push("/");
    } else {
      alert(response.data.message || "登录失败");
    }
  } catch (error) {
    console.error("登录失败:", error);
    alert("登录失败，请检查用户名和密码");
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  font-family: "Alibaba", sans-serif;
}

.auth-box {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.auth-title {
  text-align: center;
  color: #424443;
  margin-bottom: 30px;
  font-size: 24px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #f26371;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #424443;
}

.forgot-password {
  color: #f26371;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  height: 40px;
  background-color: #f26371;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover {
  opacity: 0.9;
}

.auth-switch {
  text-align: center;
  font-size: 14px;
  color: #424443;
}

.switch-link {
  color: #f26371;
  text-decoration: none;
}

.switch-link:hover {
  text-decoration: underline;
}
</style>
