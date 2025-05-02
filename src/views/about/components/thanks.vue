<template>
  <div class="thanks-container">
    <h4 class="thanks-title">提交成功！我们很高兴收到您的建议！</h4>
    <!-- 关闭按钮 -->
    <div class="close-button">
      <el-icon size="24" color="#fff" class="close-icon" @click="$emit('close')"
        ><Close
      /></el-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "Thanks",
};
</script>

<script setup></script>

<style scoped>
.thanks-container {
  position: relative;
  width: 33.33%;
  height: 184px;
  background: linear-gradient(135deg, #ffb6c1, #ffc0cb);
  margin: 40px auto;
  display: flex;
  align-items: center;
  padding: 0 40px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(242, 99, 113, 0.15);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.thanks-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.5), #ffffff);
  border-radius: 4px 4px 0 0;
}

.thanks-title {
  color: white;
  text-align: center;
  width: 100%;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-icon {
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.close-button:hover .close-icon {
  transform: scale(1.2);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .thanks-container {
    width: 80%;
    padding: 0 24px;
  }
}
</style>
