<template>
  <div class="feedback-management admin-page">
    <div class="admin-page-header">
      <div class="page-header">
        <h2 class="page-title">反馈管理</h2>
        <p class="page-description">查看和管理用户反馈</p>
      </div>
      <el-card class="filter-card" shadow="hover">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="用户ID">
            <el-input
              v-model="filterForm.userId"
              placeholder="请输入用户ID"
              clearable
            />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入姓名"
              clearable
            />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input
              v-model="filterForm.email"
              placeholder="请输入邮箱"
              clearable
            />
          </el-form-item>
          <el-form-item label="电话">
            <el-input
              v-model="filterForm.phone"
              placeholder="请输入电话"
              clearable
            />
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="未处理" value="pending" />
              <el-option label="已处理" value="processed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="admin-page-content">
      <el-card class="table-card" shadow="hover">
        <el-table
          :data="paginatedFeedback"
          style="width: 100%"
          v-loading="loading"
          stripe
        >
          <el-table-column prop="id" label="反馈ID" width="120" />
          <el-table-column prop="user_id" label="用户ID" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
          <el-table-column prop="phone" label="电话" width="140" />
          <el-table-column prop="feedback_message" label="反馈内容" min-width="250" show-overflow-tooltip />
          <el-table-column label="处理状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'processed' ? 'success' : 'warning'">
                {{ row.status === 'processed' ? '已处理' : '未处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                text
                type="primary"
                size="small"
                @click="handleViewDetail(row)"
              >
                查看详情
              </el-button>
              <el-button
                text
                type="success"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'processed' ? '标记未处理' : '标记已处理' }}
              </el-button>
              <el-button
                text
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50, 100]"
            :total="filteredFeedback.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="600px"
      @close="handleCloseDetailDialog"
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="反馈ID">
            {{ currentFeedback.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ currentFeedback.user_id || "未登录用户" }}
          </el-descriptions-item>
          <el-descriptions-item label="姓名">
            {{ currentFeedback.name }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentFeedback.email }}
          </el-descriptions-item>
          <el-descriptions-item label="电话">
            {{ currentFeedback.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容">
            <div class="feedback-content">{{ currentFeedback.feedback_message }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="currentFeedback.status === 'processed' ? 'success' : 'warning'">
              {{ currentFeedback.status === 'processed' ? '已处理' : '未处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDate(currentFeedback.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" v-if="currentFeedback.updated_at">
            {{ formatDate(currentFeedback.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="handleCloseDetailDialog">关闭</el-button>
        <el-button
          type="primary"
          @click="handleToggleStatus(currentFeedback)"
          v-if="currentFeedback"
        >
          {{ currentFeedback.status === 'processed' ? '标记为未处理' : '标记为已处理' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const loading = ref(false);
const allFeedback = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const detailDialogVisible = ref(false);
const currentFeedback = ref(null);

const filterForm = reactive({
  userId: "",
  name: "",
  email: "",
  phone: "",
  status: "",
});

// 格式化日期
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

// 过滤后的反馈列表
const filteredFeedback = computed(() => {
  let result = [...allFeedback.value];

  // 用户ID过滤
  if (filterForm.userId && filterForm.userId.trim()) {
    const userId = filterForm.userId.trim().toLowerCase();
    result = result.filter((feedback) =>
      feedback.user_id?.toLowerCase().includes(userId)
    );
  }

  // 姓名过滤
  if (filterForm.name && filterForm.name.trim()) {
    const name = filterForm.name.trim().toLowerCase();
    result = result.filter((feedback) =>
      feedback.name?.toLowerCase().includes(name)
    );
  }

  // 邮箱过滤
  if (filterForm.email && filterForm.email.trim()) {
    const email = filterForm.email.trim().toLowerCase();
    result = result.filter((feedback) =>
      feedback.email?.toLowerCase().includes(email)
    );
  }

  // 电话过滤
  if (filterForm.phone && filterForm.phone.trim()) {
    const phone = filterForm.phone.trim();
    result = result.filter((feedback) =>
      feedback.phone?.includes(phone)
    );
  }

  // 状态过滤
  if (filterForm.status) {
    if (filterForm.status === "processed") {
      result = result.filter((feedback) => feedback.status === "processed");
    } else if (filterForm.status === "pending") {
      result = result.filter((feedback) => !feedback.status || feedback.status === "pending");
    }
  }

  return result;
});

// 分页后的反馈列表
const paginatedFeedback = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredFeedback.value.slice(start, end);
});

// 获取反馈数据
async function fetchFeedback() {
  loading.value = true;
  try {
    const response = await axios.get("http://localhost:3001/feedback");
    allFeedback.value = (response.data || []).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (error) {
    console.error("获取反馈失败:", error);
    ElMessage.error("获取反馈失败");
    allFeedback.value = [];
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1;
}

// 重置筛选
function resetFilter() {
  filterForm.userId = "";
  filterForm.name = "";
  filterForm.email = "";
  filterForm.phone = "";
  filterForm.status = "";
  handleSearch();
}

// 分页变化
function handleSizeChange() {
  currentPage.value = 1;
}

function handleCurrentChange() {
  // 分页变化时的处理
}

// 切换处理状态
async function handleToggleStatus(row) {
  try {
    const newStatus = row.status === "processed" ? "pending" : "processed";
    await axios.patch(`http://localhost:3001/feedback/${row.id}`, {
      status: newStatus,
      updated_at: new Date().toISOString(),
    });

    row.status = newStatus;
    ElMessage.success(newStatus === "processed" ? "已标记为已处理" : "已标记为未处理");
    
    // 如果详情对话框打开，更新当前反馈
    if (currentFeedback.value && currentFeedback.value.id === row.id) {
      currentFeedback.value.status = newStatus;
    }
  } catch (error) {
    console.error("更新反馈状态失败:", error);
    ElMessage.error("更新失败，请稍后重试");
  }
}

// 删除反馈
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.name}"的这条反馈吗？`,
      "删除反馈",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await axios.delete(`http://localhost:3001/feedback/${row.id}`);
    ElMessage.success("反馈已删除");
    await fetchFeedback();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除反馈失败:", error);
      ElMessage.error("删除失败，请稍后重试");
    }
  }
}

// 查看详情
function handleViewDetail(row) {
  currentFeedback.value = { ...row };
  detailDialogVisible.value = true;
}

// 关闭详情对话框
function handleCloseDetailDialog() {
  detailDialogVisible.value = false;
  currentFeedback.value = null;
}

// 监听筛选条件变化
watch(
  [
    () => filterForm.userId,
    () => filterForm.name,
    () => filterForm.email,
    () => filterForm.phone,
    () => filterForm.status,
  ],
  () => {
    currentPage.value = 1;
  }
);

// 初始化
onMounted(() => {
  fetchFeedback();
});
</script>

<style scoped>
.feedback-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-page-header {
  flex-shrink: 0;
  padding-bottom: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.filter-card {
  margin-bottom: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.admin-page-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-page-content .table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-page-content .table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.admin-page-content .el-table {
  flex: 1;
  overflow: auto;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.feedback-detail {
  padding: 20px 0;
}

.feedback-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

