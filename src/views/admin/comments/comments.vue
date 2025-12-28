<template>
  <div class="comments-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">评论管理</h2>
    </div>

    <!-- 筛选卡片 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="filterForm.productName"
            placeholder="请输入商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="filterForm.userId"
            placeholder="请输入用户ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="评分">
          <el-select v-model="filterForm.rating" placeholder="请选择评分" clearable>
            <el-option label="全部" value="" />
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="可见" value="visible" />
            <el-option label="不可见" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评论列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        :data="paginatedComments"
        style="width: 100%"
        v-loading="loading"
        stripe
      >
        <el-table-column prop="id" label="评论ID" width="120" />
        <el-table-column label="商品信息" width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <el-avatar
                :size="50"
                :src="getProductImage(row.product_id)"
                shape="square"
              />
              <div class="product-info">
                <div class="product-name">{{ getProductName(row.product_id) }}</div>
                <div class="product-id">ID: {{ row.product_id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="180">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar || '/images/users/avater/user1.png'" />
              <div class="user-info">
                <div class="user-name">{{ row.user_name || "匿名用户" }}</div>
                <div class="user-id">ID: {{ row.user_id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            <el-rate
              :model-value="row.rating || 0"
              disabled
              :size="16"
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <div v-if="row.tags && row.tags.length > 0" class="tags-cell">
              <el-tag
                v-for="tag in row.tags"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <span v-else class="no-tags">无标签</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0" class="images-cell">
              <el-image
                :src="row.images[0]"
                :preview-src-list="row.images"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px;"
              />
              <span class="image-count" v-if="row.images.length > 1">
                +{{ row.images.length - 1 }}
              </span>
            </div>
            <span v-else class="no-images">无图片</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_visible !== false ? 'success' : 'danger'">
              {{ row.is_visible !== false ? '可见' : '不可见' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              size="small"
              @click="handleReply(row)"
            >
              {{ row.reply ? '编辑回复' : '回复' }}
            </el-button>
            <el-button
              text
              type="primary"
              size="small"
              @click="handleToggleVisible(row)"
            >
              {{ row.is_visible !== false ? '设为不可见' : '设为可见' }}
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
          :total="filteredComments.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评论"
      width="600px"
      @close="handleCloseReplyDialog"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="用户评论">
          <div class="original-comment">
            <div class="comment-user">
              <el-avatar
                :size="32"
                :src="currentComment?.avatar || '/images/users/avater/user1.png'"
              />
              <span class="comment-user-name">{{ currentComment?.user_name }}</span>
            </div>
            <div class="comment-content">{{ currentComment?.content }}</div>
          </div>
        </el-form-item>
        <el-form-item label="商家回复" required>
          <el-input
            v-model="replyForm.reply"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseReplyDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmitReply" :loading="replying">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { useProductsStore } from "../../../data_stores/products";

const productsStore = useProductsStore();
const loading = ref(false);
const allComments = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const replyDialogVisible = ref(false);
const currentComment = ref(null);
const replying = ref(false);

const filterForm = reactive({
  productName: "",
  userId: "",
  rating: "",
  status: "",
});

const replyForm = reactive({
  reply: "",
});

// 获取商品图片
function getProductImage(productId) {
  const product = productsStore.products.find((p) => p.id === productId);
  if (!product) return "/images/products_list/default.jpg";
  if (product.images?.startsWith("http")) return product.images;
  if (product.images?.startsWith("/")) return product.images;
  return product.images || "/images/products_list/default.jpg";
}

// 获取商品名称
function getProductName(productId) {
  const product = productsStore.products.find((p) => p.id === productId);
  return product?.title || `商品 ${productId}`;
}

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

// 过滤后的评论列表
const filteredComments = computed(() => {
  let result = [...allComments.value];

  // 商品名称过滤
  if (filterForm.productName && filterForm.productName.trim()) {
    const productName = filterForm.productName.trim().toLowerCase();
    result = result.filter((comment) => {
      const product = productsStore.products.find((p) => p.id === comment.product_id);
      const name = product?.title || "";
      return name.toLowerCase().includes(productName);
    });
  }

  // 用户ID过滤
  if (filterForm.userId && filterForm.userId.trim()) {
    const userId = filterForm.userId.trim().toLowerCase();
    result = result.filter((comment) =>
      comment.user_id?.toLowerCase().includes(userId)
    );
  }

  // 评分过滤
  if (filterForm.rating !== "" && filterForm.rating !== null) {
    result = result.filter((comment) => comment.rating === filterForm.rating);
  }

  // 状态过滤
  if (filterForm.status) {
    if (filterForm.status === "visible") {
      result = result.filter((comment) => comment.is_visible !== false);
    } else if (filterForm.status === "hidden") {
      result = result.filter((comment) => comment.is_visible === false);
    }
  }

  return result;
});

// 分页后的评论列表
const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredComments.value.slice(start, end);
});

// 获取评论数据
async function fetchComments() {
  loading.value = true;
  try {
    // 获取商品数据
    await productsStore.fetchProducts();

    // 获取评论数据
    const response = await axios.get("http://localhost:3001/product_comments");
    allComments.value = (response.data || []).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    ElMessage.error("获取评论失败");
    allComments.value = [];
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
  filterForm.productName = "";
  filterForm.userId = "";
  filterForm.rating = "";
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

// 切换可见性
async function handleToggleVisible(row) {
  try {
    const newVisible = row.is_visible === false ? true : false;
    await axios.patch(`http://localhost:3001/product_comments/${row.id}`, {
      is_visible: newVisible,
      updated_at: new Date().toISOString(),
    });

    row.is_visible = newVisible;
    ElMessage.success(newVisible ? "评论已设为可见" : "评论已设为不可见");
  } catch (error) {
    console.error("更新评论状态失败:", error);
    ElMessage.error("更新失败，请稍后重试");
  }
}

// 删除评论
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.user_name}"的这条评论吗？`,
      "删除评论",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await axios.delete(`http://localhost:3001/product_comments/${row.id}`);
    ElMessage.success("评论已删除");
    await fetchComments();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除评论失败:", error);
      ElMessage.error("删除失败，请稍后重试");
    }
  }
}

// 回复评论
function handleReply(row) {
  currentComment.value = row;
  replyForm.reply = row.reply || "";
  replyDialogVisible.value = true;
}

// 提交回复
async function handleSubmitReply() {
  if (!replyForm.reply.trim()) {
    ElMessage.warning("请输入回复内容");
    return;
  }

  replying.value = true;
  try {
    await axios.patch(
      `http://localhost:3001/product_comments/${currentComment.value.id}`,
      {
        reply: replyForm.reply.trim(),
        reply_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    // 更新本地数据
    currentComment.value.reply = replyForm.reply.trim();
    currentComment.value.reply_time = new Date().toISOString();

    ElMessage.success("回复成功");
    handleCloseReplyDialog();
  } catch (error) {
    console.error("回复失败:", error);
    ElMessage.error("回复失败，请稍后重试");
  } finally {
    replying.value = false;
  }
}

// 关闭回复对话框
function handleCloseReplyDialog() {
  replyDialogVisible.value = false;
  currentComment.value = null;
  replyForm.reply = "";
}

// 监听筛选条件变化
watch(
  [
    () => filterForm.productName,
    () => filterForm.userId,
    () => filterForm.rating,
    () => filterForm.status,
  ],
  () => {
    currentPage.value = 1;
  }
);

// 初始化
onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.comments-management {
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
  margin: 0;
}

.filter-card {
  margin-bottom: 0;
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

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.table-card {
  margin-bottom: 0;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-id {
  font-size: 12px;
  color: #909399;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-item {
  font-size: 12px;
}

.no-tags,
.no-images {
  color: #c0c4cc;
  font-size: 12px;
}

.images-cell {
  position: relative;
  display: inline-block;
}

.image-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
}

.reply-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.no-reply {
  color: #c0c4cc;
  font-size: 13px;
}

.original-comment {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .comments-management {
    padding: 16px;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

