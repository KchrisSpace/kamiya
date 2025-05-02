<template>
  <div class="service-commitment">
    <h2 class="section-title">服务承诺</h2>
    <div class="commitment-grid">
      <div class="commitment-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'heart']" />
        </div>
        <div class="card-content">
          <h3>品质保证</h3>
          <p>精选优质原料，严格把控制作流程，确保每一款甜点都达到最高标准。</p>
        </div>
      </div>
      <div class="commitment-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'truck']" />
        </div>
        <div class="card-content">
          <h3>配送服务</h3>
          <p>满199元包邮，专业冷链配送，确保甜点新鲜送达。</p>
        </div>
      </div>
      <div class="commitment-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'clock']" />
        </div>
        <div class="card-content">
          <h3>准时送达</h3>
          <p>承诺准时送达，迟到赔付，让您享受无忧购物体验。</p>
        </div>
      </div>
      <div class="commitment-card">
        <div class="card-icon">
          <font-awesome-icon :icon="['fas', 'shield-alt']" />
        </div>
        <div class="card-content">
          <h3>售后保障</h3>
          <p>7天无理由退换，质量问题全额退款，让您购物无忧。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-commitment {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(255, 192, 203, 0.1);
}

.commitment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.commitment-card {
  background: #fff9f0;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.commitment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(255, 192, 203, 0.15);
}

.card-icon {
  width: 50px;
  height: 50px;
  background: #fff5f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 20px;
  color: #ffb6c1;
  transition: all 0.3s ease;
}

.card-content h3 {
  font-size: 16px;
  color: #4a4a4a;
  margin-bottom: 10px;
}

.card-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.section-title {
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
}

@media (max-width: 768px) {
  .commitment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
