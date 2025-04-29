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
          <h4 class="product-title">{{ title }}</h4>
          <div class="success-message">
            <span class="success-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <circle cx="16" cy="16" r="16" fill="#20B759"></circle>
                <path
                  stroke="rgba(255, 255, 255, 1)"
                  stroke-width="2"
                  d="M5.5 16L15 21L25 8.5"
                ></path>
              </svg>
            </span>
            <span class="message-text">成功添加到您的购物车</span>
          </div>
          <button class="view-cart-btn" @click="goToCart">查看购物车</button>
          <!-- 关闭按钮 -->
          <div class="close-btn">
            <el-icon
              size="24"
              color="#fff"
              class="close-icon"
              @click="$emit('close')"
              ><Close
            /></el-icon>
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
}

.product-title {
  margin: 0;
  font-size: 18px;
  color: var(--color-font-secondary);
}

.success-message {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
}

.success-icon {
  width: 16px;
  height: 16px;
}

.message-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-font-secondary);
}

.view-cart-btn {
  background-color: var(--color-font-primary);
  width: 120px;
  color: white;
  padding: 4px 0;
  margin-top: 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-cart-btn:hover {
  background-color: rgba(242, 99, 113, 0.8);
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background-color: var(--color-font-primary);
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  cursor: pointer;
  font-weight: bold;
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
      this.$router.push("/cart"); // 假设购物车的路由是 '/cart'
    },
  },
};
</script>
