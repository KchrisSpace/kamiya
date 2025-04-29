<template>
  <div class="feedback-container">
    <h1 class="feedback-title">反馈</h1>
    <form
      class="feedback-form"
      v-if="!showThanks"
      @submit.prevent="handleSubmit"
    >
      <!-- left -->
      <div class="form-left">
        <input
          type="text"
          v-model="formData.name"
          placeholder="姓名"
          class="form-input"
        />
        <input
          type="email"
          v-model="formData.email"
          placeholder="邮箱"
          class="form-input"
        />
        <input
          type="tel"
          v-model="formData.phone"
          placeholder="电话号码"
          class="form-input"
        />
      </div>
      <!-- right -->
      <div class="form-right">
        <textarea
          v-model="formData.feedback_message"
          placeholder="反馈内容"
          class="feedback-textarea"
        />
      </div>
      <!-- 提交 -->
      <div class="submit-container">
        <input type="submit" value="提交" class="submit-button" />
      </div>
    </form>
    <thanks
      v-if="showThanks"
      @close="closeThanks"
      :showFeedback="showFeedback"
    />
  </div>
</template>

<script>
export default {
  name: "Feedback",
};
</script>

<script setup>
import { ref } from "vue";
import thanks from "./thanks.vue";
import axios from "axios";

const showThanks = ref(false);
const formData = ref({
  user_id: "02", // 默认用户ID
  name: "",
  email: "",
  phone: "",
  feedback_message: "",
  created_at: new Date().toISOString(),
});

// 电话号码验证函数
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 邮箱验证函数
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const handleSubmit = async () => {
  try {
    // 表单验证
    if (
      !formData.value.name ||
      !formData.value.email ||
      !formData.value.phone ||
      !formData.value.feedback_message
    ) {
      alert("请填写所有必填字段");
      return;
    }

    // 验证邮箱格式
    if (!validateEmail(formData.value.email)) {
      alert("请输入正确的邮箱地址");
      return;
    }

    // 验证电话号码格式
    if (!validatePhone(formData.value.phone)) {
      alert("请输入正确的手机号码");
      return;
    }

    // 发送数据到服务器
    await axios.post("http://localhost:3001/feedback", formData.value);
    showThanks.value = true;
  } catch (error) {
    console.error("提交反馈失败:", error);
    alert("提交失败，请稍后重试");
  }
};

const closeThanks = () => {
  showThanks.value = false;
  formData.value = {
    user_id: "02",
    name: "",
    email: "",
    phone: "",
    feedback_message: "",
    created_at: new Date().toISOString(),
  };
};

const showFeedback = () => {
  showThanks.value = false;
};
</script>

<style scoped>
.feedback-container {
  font-family: "Alibaba", sans-serif;
}

.feedback-title {
  text-align: center;
}

.feedback-form {
  display: flex;
  justify-content: center;
  margin: 40px 0;
  flex-wrap: wrap;
}

.form-left {
  width: 33.33%;
  height: 184px;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 8px;
  background-color: rgba(240, 240, 240, 0.7);
  border: none;
  outline: none;
}

.form-right {
  width: 33.33%;
  font-size: 18px;
}

.feedback-textarea {
  width: 66.67%;
  height: 184px;
  padding: 8px;
  background-color: rgba(240, 240, 240, 0.7);
  border: none;
  outline: none;
  resize: none;
}

.submit-container {
  width: 100%;
  margin-top: 40px;
  font-size: 18px;
  text-align: center;
}

.submit-button {
  width: 150px;
  height: 40px;
  color: white;
  background-color: #f26371;
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  opacity: 0.9;
}
</style>
