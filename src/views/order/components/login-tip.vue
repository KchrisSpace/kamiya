<template>
 
  <div v-if="showTip" class="login-tip">
    <p>您还未登录</p>
    <div class="buttons">
      <button @click="goToLogin">去登录</button>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const showTip = ref(true);

const goToLogin = () => {
  // 这里添加跳转到登录页面的逻辑
  window.location.href = "/login";
};
</script>

<style scoped>
.login-tip {
  width: 40vw;
  height: 20vw;
  padding: 20px;
  margin: 0 auto;
  background-color: #f8f9fa; /* 修改背景颜色 */
  border: 1px solid #dee2e6; /* 修改边框颜色 */
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: space-evenly;
  align-items: center;
}
p {
  font-size: 28px; /* 调整字体大小 */
  color: #495057; /* 调整字体颜色 */
}
.buttons {
  display: flex;
  gap: 10px;
}
button {
  display: flex;
  color: #000;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 40px;
  background-color: #dbd8c5;
  font-size: 20px;
  border: 1px solid #dee2e6; /* 添加边框 */
  border-radius: 3px; /* 添加圆角 */
  transition: background-color 0.3s, color 0.3s; /* 添加过渡效果 */
}
button:hover {
  background-color: #99a7b7; /* 悬停背景颜色 */
  color: #fff; /* 悬停字体颜色 */
}
</style>
