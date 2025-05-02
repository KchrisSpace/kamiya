<template>
  <div class="shipping-policy">
    <h2 class="section-title">包邮政策</h2>
    <div class="policy-content">
      <div class="policy-card">
        <h3>包邮条件</h3>
        <ul>
          <li>单笔订单满199元包邮</li>
          <li>偏远地区（新疆、西藏、青海）满299元包邮</li>
          <li>特殊商品（如定制蛋糕）不参与包邮活动</li>
        </ul>
      </div>
      <div class="policy-card">
        <h3>配送范围</h3>
        <ul>
          <li>全国范围内配送</li>
          <li>支持同城配送（3公里内免费配送）</li>
          <li>支持到店自提</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shipping-policy {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(255, 192, 203, 0.1);
}

.policy-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.policy-card {
  background: #fff9f0;
  border-radius: 16px;
  padding: 20px;
}

.policy-card h3 {
  font-size: 18px;
  color: #4a4a4a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #fff5f6;
}

.policy-card ul {
  list-style: none;
  padding: 0;
}

.policy-card ul li {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.policy-card ul li::before {
  content: "•";
  color: #ffb6c1;
  position: absolute;
  left: 0;
}

.section-title {
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
}
</style>
