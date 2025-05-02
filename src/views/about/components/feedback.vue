<template>
  <div class="feedback-container">
    <div class="feedback-header">
      <h2 class="feedback-title">反馈</h2>
      <p class="feedback-subtitle">我们期待听到您的声音</p>
      <div class="header-decoration">
        <div class="decoration-star">★</div>
        <div class="decoration-star">★</div>
        <div class="decoration-star">★</div>
      </div>
    </div>

    <form
      class="feedback-form"
      v-if="!showThanks"
      @submit.prevent="handleSubmit"
    >
      <div class="form-grid">
        <div class="form-group">
          <div class="input-field">
            <label for="name">姓名</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="name"
                v-model="formData.name"
                placeholder="请输入您的姓名"
                class="form-input"
              />
              <div class="input-icon">
                <font-awesome-icon :icon="['fas', 'user']" />
              </div>
            </div>
          </div>

          <div class="input-field">
            <label for="email">邮箱</label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="请输入您的邮箱"
                class="form-input"
              />
              <div class="input-icon">
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </div>
            </div>
          </div>

          <div class="input-field">
            <label for="phone">电话</label>
            <div class="input-wrapper">
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                placeholder="请输入您的电话号码"
                class="form-input"
              />
              <div class="input-icon">
                <font-awesome-icon :icon="['fas', 'phone']" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="input-field">
            <label for="message">反馈内容</label>
            <div class="textarea-wrapper">
              <textarea
                id="message"
                v-model="formData.feedback_message"
                placeholder="请输入您的反馈内容"
                class="form-textarea"
              ></textarea>
              <div class="textarea-icon">
                <font-awesome-icon :icon="['fas', 'comment']" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button type="submit" class="submit-button">
          <span>提交反馈</span>
          <div class="button-decoration">
            <div class="decoration-heart">❤</div>
            <div class="decoration-heart">❤</div>
          </div>
        </button>
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
  width: 100%;
}

.feedback-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.feedback-title {
  font-size: 32px;
  color: #4a4a4a;
  margin-bottom: 12px;
  font-weight: 600;
}

.feedback-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.header-decoration {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.decoration-star {
  color: #ffb6c1;
  font-size: 18px;
  animation: twinkle 2s infinite;
}

.decoration-star:nth-child(2) {
  animation-delay: 0.2s;
}

.decoration-star:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.feedback-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-field label {
  font-size: 14px;
  color: #4a4a4a;
  font-weight: 500;
}

.input-wrapper,
.textarea-wrapper {
  position: relative;
}

.input-icon,
.textarea-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffb6c1;
  font-size: 18px;
}

.textarea-icon {
  top: 20px;
  transform: none;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid rgba(255, 182, 193, 0.3);
  border-radius: 12px;
  font-size: 14px;
  color: #4a4a4a;
  transition: all 0.3s ease;
  background: #fff9f0;
}

.form-textarea {
  height: 200px;
  padding-top: 20px;
  resize: none;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ffb6c1;
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 182, 193, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #999;
}

.submit-section {
  text-align: center;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 36px;
  background: linear-gradient(135deg, #ffb6c1, #ffd1dc);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
}

.submit-button:hover::before {
  left: 100%;
}

.button-decoration {
  display: flex;
  gap: 4px;
}

.decoration-heart {
  color: white;
  font-size: 16px;
  animation: heartbeat 1s infinite;
}

.decoration-heart:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feedback-title {
    font-size: 28px;
  }

  .feedback-subtitle {
    font-size: 14px;
  }
}
</style>
