<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">注册</h2>
      <form class="auth-form" @submit.prevent="handleRegister">
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
            type="email"
            v-model="formData.email"
            placeholder="邮箱"
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
        <div class="form-group">
          <input
            type="password"
            v-model="formData.confirmPassword"
            placeholder="确认密码"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="tel"
            v-model="formData.phone"
            placeholder="手机号码"
            class="form-input"
            required
          />
        </div>
        <button type="submit" class="submit-button">注册</button>
        <div class="auth-switch">
          已有账号？
          <router-link to="/login" class="switch-link">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
};
</script>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
});

// 验证手机号码
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证邮箱
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const handleRegister = async () => {
  try {
    // 表单验证
    if (formData.value.password !== formData.value.confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    if (!validateEmail(formData.value.email)) {
      alert("请输入正确的邮箱地址");
      return;
    }

    if (!validatePhone(formData.value.phone)) {
      alert("请输入正确的手机号码");
      return;
    }

    // 检查用户名是否已存在
    const usersResponse = await axios.get("http://localhost:3001/users");
    const existingUser = usersResponse.data.find(
      (u) => u.username === formData.value.username
    );

    if (existingUser) {
      alert("用户名已存在，请使用其他用户名");
      return;
    }

    // 生成用户ID（使用时间戳后6位 + 2位随机数，共8位数字）
    const timestamp = Date.now().toString();
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    let userId = `user${timestamp.slice(-6)}${randomSuffix}`;
    
    // 检查ID是否已存在，如果存在则重新生成
    let attempts = 0;
    while (usersResponse.data.some(u => u.id === userId) && attempts < 10) {
      const newRandomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      userId = `user${timestamp.slice(-6)}${newRandomSuffix}`;
      attempts++;
    }

    // 创建新用户
    const now = new Date().toISOString();
    const newUser = {
      id: userId,
      username: formData.value.username,
      password: formData.value.password,
      role: "user", // 默认角色为普通用户
      email: formData.value.email,
      phone: formData.value.phone,
      email_verified: false, // 默认未验证
      phone_verified: false, // 默认未验证
      account_status: "active", // 默认账户状态为激活
      user_info: {
        nickname: formData.value.username,
        avatar: "",
      },
      created_at: now,
      updated_at: now,
    };

    // 发送注册请求
    await axios.post("http://localhost:3001/users", newUser);

    alert("注册成功，请登录");
    router.push("/login");
  } catch (error) {
    console.error("注册失败:", error);
    alert("注册失败，请稍后重试");
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
