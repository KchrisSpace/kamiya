<template>
  <div class="brand-intro">
    <div class="intro-header">
      <h2 class="section-title">关于Kamiya</h2>
      <div class="title-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-dot"></div>
        <div class="decoration-line"></div>
      </div>
    </div>
    <div class="intro-content">
      <div class="intro-image">
        <img
          :src="imageUrl"
          alt="Kamiya品牌形象"
          @error="handleImageError"
          v-if="!imageError"
        />
        <div class="image-placeholder" v-else>
          <font-awesome-icon :icon="['fas', 'image']" />
          <span>Kamiya品牌形象</span>
        </div>
        <div class="image-overlay">
          <div class="overlay-content">
            <font-awesome-icon :icon="['fas', 'heart']" />
            <span>用心制作每一份甜蜜</span>
          </div>
        </div>
      </div>
      <div class="intro-text">
        <div class="text-content">
          <h3>我们的故事</h3>
          <p>
            Kamiya诞生于2015年，是一家专注于高品质甜点的品牌。我们相信，每一份甜点都应该是一次美好的体验，因此我们始终坚持：
          </p>
          <ul class="feature-list">
            <li>
              <font-awesome-icon :icon="['fas', 'check']" />
              <span>精选优质原料，确保每一口都是纯正美味</span>
            </li>
            <li>
              <font-awesome-icon :icon="['fas', 'check']" />
              <span>专业甜点师团队，用心制作每一款产品</span>
            </li>
            <li>
              <font-awesome-icon :icon="['fas', 'check']" />
              <span>不断创新，为顾客带来惊喜与感动</span>
            </li>
          </ul>
          <p class="highlight">让甜蜜与幸福在味蕾间绽放，是我们不变的追求。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const imageUrl = ref("@/assets/images/about-banner.jpg");
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.brand-intro {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
  position: relative;
  overflow: hidden;
}

.intro-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 32px;
  color: #4a4a4a;
  margin-bottom: 16px;
  font-weight: 600;
  position: relative;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #ffd1dc, #ffb6c1);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #ffb6c1;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.intro-content {
  display: flex;
  gap: 40px;
}

.intro-image {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  min-height: 400px;
  position: relative;
}

.intro-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.intro-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  padding: 20px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.intro-image:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.overlay-content svg {
  color: #ffb6c1;
}

.intro-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-content {
  padding: 20px;
}

.text-content h3 {
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 20px;
  font-weight: 600;
}

.text-content p {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.feature-list svg {
  color: #ffb6c1;
  font-size: 16px;
}

.highlight {
  font-style: italic;
  color: #ffb6c1;
  font-weight: 500;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff5f6;
  color: #ffb6c1;
  border-radius: 16px;
  gap: 12px;
}

.image-placeholder svg {
  font-size: 48px;
}

.image-placeholder span {
  font-size: 16px;
  color: #666;
}

@media (max-width: 1024px) {
  .intro-content {
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .brand-intro {
    padding: 30px 20px;
  }

  .intro-content {
    flex-direction: column;
  }

  .intro-image {
    min-height: 300px;
  }

  .section-title {
    font-size: 28px;
  }

  .text-content h3 {
    font-size: 20px;
  }
}
</style>
