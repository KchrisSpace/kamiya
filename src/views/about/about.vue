<template>
  <!-- <Header2 title="联系我们" subtext="contact us" /> -->
  <div class="about-container">
    <div class="about-content">
      <!-- 品牌介绍 -->
      <brand-intro />

      <!-- 服务承诺和包邮政策 -->
      <div class="service-section">
        <service-commitment />
        <shipping-policy />
      </div>
      <!-- 联系方式 -->
      <ContactInfo />

      <!-- 商家资质 -->
      <merchant-qualification />

      
     
        <!-- 反馈表单 -->
      <div class="feedback-section">
        <feedback v-if="!showThanks" />
        <thanks v-if="showThanks" @close="closeThanks" />
      </div>
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

import BrandIntro from "./components/BrandIntro.vue";
import ServiceCommitment from "./components/ServiceCommitment.vue";
import ShippingPolicy from "./components/ShippingPolicy.vue";
import feedback from "./components/feedback.vue";
import thanks from "./components/thanks.vue";
import ContactInfo from "./components/ContactInfo.vue";

const showThanks = ref(false);

const closeThanks = () => {
  showThanks.value = false;
};

const imageUrl = ref("@/assets/images/about-banner.jpg");
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: #fff9f0;
  padding: 40px 0;
  position: relative;
  overflow: hidden;
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

/* 服务承诺和包邮政策样式 */
.service-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

/* 反馈表单样式 */
.feedback-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(255, 192, 203, 0.1);
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .service-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .about-content {
    padding: 0 15px;
  }
}

input {
  outline: none;
}

.contact-container {
  min-height: 100vh;
  background: #fff9f0;
  padding: 60px 0;
  position: relative;
  overflow: hidden;
}

.contact-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(
    180deg,
    rgba(255, 249, 240, 0.8) 0%,
    rgba(255, 249, 240, 0) 100%
  );
  z-index: 1;
}

.contact-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

.contact-info {
  margin-bottom: 80px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.info-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
}

.info-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd1dc, #ffb6c1);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(255, 192, 203, 0.15);
}

.card-icon {
  width: 70px;
  height: 70px;
  background: #fff5f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 28px;
  color: #ffb6c1;
  transition: all 0.3s ease;
  border: 2px dashed rgba(255, 182, 193, 0.3);
}

.info-card:hover .card-icon {
  background: #ffb6c1;
  color: white;
  transform: rotate(10deg);
  border-color: rgba(255, 182, 193, 0.5);
}

.card-content h3 {
  font-size: 20px;
  color: #4a4a4a;
  margin-bottom: 12px;
  font-weight: 600;
}

.card-content p {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.card-decoration {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #ffb6c1;
  border-radius: 50%;
  opacity: 0.5;
  animation: bounce 2s infinite;
}

.decoration-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.decoration-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.feedback-section {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
}

/* 装饰元素 */
.contact-container::after {
  content: "";
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100,20 Q140,40 100,60 Q60,40 100,20" fill="none" stroke="%23ffb6c1" stroke-width="2"/></svg>')
    no-repeat;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contact-content {
    padding: 0 20px;
  }

  .info-grid {
    grid-grid-template-columns: 1fr;
  }

  .feedback-section {
    padding: 20px;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff5f6;
  color: #ffb6c1;
  border-radius: 16px;
  gap: 10px;
}

.image-placeholder svg {
  font-size: 48px;
}

.image-placeholder span {
  font-size: 16px;
  color: #666;
}
</style>
