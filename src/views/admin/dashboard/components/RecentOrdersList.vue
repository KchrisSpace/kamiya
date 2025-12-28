<template>
  <div class="recent-orders">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="orders.length === 0" class="empty-container">
      <el-empty description="暂无订单" :image-size="100" />
    </div>
    <el-table v-else :data="orders" style="width: 100%" stripe>
      <el-table-column prop="id" label="订单号" width="120" />
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div class="order-items">
            <span
              v-for="(item, index) in row.items?.slice(0, 2)"
              :key="index"
              class="item-tag"
            >
              {{ item.product_name }} x{{ item.quantity }}
            </span>
            <span v-if="(row.items?.length || 0) > 2" class="more-items">
              +{{ (row.items?.length || 0) - 2 }} 件
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_price" label="金额" width="120">
        <template #default="{ row }">
          ¥{{ parseFloat(row.total_price || 0).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            text
            type="primary"
            size="small"
            @click="viewOrder(row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusType(status) {
  const typeMap = {
    待商家确认: "info",
    待用户确定订单: "warning",
    进行中: "primary",
    预备出餐中: "warning",
    已出餐: "success",
    已完成: "success",
    已取消: "danger",
    协商中: "warning",
  };
  return typeMap[status] || "info";
}

function viewOrder(orderId) {
  router.push({
    path: "/admin/orders",
    query: { id: orderId },
  });
}
</script>

<style scoped>
.recent-orders {
  width: 100%;
}

.loading-container,
.empty-container {
  padding: 20px;
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.item-tag {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.more-items {
  font-size: 12px;
  color: #999;
  font-style: italic;
}
</style>

