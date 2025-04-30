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
            <el-option label="待付款" value="pending" />
            <el-option label="待发货" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleViewDetail(row)"
            >详情</el-button
          >
          <el-button
            v-if="row.status === 'paid'"
            type="primary"
            link
            @click="handleShip(row)"
          >
            发货
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="danger"
            link
            @click="handleCancel(row)"
          >
            取消
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
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import OrderDetail from "./components/OrderDetail.vue";

// 模拟数据
const mockOrders = Array.from({ length: 50 }, (_, i) => ({
  orderNo: `ORDER${String(i + 1).padStart(6, "0")}`,
  createTime: new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
  ).toLocaleString(),
  totalAmount: (Math.random() * 1000).toFixed(2),
  status: ["pending", "paid", "shipped", "completed", "cancelled"][
    Math.floor(Math.random() * 5)
  ],
  customer: {
    name: `客户 ${i + 1}`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(
      8,
      "0"
    )}`,
  },
}));

const loading = ref(false);
const orders = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const currentOrder = ref(null);

const filterForm = reactive({
  orderNo: "",
  status: "",
  dateRange: [],
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

const fetchOrders = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    orders.value = mockOrders.slice(start, end);
    total.value = mockOrders.length;
    loading.value = false;
  }, 500);
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
  currentOrder.value = row;
  dialogVisible.value = true;
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  currentOrder.value = null;
};

const handleShip = (row) => {
  ElMessageBox.confirm("确定要发货吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 模拟API请求
    row.status = "shipped";
    ElMessage.success("发货成功");
  });
};

const handleCancel = (row) => {
  ElMessageBox.confirm("确定要取消该订单吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 模拟API请求
    row.status = "cancelled";
    ElMessage.success("取消成功");
  });
};

// 初始化
fetchOrders();
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
