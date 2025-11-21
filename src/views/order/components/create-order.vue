<!-- 
   创建订单
   -->
<template>
  <div class="payment-container">
    <div class="payment-left">
      <div class="order-items">
        <h3>当前订单商品</h3>
        <div class="items-list">
          <div
            v-for="item in cartStore.cartItems"
            :key="item.id"
            class="order-item"
          >
            <img
              :src="item.product?.images"
              :alt="item.product?.title"
              class="item-image"
            />
            <div class="item-info">
              <div class="item-name-price">
                <p class="item-name">{{ item.product?.title }}</p>
                <p class="item-price">
                  ¥{{ item.product?.price_info?.current_price }}
                </p>
              </div>
              <p class="item-quantity">x{{ item.quantity }}</p>
            </div>
          </div>
        </div>
        <div class="order-summary">
          <div class="summary-item total">
            <span>应付金额</span>
            <span class="final-price">¥{{ totalPrice }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="payment-right">
      <div class="payment-info">
        <h3>订单信息</h3>
        <div class="delivery-info">
          <h4>取餐信息</h4>
          <div class="info-card">
            <div class="form-group">
              <label for="name"
                >姓名 <span class="text-font-primary">*</span></label
              >
              <input
                type="text"
                placeholder="请输入姓名"
                v-model="orderInfo.name"
                required
              />
            </div>
            <div class="form-group">
              <label for="phone"
                >电话 <span class="text-font-primary">*</span></label
              >
              <input
                type="tel"
                placeholder="请输入手机号码"
                v-model="orderInfo.phone"
                @input="validatePhone"
                required
              />
              <p class="error-message" v-if="phoneError">{{ phoneError }}</p>
            </div>
            <div class="form-group">
              <label for="remark">备注</label>
              <textarea
                placeholder="请输入备注信息（选填）"
                v-model="orderInfo.remark"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="delivery-time">
          <h4>预计取餐时间</h4>
          <div class="date-picker">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </div>
          <div class="time-slots">
            <div
              v-for="slot in timeSlots"
              :key="slot.value"
              class="time-slot"
              :class="{ active: selectedTime === slot.value }"
              @click="handleTimeSelect(slot.value)"
            >
              {{ slot.label }}
            </div>
          </div>
          <!-- 显示已选择的日期和时间 -->
          <div
            v-if="selectedDate || selectedTime"
            class="selected-time-display"
          >
            <p>已选择：{{ selectedDate }} {{ getTimeLabel(selectedTime) }}</p>
          </div>
        </div>
        <div class="payment-methods">
          <h4>支付方式</h4>
          <p>仅支持店内付款</p>
        </div>
      </div>
      <div class="create-order">
        <button class="pay-button" @click="createOrder">创建订单</button>
      </div>
    </div>
  </div>
  <LoginTip v-if="showLoginTip" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElDatePicker, ElMessage } from "element-plus";
import { useNormalOrdersStore } from "../../../data_stores/normal-orders";
import { useCartStore } from "../../../data_stores/cart";
import { useAddressStore } from "../../../data_stores/address";
import LoginTip from "./login-tip.vue";
const showLoginTip = ref(false);
const cartStore = useCartStore();
const router = useRouter();
const normalOrdersStore = useNormalOrdersStore();
const cartItems = ref([]);
const selectedMethod = ref("wechat");
const selectedDate = ref("");
const selectedTime = ref("");
const phoneError = ref("");
const userid = localStorage.getItem("userId");

// 订单信息
const orderInfo = ref({
  name: "",
  phone: "",
  remark: "",
});

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7;
};

const timeSlots = [
  { label: "09:00-12:00", value: "morning" },
  { label: "14:00-18:00", value: "afternoon" },
  { label: "18:00-21:00", value: "evening" },
];

// 计算总价
const totalPrice = computed(() => {
  return cartStore.cartItems
    .reduce((total, item) => {
      return (
        total + (item.product?.price_info?.current_price || 0) * item.quantity
      );
    }, 0)
    .toFixed(2);
});

// 创建订单
const createOrder = async () => {
  if (!userid) {
    showLoginTip.value = true;
    return;
  }

  // 验证姓名
  if (!orderInfo.value.name || orderInfo.value.name.trim() === "") {
    ElMessage.error("请输入姓名");
    return;
  }

  // 验证电话
  if (!orderInfo.value.phone || orderInfo.value.phone.trim() === "") {
    ElMessage.error("请输入手机号码");
    return;
  }

  // 去除所有空格和非数字字符，只保留数字
  const phoneNumber = orderInfo.value.phone.replace(/\D/g, "");

  // 验证是否为11位数字，且以1开头
  if (phoneNumber.length !== 11 || !phoneNumber.startsWith("1")) {
    ElMessage.error("请输入有效的手机号码（11位数字，以1开头）");
    return;
  }

  if (!selectedDate.value || !selectedTime.value) {
    ElMessage.error("请选择预计取餐日期和时间");
    return;
  }

  try {
    const orderData = {
      user_id: userid,
      items: cartStore.cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      total_price: totalPrice.value,
      shipping_fee: 0,
      delivery_time: `${selectedDate.value}T${selectedTime.value}:00Z`,
      consignee: orderInfo.value.name,
      phone: orderInfo.value.phone.replace(/\D/g, ""), // 保存时去除所有非数字字符
      remark: orderInfo.value.remark || "",
      status: "待商家确认",
      created_at: new Date().toISOString(),
    };

    // 先创建订单
    const result = await normalOrdersStore.addOrder(orderData);
    if (result) {
      // 等待购物车清空完成
      await cartStore.clearCart();
      // 重新获取购物车数据以确保同步
      await cartStore.fetchCartData();

      ElMessage.success("订单创建成功");
      // 清空表单
      selectedDate.value = "";
      selectedTime.value = "";
      orderInfo.value = {
        name: "",
        phone: "",
        remark: "",
      };
      // 跳转到订单列表页
      router.push("/order");
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    ElMessage.error("创建订单失败，请稍后重试");
  }
};

// 处理日期选择
const handleDateChange = (date) => {
  selectedDate.value = date;
  console.log("选择的日期:", date);
};

// 处理时间选择
const handleTimeSelect = (time) => {
  selectedTime.value = time;
  console.log("选择的时间:", time);
};

// 获取时间段的显示标签
const getTimeLabel = (timeValue) => {
  const slot = timeSlots.find((slot) => slot.value === timeValue);
  return slot ? slot.label : "";
};

// 手机号码校验
const validatePhone = () => {
  if (!orderInfo.value.phone || orderInfo.value.phone.trim() === "") {
    phoneError.value = "";
    return;
  }

  // 去除所有空格和非数字字符，只保留数字
  const phoneNumber = orderInfo.value.phone.replace(/\D/g, "");

  // 验证是否为11位数字，且以1开头
  if (phoneNumber.length !== 11 || !phoneNumber.startsWith("1")) {
    phoneError.value = "请输入有效的手机号码（11位数字，以1开头）";
  } else {
    phoneError.value = "";
  }
};

onMounted(async () => {
  try {
    // 确保购物车数据已加载
    if (!cartStore.cartItems.length) {
      await cartStore.fetchCartData();
    }
    cartItems.value = [...cartStore.cartItems];
  } catch (error) {
    console.error("初始化数据失败:", error);
    ElMessage.error("加载数据失败，请重试");
  }
});
</script>

<style scoped>
.payment-container {
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  gap: 2rem;
  padding: 0 1rem;
}

.payment-left {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.payment-right {
  flex: 2;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.payment-info h3 {
  text-align: center;
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1rem;
}

.delivery-info h4 {
  text-align: left;
  margin-left: 0;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.6rem;
}

.items-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;

  justify-content: space-between;
}

.item-name-price {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  gap: 0.5rem;
}

.item-name {
  font-size: 1rem;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  color: #f26371;
  font-weight: 500;
  margin: 0;
}

.item-quantity {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.order-summary {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  position: sticky;
  bottom: 0;
  background: white;
  margin-top: auto;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
}

.summary-item.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-weight: 600;
  color: #333;
}

.final-price {
  color: #f26371;
  font-size: 1.2rem;
}

.delivery-info {
  margin-bottom: 1rem;
}

.info-card {
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 182, 193, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-card .form-group {
  margin-bottom: 0;
}

.info-card label {
  display: block;
  margin-bottom: 0.3rem;
  color: #666;
  font-weight: 600;
  font-size: 13px;
  font-family: "Nunito", sans-serif;
}

.info-card input,
.info-card textarea {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-family: "Nunito", sans-serif;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #333;
}

.info-card input:focus,
.info-card textarea:focus {
  border-color: #ff6b9d;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
  outline: none;
}

.info-card textarea {
  min-height: 60px;
  resize: vertical;
  font-family: "Nunito", sans-serif;
}

.text-font-primary {
  color: #ff6b9d;
  font-weight: 700;
}

.pay-button {
  width: 50%;
  padding: 1rem;
  background: #f26371;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.pay-button:hover {
  background: #fbe4e9;
  transform: translateY(-2px);
}

.payment-methods {
  margin-bottom: 1rem;
}

.payment-methods h4 {
  text-align: left;
  margin-left: 0;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.payment-methods p {
  color: #666;
  margin: 0;
}

.delivery-time {
  margin-bottom: 1rem;
}

.delivery-time h4 {
  text-align: left;
  margin-left: 0;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.date-picker {
  margin-bottom: 1rem;
}

.time-slots {
  display: flex;
  gap: 0.5rem;
}

.time-slot {
  flex: 1;
  padding: 0.8rem;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.time-slot:hover {
  background: #f0f0f0;
}

.time-slot.active {
  background: #f26371;
  color: white;
}

.selected-time-display {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 4px;
  color: #333;
}

.selected-time-display p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .payment-container {
    flex-direction: column;
  }

  .payment-left,
  .payment-right {
    width: 100%;
  }

  .info-card {
    padding: 1rem;
  }
}
</style>
