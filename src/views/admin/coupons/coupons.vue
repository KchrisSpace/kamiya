<template>
  <div class="admin-page">
    <h2>折扣码管理</h2>

    <!-- 发放折扣码 -->
    <div class="issue-bar">
      <el-input
        v-model="issueForm.userId"
        placeholder="输入客户ID"
        clearable
        class="issue-input"
      />
      <el-input-number
        v-model="issueForm.discountRate"
        :min="1"
        :max="100"
        :step="1"
        controls-position="right"
      />
      <span class="issue-tip">单位：百分比，例如 90 表示 9 折</span>
      <el-button type="primary" @click="issueCoupon">发放折扣码</el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.userId"
        placeholder="按用户ID搜索"
        clearable
        class="filter-input"
      />
      <el-input
        v-model="filters.code"
        placeholder="按折扣码搜索"
        clearable
        class="filter-input"
      />
      <el-select v-model="filters.status" placeholder="按状态筛选" clearable>
        <el-option label="未使用" value="unused" />
        <el-option label="已使用" value="used" />
        <el-option label="已过期" value="expired" />
      </el-select>
      <el-button type="primary" @click="fetchCoupons">刷新</el-button>
    </div>

    <el-table :data="filteredCoupons" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="user_id" label="用户ID" width="120" />
      <el-table-column prop="order_id" label="订单ID" width="120" />
      <el-table-column prop="code" label="折扣码" min-width="160" />
      <el-table-column
        prop="discount_rate"
        label="折扣"
        width="100"
      >
        <template #default="{ row }">
          {{ row.discount_rate }}%
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="
              row.status === 'unused'
                ? 'success'
                : row.status === 'used'
                ? 'info'
                : 'warning'
            "
          >
            {{
              row.status === "unused"
                ? "未使用"
                : row.status === "used"
                ? "已使用"
                : "已过期"
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="发放时间" min-width="160">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="used_at" label="使用时间" min-width="160">
        <template #default="{ row }">
          {{ row.used_at ? formatDate(row.used_at) : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            link
            :disabled="row.status === 'used' || row.status === 'expired'"
            @click="forceExpire(row)"
          >
            强制失效
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

const coupons = ref([]);

const filters = reactive({
  userId: "",
  code: "",
  status: "",
});

const issueForm = reactive({
  userId: "",
  discountRate: 90,
});

const fetchCoupons = async () => {
  try {
    const res = await axios.get("http://localhost:3001/user_coupons");
    coupons.value = res.data || [];
  } catch (error) {
    console.error("获取折扣码失败:", error);
    ElMessage.error("获取折扣码失败，请稍后重试");
  }
};

const filteredCoupons = computed(() => {
  return coupons.value
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .filter((c) => {
      if (filters.userId && !String(c.user_id || "").includes(filters.userId)) {
        return false;
      }
      if (filters.code && !String(c.code || "").includes(filters.code)) {
        return false;
      }
      if (filters.status && c.status !== filters.status) {
        return false;
      }
      return true;
    });
});

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const generateCouponCode = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const issueCoupon = async () => {
  if (!issueForm.userId.trim()) {
    ElMessage.error("请输入客户ID");
    return;
  }
  const rate = Number(issueForm.discountRate || 0);
  if (rate <= 0 || rate > 100) {
    ElMessage.error("请输入 1-100 之间的折扣百分比");
    return;
  }
  try {
    const now = new Date().toISOString();
    const code = generateCouponCode(10);
    await axios.post("http://localhost:3001/user_coupons", {
      user_id: issueForm.userId.trim(),
      order_id: null,
      code,
      discount_rate: rate,
      status: "unused",
      created_at: now,
      used_at: null,
      expired_at: null,
    });
    ElMessage.success("折扣码已发放");
    await fetchCoupons();
  } catch (error) {
    console.error("发放折扣码失败:", error);
    ElMessage.error("发放折扣码失败，请稍后重试");
  }
};

const forceExpire = async (row) => {
  if (!row || !row.id) return;
  try {
    const now = new Date().toISOString();
    await axios.patch(`http://localhost:3001/user_coupons/${row.id}`, {
      status: "expired",
      expired_at: now,
      updated_at: now,
    });
    ElMessage.success("该折扣码已强制失效");
    await fetchCoupons();
  } catch (error) {
    console.error("强制失效失败:", error);
    ElMessage.error("强制失效失败，请稍后重试");
  }
};

onMounted(() => {
  fetchCoupons();
});
</script>

<style scoped>
.admin-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

h2 {
  margin-bottom: 16px;
}

.issue-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.issue-input {
  width: 180px;
}

.issue-tip {
  font-size: 13px;
  color: #999;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-input {
  width: 200px;
}
</style>

