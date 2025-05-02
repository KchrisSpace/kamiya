<template>
  <div class="contact-info">
    <h2 class="section-title">联系我们</h2>
    <div class="info-grid">
      <div class="info-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'phone']" />
        </div>
        <div class="card-content">
          <h3>联系电话</h3>
          <p>400-123-4567</p>
          <p>周一至周日 9:00-21:00</p>
        </div>
        <div class="card-decoration">
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
      <div class="info-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </div>
        <div class="card-content">
          <h3>电子邮箱</h3>
          <p>service@kamiya.com</p>
          <p>24小时内回复</p>
        </div>
        <div class="card-decoration">
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
      <div class="info-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
        </div>
        <div class="card-content">
          <h3>门店地址</h3>
          <p>上海市黄浦区南京东路123号</p>
          <p>营业时间：10:00-22:00</p>
        </div>
        <div class="card-decoration">
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
      <div class="info-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'clock']" />
        </div>
        <div class="card-content">
          <h3>营业时间</h3>
          <p>周一至周五：10:00-22:00</p>
          <p>周末及节假日：9:00-23:00</p>
        </div>
        <div class="card-decoration">
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-info {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(255, 192, 203, 0.1);
  margin-bottom: 40px;
  border: 1px solid rgba(255, 192, 203, 0.2);
  position: relative;
  overflow: hidden;
}

.contact-info::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd1dc, #ffb6c1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.info-card {
  background: #fff9f0;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(255, 192, 203, 0.1);
  border: 1px solid rgba(255, 192, 203, 0.2);
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
  margin: 0 auto 20px;
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
  margin-bottom: 8px;
}

.section-title {
  font-size: 28px;
  color: #4a4a4a;
  margin-bottom: 32px;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 16px;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ffd1dc, #ffb6c1);
  border-radius: 3px;
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

@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contact-info {
    padding: 30px 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 25px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 24px;
  }
}
</style>
