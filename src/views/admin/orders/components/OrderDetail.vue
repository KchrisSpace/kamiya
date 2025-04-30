<template>
  <div class="order-detail">
    <el-descriptions title="订单信息" :column="2" border>
      <el-descriptions-item label="订单号">{{
        order.orderNo
      }}</el-descriptions-item>
      <el-descriptions-item label="下单时间">{{
        order.createTime
      }}</el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="getStatusType(order.status)">
          {{ getStatusName(order.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="订单金额"
        >¥{{ order.totalAmount }}</el-descriptions-item
      >
    </el-descriptions>

    <el-descriptions title="客户信息" :column="2" border class="mt-20">
      <el-descriptions-item label="客户姓名">{{
        order.customer.name
      }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{
        order.customer.phone
      }}</el-descriptions-item>
      <el-descriptions-item label="收货地址" :span="2">{{
        order.customer.address
      }}</el-descriptions-item>
    </el-descriptions>

    <div class="mt-20">
      <h3>商品信息</h3>
      <el-table :data="order.products" style="width: 100%">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }"> ¥{{ row.price }} </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ (row.price * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="mt-20">
      <h3>订单备注</h3>
      <el-input
        v-model="order.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入订单备注"
      />
    </div>

    <div class="mt-20">
      <h3>物流信息</h3>
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in order.logistics"
          :key="index"
          :timestamp="log.time"
          :type="log.type"
        >
          {{ log.content }}
        </el-timeline-item>
      </el-timeline>
    </div>

    <div class="footer">
      <el-button @click="$emit('close')">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const getStatusType = (status) => {
  const types = {
    pending: "warning",
    paid: "primary",
    shipped: "success",
    completed: "info",
    cancelled: "danger",
  };
  return types[status] || "info";
};

const getStatusName = (status) => {
  const names = {
    pending: "待付款",
    paid: "待发货",
    shipped: "已发货",
    completed: "已完成",
    cancelled: "已取消",
  };
  return names[status] || "未知";
};

// 模拟数据
const mockOrder = {
  orderNo: "ORDER000001",
  createTime: new Date().toLocaleString(),
  totalAmount: "999.00",
  status: "paid",
  customer: {
    name: "张三",
    phone: "13800138000",
    address: "广东省深圳市南山区科技园",
  },
  products: [
    {
      name: "商品1",
      price: 199.0,
      quantity: 2,
    },
    {
      name: "商品2",
      price: 299.0,
      quantity: 1,
    },
  ],
  remark: "请尽快发货",
  logistics: [
    {
      time: new Date().toLocaleString(),
      content: "订单已创建",
      type: "primary",
    },
    {
      time: new Date().toLocaleString(),
      content: "订单已支付",
      type: "success",
    },
  ],
};

// 如果传入的order为空，使用模拟数据
const order = computed(() => props.order || mockOrder);
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.footer {
  margin-top: 20px;
  text-align: right;
}
</style>
