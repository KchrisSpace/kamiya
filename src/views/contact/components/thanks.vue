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
  background-color: #f26371;
  margin: 40px auto;
  display: flex;
  align-items: center;
  padding: 0 40px;
  border-radius: 8px;
}

.thanks-title {
  color: white;
  text-align: center;
  width: 100%;
}

.close-button {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  cursor: pointer;
  font-weight: bold;
}
</style>
