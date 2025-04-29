<template>
  <!-- <Header2 title="联系我们" subtext="contact us" /> -->
  <div class="contact-container">
    <div>
      <!-- 联系 -->
      <div class="contact-info">
        <!-- 邮箱 -->
        <div class="contact-item">
          <div class="icon-container">
            <Mail color="#757575" size="54" strokeWidth="{1}" />
          </div>
          <p class="title">邮箱地址</p>
          <p class="content">xxxxxxx.163.com</p>
        </div>
        <!-- 号码 -->
        <div class="contact-item">
          <div class="icon-container">
            <Phone color="#757575" size="54" strokeWidth="{1}" />
          </div>
          <p class="title">手机号码</p>
          <p class="content">xxxxxxx.163.com</p>
        </div>
        <!-- 网站 -->
        <div class="contact-item">
          <div class="icon-container">
            <Globe color="#757575" size="54" strokeWidth="{1}" />
          </div>
          <p class="title">网站地址</p>
          <p class="content">xxxxxxx.163.com</p>
        </div>
        <!-- 营业时间 -->
        <div class="contact-item">
          <div class="icon-container">
            <CalendarDays color="#757575" size="54" strokeWidth="{1}" />
          </div>
          <p class="title">办公时间</p>
          <p class="content">周一至周五：早上9:00至晚上18：00周末休息</p>
        </div>
      </div>
      <!-- 反馈 -->
      <feedback v-if="!showThanks" />
      <thanks v-if="showThanks" @close="closeThanks" />
    </div>
  </div>
</template>
<script>
export default {
  name: "Contact",
};
</script>
<script setup>
import { ref } from "vue";
// import { Mail, Phone, CalendarDays, Globe } from "lucide-vue-next";
// import Header2 from "/src/components/Header2.vue";
import feedback from "./components/feedback.vue";
import thanks from "./components/thanks.vue";

const showThanks = ref(false);

const closeThanks = () => {
  showThanks.value = false;
};
</script>
<style scoped>
.contact-container {
  margin-bottom: 80px;
}

.contact-info {
  font-family: "Alibaba", sans-serif;
  margin-top: 40px;
  display: flex;
  justify-content: center;
  text-align: center;
  color: #424443;
}

.contact-item {
  margin: 0 60px;
}

.icon-container {
  margin-bottom: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 20px;
  color: #424443;
  margin-bottom: 5px;
}

.content {
  font-size: 14px;
  color: #424443;
  margin-bottom: 5px;
}

.contact-item:last-child .title,
.contact-item:last-child .content {
  width: 144px;
}

.contact-item:last-child .content {
  padding: 0 4px;
  line-height: 24px;
}

p {
  margin-bottom: 5px;
}
input {
  outline: none;
}
</style>
