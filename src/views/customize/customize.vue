<!-- 定制页面 -->
<template>
  <div class="customize">
    <h1>来图定制</h1>
    <div class="upload-section">
      <p>上传您的图片：</p>
      <input type="file" accept="image/*" />
    </div>

    <h1>AI 文生图</h1>
    <div class="ai-section">
      <p>请描述您想要的甜品：</p>
      <textarea placeholder="请输入描述..." rows="4"></textarea>
      <button>生成图片</button>
    </div>
  </div>
</template>

<script setup>
// 暂时未实现具体功能
</script>

<style scoped>
.customize {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.upload-section,
.ai-section {
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.upload-section p,
.ai-section p {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
}

input[type="file"] {
  display: block;
  margin-top: 10px;
}

textarea {
  width: 100%;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

button {
  display: block;
  margin: 10px auto 0;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}
</style>
