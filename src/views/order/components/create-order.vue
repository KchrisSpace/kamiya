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
          <div class="summary-item">
            <span>商品总价</span>
            <span>¥{{ totalPrice }}</span>
          </div>
          <div class="summary-item">
            <span>运费</span>
            <span>¥{{ shippingFee }}</span>
          </div>
          <div class="summary-item total">
            <span>应付金额</span>
            <span class="final-price">¥{{ finalPrice }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="payment-right">
      <div class="payment-info">
        <h3>支付信息</h3>
        <div class="delivery-info">
          <h4>收货信息</h4>
          <div class="address-card" v-if="addressStore.addresses.length > 0">
            <p class="receiver w-fit">
              收货人：{{ addressStore.defaultAddress?.consignee }}
            </p>
            <p class="phone w-fit">
              电话：{{ addressStore.defaultAddress?.phone }}
            </p>
            <p class="address w-fit">
              地址：{{ addressStore.defaultAddress?.region }}
              {{ addressStore.defaultAddress?.detail }}
            </p>
            <button
              @click="showNewAddressModal = true"
              class="edit-address-btn"
            >
              新增
            </button>
          </div>

          <div v-else class="no-address">
            <p>请先添加收货地址</p>
            <button @click="showNewAddressModal = true" class="add-address-btn">
              添加地址
            </button>
          </div>
        </div>
        <div class="delivery-time">
          <h4>配送时间</h4>
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
          <p>仅支持货到付款</p>
        </div>
      </div>
      <div class="create-order">
        <button class="pay-button" @click="createOrder">创建订单</button>
      </div>
    </div>
  </div>
  <div
    v-if="showNewAddressModal"
    class="modal-overlay"
    @click="showNewAddressModal = false"
  >
    <div class="modal-content" @click.stop>
      <h5>添加收货地址</h5>
      <form @submit.prevent="addNewAddress">
        <div class="form-group">
          <label for="region"
            >地址信息 <span class="text-font-primary">*</span></label
          >
          <select v-model="newAddress.region" required>
            <option value="" disabled>请选择省/市/区/街道</option>
            <option
              v-for="option in addressOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="address"
            >详细信息 <span class="text-font-primary">*</span></label
          >
          <textarea
            placeholder="请输入详细地址信息，如道路，门牌号，小区，楼栋号，单元等信息"
            v-model="newAddress.address"
            @blur="validateAddress"
            required
          ></textarea>
          <p class="error-message" v-if="addressError">{{ addressError }}</p>
        </div>

        <div class="form-group">
          <label for="name"
            >收货人姓名 <span class="text-font-primary">*</span></label
          >
          <input
            type="text"
            placeholder="长度不超过25字符"
            v-model="newAddress.name"
            @input="validateName"
            required
          />
          <p class="error-message" v-if="nameError">{{ nameError }}</p>
        </div>

        <div class="form-group">
          <label for="phone"
            >手机号码 <span class="text-font-primary">*</span></label
          >
          <input
            type="tel"
            placeholder="请输入手机号码"
            v-model="newAddress.phone"
            @input="validatePhone"
            required
          />
          <p class="error-message" v-if="phoneError">{{ phoneError }}</p>
        </div>

        <div class="checkbox-group">
          <input
            type="checkbox"
            v-model="newAddress.isDefault"
            id="defaultAddress"
          />
          <label for="defaultAddress">设为默认地址</label>
        </div>

        <div class="modal-buttons">
          <button type="button" @click="showNewAddressModal = false">
            取消
          </button>
          <button type="submit">确认</button>
        </div>
      </form>
    </div>
  </div>
  <LoginTip v-if="showLoginTip"  />
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
const addressStore = useAddressStore();
const cartItems = ref([]);
// const address = ref(null);
const selectedMethod = ref("wechat");
const selectedDate = ref("");
const selectedTime = ref("");
const showNewAddressModal = ref(false);
const nameError = ref("");
const addressError = ref("");
const phoneError = ref("");
const userid = localStorage.getItem("userId");
// 判断是否为编辑
const editingAddressId = ref("");
const newAddress = ref({
  user_id: "02",
  name: "",
  phone: "",
  region: "",
  address: "",
  isDefault: false,
});

// 示例地址选项
const addressOptions = ref([
  "成都市/郫都区",
  "成都市/青羊区",
  "成都市/金牛区",
  "成都市/成华区",
  "成都市/高新区",
  "成都市/锦江区",
  "成都市/温江区",
  "成都市/双流区",
  "成都市/龙泉驿区",
  // 添加更多选项
]);
// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7;
};

const timeSlots = [
  { label: "09:00-12:00", value: "morning" },
  { label: "14:00-18:00", value: "afternoon" },
  { label: "18:00-21:00", value: "evening" },
];

// 获取地址数据
const fetchAddress = async () => {
  try {
    await addressStore.fetchAddresses();
    console.log("地址列表:", addressStore.addresses);
    console.log("默认地址:", addressStore.defaultAddress);
  } catch (error) {
    console.error("获取地址失败:", error);
    ElMessage.error("获取地址失败，请重试");
  }
};

// 监听地址变化
watch(
  () => addressStore.addresses,
  (newAddresses) => {
    console.log("地址列表变化:", newAddresses);
  },
  { immediate: true }
);

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

// 运费
const shippingFee = ref(0);

// 最终价格
const finalPrice = computed(() => {
  return (parseFloat(totalPrice.value) + shippingFee.value).toFixed(2);
});

// 创建订单
const createOrder = async () => {
  if (!userid) {
    showLoginTip.value = true;
    // ElMessage.error("请先登录");
    return;
  }
  if (!selectedDate.value || !selectedTime.value) {
    ElMessage.error("请选择配送日期和时间");
    return;
  }

  if (!addressStore.addresses) {
    ElMessage.warning("请先选择收货地址");
    return;
  }

  try {
    const orderData = {
      user_id:userid,
      items: cartStore.cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      total_price: finalPrice.value,
      shipping_fee: shippingFee.value,
      delivery_time: `${selectedDate.value}T${selectedTime.value}:00Z`,
      status: "进行中",
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
      // 清空配送时间
      selectedDate.value = "";
      selectedTime.value = "";
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

// 处理地址更新
const handleAddressUpdate = async (updatedAddress) => {
  try {
    await addressStore.updateAddress(updatedAddress);
    ElMessage.success("地址更新成功");
    await fetchAddress();
  } catch (error) {
    console.error("更新地址失败:", error);
    ElMessage.error("更新地址失败，请重试");
  }
};

onMounted(async () => {
  try {
    // 确保购物车数据已加载
    if (!cartStore.cartItems.length) {
      await cartStore.fetchCartData();
    }
    cartItems.value = [...cartStore.cartItems];

    // 获取地址数据
    await fetchAddress();
  } catch (error) {
    console.error("初始化数据失败:", error);
    ElMessage.error("加载数据失败，请重试");
  }
});
// 设置默认地址
async function setDefaultAddress(address) {
  if (address.is_default) {
    return;
  }
  try {
    await addressStore.setDefaultAddress(address.id);
  } catch (error) {
    console.error("设置默认地址失败:", error);
  }
}

// 收货人姓名校验
const validateName = () => {
  if (newAddress.value.name.length > 25) {
    nameError.value = "收货人姓名不能超过25个字符";
  } else {
    nameError.value = "";
  }
};

// 详细地址校验
const validateAddress = () => {
  const addressLength = newAddress.value.address.length;
  const emojiPattern = /[\u{1F600}-\u{1F64F}]/u; // 简单的表情符号检测
  if (
    addressLength < 2 ||
    addressLength > 120 ||
    emojiPattern.test(newAddress.value.address)
  ) {
    addressError.value =
      "详细地址长度需要在2-120个字符之间，且不能包含表情符号";
    alert("详细地址长度需要在2-120个字符之间，且不能包含表情符号");
  } else {
    addressError.value = "";
  }
};

// 手机号码校验
const validatePhone = () => {
  const phonePattern = /^[0-9]{10,11}$/; // 假设电话号码为10到11位数字
  if (!phonePattern.test(newAddress.value.phone)) {
    phoneError.value = "请输入有效的电话号码";
  } else {
    phoneError.value = "";
  }
};

// 添加新地址
async function addNewAddress() {
  try {
    const addressData = {
      user_id: newAddress.value.user_id,
      consignee: newAddress.value.name,
      phone: newAddress.value.phone,
      region: newAddress.value.region,
      detail: newAddress.value.address,
      is_default: newAddress.value.isDefault,
    };

    // 保证全局唯一
    if (addressData.is_default) {
      for (const addr of addressStore.addresses) {
        if (addr.is_default && addr.id !== editingAddressId.value) {
          await addressStore.updateAddress(addr.id, {
            ...addr,
            is_default: false,
          });
        }
      }
    }

    if (editingAddressId.value) {
      await addressStore.updateAddress(editingAddressId.value, addressData);
    } else {
      await addressStore.addAddress(addressData);
    }

    showNewAddressModal.value = false;
    editingAddressId.value = "";
    newAddress.value = {
      user_id: "02",
      name: "",
      phone: "",
      region: "",
      address: "",
      isDefault: false,
    };
  } catch (error) {
    console.error("保存地址失败:", error);
  }
}
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
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
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

.address-card {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 14px;
}

.address-card p {
  margin: 0;
  color: #666;
}

.no-address {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #666;
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

.edit-address-btn {
  color: #f26371;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
  font-size: 16px;
}

.edit-address-btn:hover {
  background: #fbe4e9;
  transform: translateY(-2px);
}

.add-address-btn {
  background: #f26371;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.add-address-btn:hover {
  background: #fbe4e9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .payment-container {
    flex-direction: column;
  }

  .payment-left,
  .payment-right {
    width: 100%;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 2rem;
}

.modal-content h5 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

input[type="text"],
input[type="tel"],
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

input[type="text"]:focus,
input[type="tel"]:focus,
select:focus,
textarea:focus {
  border-color: #f26371;
  box-shadow: 0 0 0 2px rgba(242, 99, 113, 0.1);
  outline: none;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
  accent-color: #f26371;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-buttons button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-buttons button[type="button"] {
  background: white;
  border: 1px solid #e5e5e5;
  color: #666;
}

.modal-buttons button[type="submit"] {
  background: #f26371;
  border: none;
  color: white;
}

.modal-buttons button:hover {
  transform: translateY(-2px);
}

.modal-buttons button[type="button"]:hover {
  background: #f9f9f9;
  border-color: #f26371;
  color: #f26371;
}

.modal-buttons button[type="submit"]:hover {
  background: #fbe4e9;
  color: #f26371;
}

.error-message {
  color: #f26371;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
