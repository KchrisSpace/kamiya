<template>
  <div class="orders">
    <div class="header">
      <h2>订单管理</h2>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="订单号">
          <el-input v-model="filterForm.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="待商家确认" value="待商家确认" />
            <el-option label="进行中" value="进行中" />
            <el-option label="预备出餐中" value="预备出餐中" />
            <el-option label="已出餐" value="已出餐" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="orders" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="userId" label="用户ID" width="120" />
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="{ row }"> ¥{{ row.totalAmount }} </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="customer" label="客户信息" width="200">
        <template #default="{ row }">
          <div>{{ row.customer.name }}</div>
          <div class="customer-contact">{{ row.customer.phone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleViewDetail(row)"
            >查看订单</el-button
          >
          <el-button
            v-if="row.status === '待商家确认'"
            type="danger"
            link
            @click="handleReject(row)"
          >
            拒绝接单
          </el-button>
          <el-button
            v-if="row.status === '预备出餐中'"
            type="success"
            link
            @click="handleConfirmDelivery(row)"
          >
            确认出餐
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="70%"
      @close="handleCloseDialog"
    >
      <OrderDetail
        v-if="currentOrder"
        :order="currentOrder"
        @close="handleCloseDialog"
        @update="handleOrderUpdate"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import OrderDetail from "./components/OrderDetail.vue";
import axios from "axios";
import { useProductsStore } from "../../../data_stores/products";

const productsStore = useProductsStore();
const loading = ref(false);
const allOrders = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const currentOrder = ref(null);

// 设置管理员角色
onMounted(() => {
  localStorage.setItem("userRole", "admin");
});

const filterForm = reactive({
  orderNo: "",
  status: "",
  dateRange: [],
});

// 格式化订单数据，转换为表格需要的格式
const formatOrder = (order) => {
  return {
    id: order.id,
    orderNo: `ORDER${String(order.id).padStart(6, "0")}`,
    userId: order.user_id || "未知",
    createTime: order.created_at
      ? new Date(order.created_at).toLocaleString("zh-CN")
      : "",
    totalAmount: order.total_price || "0.00",
    status: order.status || "待商家确认",
    customer: {
      name: order.consignee || "未知",
      phone: order.phone || "",
    },
    originalOrder: order, // 保存原始订单数据用于详情页
  };
};

const getStatusType = (status) => {
  const types = {
    待商家确认: "warning",
    待客户确认: "warning",
    待用户确定订单: "warning",
    协商中: "warning",
    预备出餐中: "primary",
    进行中: "primary",
    已出餐: "success",
    已完成: "success",
    已取消: "danger",
  };
  return types[status] || "info";
};

const getStatusName = (status) => {
  return status || "未知";
};

// 过滤后的订单列表
const filteredOrders = computed(() => {
  let result = [...allOrders.value];

  // 订单号过滤
  if (filterForm.orderNo && filterForm.orderNo.trim()) {
    const orderNo = filterForm.orderNo.trim().toLowerCase();
    result = result.filter((order) =>
      order.orderNo.toLowerCase().includes(orderNo)
    );
  }

  // 状态过滤
  if (filterForm.status && filterForm.status.trim()) {
    result = result.filter((order) => order.status === filterForm.status);
  }

  // 日期范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange;
    result = result.filter((order) => {
      if (!order.originalOrder?.created_at) return false;
      const orderDate = new Date(order.originalOrder.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  return result;
});

// 分页后的订单列表
const orders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// 更新总数
watch(
  filteredOrders,
  (newVal) => {
    total.value = newVal.length;
    // 如果当前页超出范围，重置到第一页
    if (
      currentPage.value > Math.ceil(newVal.length / pageSize.value) &&
      newVal.length > 0
    ) {
      currentPage.value = 1;
    }
  },
  { immediate: true }
);

const fetchOrders = async () => {
  loading.value = true;
  try {
    // 先获取商品数据
    await productsStore.fetchProducts();

    // 获取订单数据
    const response = await axios.get("http://localhost:3001/normal_orders");
    allOrders.value = response.data.map(formatOrder);
    total.value = allOrders.value.length;
  } catch (error) {
    console.error("获取订单失败:", error);
    ElMessage.error("获取订单失败");
    allOrders.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

const resetFilter = () => {
  filterForm.orderNo = "";
  filterForm.status = "";
  filterForm.dateRange = [];
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchOrders();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchOrders();
};

const handleViewDetail = (row) => {
  // 格式化订单数据供详情页使用
  const originalOrder = row.originalOrder || row;

  // 获取商品信息
  const products =
    originalOrder.items?.map((item) => {
      const product = productsStore.products.find(
        (p) => p.id === item.product_id
      );
      const price =
        item.single_price || product?.price_info?.current_price || 0;
      return {
        name: product?.title || `商品 ${item.product_id}`,
        price: price,
        quantity: item.quantity,
        image: product?.images || "",
        product_id: item.product_id,
      };
    }) || [];

  // 格式化取餐时间
  const formatDeliveryTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const timeMap = {
        morning: "09:00-12:00",
        afternoon: "12:00-18:00",
        evening: "18:00-21:00",
      };
      const dateMatch = timeStr.match(/^(\d{4}-\d{2}-\d{2})T/);
      const timeMatch = timeStr.match(/T(\w+):/);
      if (dateMatch && timeMatch) {
        const date = dateMatch[1];
        const timeSlot = timeMap[timeMatch[1]] || timeMatch[1];
        return `${date} ${timeSlot}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  currentOrder.value = {
    id: originalOrder.id,
    orderNo: row.orderNo,
    createTime: row.createTime,
    totalAmount: originalOrder.total_price || row.totalAmount,
    status: originalOrder.status || row.status,
    customer: {
      name: originalOrder.consignee || row.customer?.name || "未知",
      phone: originalOrder.phone || row.customer?.phone || "",
    },
    delivery_time: formatDeliveryTime(originalOrder.delivery_time),
    remark: originalOrder.remark || "",
    products: products,
    originalOrder: originalOrder, // 保存原始数据
  };

  dialogVisible.value = true;
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  currentOrder.value = null;
};

const handleOrderUpdate = () => {
  // 重新获取订单数据
  fetchOrders();
  // 如果当前订单对话框打开，重新加载当前订单详情
  if (dialogVisible.value && currentOrder.value) {
    const orderId = currentOrder.value.id;
    fetchOrders().then(() => {
      const updatedOrder = allOrders.value.find((o) => o.id === orderId);
      if (updatedOrder) {
        handleViewDetail(formatOrder(updatedOrder));
      }
    });
  }
};

const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm("确定要拒绝接单吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const orderId = row.originalOrder?.id || row.id;
    await axios.put(`http://localhost:3001/normal_orders/${orderId}`, {
      ...row.originalOrder,
      status: "已取消",
      updated_at: new Date().toISOString(),
    });

    ElMessage.success("已拒绝接单");
    await fetchOrders(); // 重新获取订单列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("拒绝接单失败:", error);
      ElMessage.error("拒绝接单失败");
    }
  }
};

const handleConfirmDelivery = async (row) => {
  try {
    await ElMessageBox.confirm("确定该订单已出餐吗？", "确认出餐", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });

    const orderId = row.originalOrder?.id || row.id;
    const originalOrder = row.originalOrder;
    
    // 更新订单状态为"已出餐"，并更新出餐时间
    await axios.put(`http://localhost:3001/normal_orders/${orderId}`, {
      ...originalOrder,
      status: "已出餐",
      shipped_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    ElMessage.success("已确认出餐");
    await fetchOrders(); // 重新获取订单列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认出餐失败:", error);
      ElMessage.error("确认出餐失败，请稍后重试");
    }
  }
};

// 监听过滤条件变化，重置到第一页
watch(
  [
    () => filterForm.orderNo,
    () => filterForm.status,
    () => filterForm.dateRange,
  ],
  () => {
    currentPage.value = 1;
  }
);

// 初始化
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.customer-contact {
  font-size: 12px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
