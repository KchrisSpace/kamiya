<template>
  <div @click="$emit('close')" class="join-cart-modal">
    <div class="modal-content">
      <!-- 内容 -->
      <div class="modal-body">
        <!-- left -->
        <div class="product-image">
          <img :src="image" :alt="title" class="product-img" />
        </div>
        <!-- right -->
        <div class="product-info">
          <h4 class="product-title">{{ title }} x1</h4>
          <div class="success-message">
            <span class="message-text">成功添加到您的购物车</span>
          </div>
          <button class="view-cart-btn" @click="goToCart">查看购物车</button>
          <!-- 关闭按钮 -->
          <div class="close-btn">
            <div class="close" @click="$emit('close')">X</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join-cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 500px;
  height: 250px;
  position: relative;
}

.modal-body {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.product-image {
  margin: 0 16px;
  width: 160px;
  height: 184px;
  background-color: var(--color-bg-thirth);
  position: sticky;
  top: 20px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  margin: 0;
  font-size: 18px;

  color: var(--color-font-secondary);
}

.success-message {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.message-text {
  margin-left: 8px;
  font-size: 1.2rem;
  color: var(--color-font-secondary);
}

.view-cart-btn {
  position: relative;
  left: 40px;
  background-color: var(--color-font-primary);
  width: 170px;
  height: 30px;
  color: white;
  padding: 4px 0;
  margin-top: 20px;
  border: none;
  cursor: pointer;

  transition: background-color 0.3s;
  background-color: rgb(248, 169, 180);
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  color: rgb(238, 67, 29);
  background-color: rgb(247, 246, 246);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

 
</style>

<script>
export default {
  name: "JoinCart",
  props: {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  methods: {
    goToCart() {
      this.$router.push("/cart");
    },
  },
};
</script>
