<template>
  <div class="settings admin-page">
    <div class="admin-page-header">
      <div class="page-header">
        <h2 class="page-title">系统设置</h2>
        <p class="page-description">管理系统配置和参数设置</p>
      </div>
    </div>

    <div class="admin-page-content">
      <el-row :gutter="20">
        <!-- 左侧：设置分类 -->
        <el-col :xs="24" :sm="6" :md="6">
          <el-card class="category-card" shadow="hover">
            <el-menu
              :default-active="activeCategory"
              class="settings-menu"
              @select="handleCategorySelect"
            >
              <el-menu-item index="shop">
                <el-icon><Shop /></el-icon>
                <span>店铺信息</span>
              </el-menu-item>
              <el-menu-item index="business">
                <el-icon><Clock /></el-icon>
                <span>营业设置</span>
              </el-menu-item>
              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>
              <el-menu-item index="data">
                <el-icon><Document /></el-icon>
                <span>数据管理</span>
              </el-menu-item>
              <el-menu-item index="system">
                <el-icon><Setting /></el-icon>
                <span>系统维护</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧：设置内容 -->
        <el-col :xs="24" :sm="18" :md="18">
          <!-- 店铺信息 -->
          <el-card v-if="activeCategory === 'shop'" class="settings-content-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">店铺信息</span>
                <el-button type="primary" @click="handleShopSubmit" :loading="saving">
                  保存设置
                </el-button>
              </div>
            </template>
            <el-form
              ref="shopFormRef"
              :model="shopForm"
              :rules="shopRules"
              label-width="120px"
              class="settings-form"
            >
              <el-form-item label="店铺名称" prop="shopName">
                <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
              </el-form-item>
              <el-form-item label="店铺Logo">
                <el-upload
                  class="logo-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleLogoSuccess"
                  :before-upload="beforeLogoUpload"
                >
                  <img v-if="shopForm.logo" :src="shopForm.logo" class="logo-preview" />
                  <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">建议尺寸：200x200px，支持 JPG、PNG 格式</div>
              </el-form-item>
              <el-form-item label="店铺描述" prop="description">
                <el-input
                  v-model="shopForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入店铺描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="shopForm.phone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="联系邮箱" prop="email">
                <el-input v-model="shopForm.email" placeholder="请输入联系邮箱" />
              </el-form-item>
              <el-form-item label="店铺地址" prop="address">
                <el-input
                  v-model="shopForm.address"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入店铺地址"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 营业设置 -->
          <el-card
            v-if="activeCategory === 'business'"
            class="settings-content-card"
            shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">营业设置</span>
                <el-button type="primary" @click="handleBusinessSubmit" :loading="saving">
                  保存设置
                </el-button>
              </div>
            </template>
            <el-form
              ref="businessFormRef"
              :model="businessForm"
              :rules="businessRules"
              label-width="120px"
              class="settings-form"
            >
              <el-form-item label="营业状态">
                <el-switch
                  v-model="businessForm.isOpen"
                  active-text="营业中"
                  inactive-text="已打烊"
                />
                <div class="form-tip">关闭后，用户将无法下单</div>
              </el-form-item>
              <el-form-item label="营业时间" prop="businessHours">
                <el-time-picker
                  v-model="businessForm.businessHours"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="HH:mm"
                  value-format="HH:mm"
                />
              </el-form-item>
              <el-form-item label="取餐时间" prop="pickupTime">
                <el-select v-model="businessForm.pickupTime" placeholder="请选择取餐时间">
                  <el-option label="立即取餐" value="immediate" />
                  <el-option label="30分钟后" value="30min" />
                  <el-option label="1小时后" value="1hour" />
                  <el-option label="2小时后" value="2hour" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 通知设置 -->
          <el-card
            v-if="activeCategory === 'notification'"
            class="settings-content-card"
            shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">通知设置</span>
                <el-button type="primary" @click="handleNotificationSubmit" :loading="saving">
                  保存设置
                </el-button>
              </div>
            </template>
            <el-form
              ref="notificationFormRef"
              :model="notificationForm"
              label-width="120px"
              class="settings-form"
            >
              <el-divider content-position="left">订单通知</el-divider>
              <el-form-item label="新订单通知">
                <el-switch v-model="notificationForm.newOrderNotify" />
                <div class="form-tip">新订单产生时发送通知</div>
              </el-form-item>
              <el-form-item label="订单完成通知">
                <el-switch v-model="notificationForm.orderCompleteNotify" />
                <div class="form-tip">订单完成时发送通知</div>
              </el-form-item>
              <el-form-item label="订单取消通知">
                <el-switch v-model="notificationForm.orderCancelNotify" />
                <div class="form-tip">订单取消时发送通知</div>
              </el-form-item>

              <el-divider content-position="left">系统通知</el-divider>
              <el-form-item label="库存预警">
                <el-switch v-model="notificationForm.stockAlert" />
                <div class="form-tip">商品库存低于阈值时发送预警</div>
              </el-form-item>
              <el-form-item label="库存阈值" prop="stockThreshold">
                <el-input-number
                  v-model="notificationForm.stockThreshold"
                  :min="1"
                  :max="100"
                />
                <span class="unit">件</span>
              </el-form-item>
              <el-form-item label="评论通知">
                <el-switch v-model="notificationForm.commentNotify" />
                <div class="form-tip">收到新评论时发送通知</div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 数据管理 -->
          <el-card v-if="activeCategory === 'data'" class="settings-content-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">数据管理</span>
              </div>
            </template>
            <div class="data-management">
              <el-card class="data-card" shadow="hover">
                <div class="data-card-content">
                  <div class="data-info">
                    <el-icon class="data-icon"><DocumentCopy /></el-icon>
                    <div>
                      <div class="data-title">数据导出</div>
                      <div class="data-desc">导出订单、商品、用户等数据为Excel文件</div>
                    </div>
                  </div>
                  <el-button type="primary" @click="handleExportData">导出数据</el-button>
                </div>
              </el-card>

              <el-card class="data-card" shadow="hover">
                <div class="data-card-content">
                  <div class="data-info">
                    <el-icon class="data-icon"><Download /></el-icon>
                    <div>
                      <div class="data-title">数据备份</div>
                      <div class="data-desc">备份系统所有数据，包括订单、商品、用户信息</div>
                    </div>
                  </div>
                  <el-button type="success" @click="handleBackupData">立即备份</el-button>
                </div>
              </el-card>

              <el-card class="data-card" shadow="hover">
                <div class="data-card-content">
                  <div class="data-info">
                    <el-icon class="data-icon"><Delete /></el-icon>
                    <div>
                      <div class="data-title">数据清理</div>
                      <div class="data-desc">清理过期数据，释放存储空间</div>
                    </div>
                  </div>
                  <el-button type="warning" @click="handleCleanData">清理数据</el-button>
                </div>
              </el-card>
            </div>
          </el-card>

          <!-- 系统维护 -->
          <el-card
            v-if="activeCategory === 'system'"
            class="settings-content-card"
            shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">系统维护</span>
              </div>
            </template>
            <div class="system-maintenance">
              <el-card class="system-card" shadow="hover">
                <div class="system-info">
                  <div class="system-item">
                    <span class="system-label">系统版本：</span>
                    <span class="system-value">v1.0.0</span>
                  </div>
                  <div class="system-item">
                    <span class="system-label">运行状态：</span>
                    <el-tag type="success">正常运行</el-tag>
                  </div>
                  <div class="system-item">
                    <span class="system-label">数据库状态：</span>
                    <el-tag type="success">正常</el-tag>
                  </div>
                  <div class="system-item">
                    <span class="system-label">最后备份时间：</span>
                    <span class="system-value">{{ lastBackupTime || "暂无备份" }}</span>
                  </div>
                </div>
              </el-card>

              <el-card class="system-card" shadow="hover">
                <template #header>
                  <span>系统日志</span>
                </template>
                <div class="log-container">
                  <div v-if="systemLogs.length === 0" class="no-logs">暂无系统日志</div>
                  <div v-else class="log-list">
                    <div v-for="(log, index) in systemLogs" :key="index" class="log-item">
                      <div class="log-time">{{ formatLogTime(log.time) }}</div>
                      <div class="log-content">{{ log.content }}</div>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card class="system-card" shadow="hover">
                <div class="danger-zone">
                  <el-divider content-position="left">危险操作</el-divider>
                  <el-button type="danger" @click="handleSystemReset">重置系统</el-button>
                  <div class="danger-tip">警告：此操作将清空所有数据，请谨慎操作！</div>
                </div>
              </el-card>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Shop,
  Clock,
  Bell,
  Document,
  Setting,
  DocumentCopy,
  Download,
  Delete,
} from "@element-plus/icons-vue";
import axios from "axios";

const activeCategory = ref("shop");
const saving = ref(false);
const uploadUrl = "http://localhost:3002/upload"; // 使用现有的上传服务器

// 表单引用
const shopFormRef = ref(null);
const businessFormRef = ref(null);
const notificationFormRef = ref(null);

// 店铺信息表单
const shopForm = reactive({
  shopName: "Kamiya甜品店",
  logo: "",
  description: "专业制作精美甜品，为您带来甜蜜时光",
  phone: "400-123-4567",
  email: "service@kamiya.com",
  address: "北京市朝阳区xxx街道xxx号",
});

// 营业设置表单
const businessForm = reactive({
  isOpen: true,
  businessHours: ["09:00", "21:00"],
  pickupTime: "30min",
});

// 通知设置表单
const notificationForm = reactive({
  newOrderNotify: true,
  orderCompleteNotify: true,
  orderCancelNotify: true,
  stockAlert: true,
  stockThreshold: 10,
  commentNotify: true,
});


// 系统维护
const lastBackupTime = ref("");
const systemLogs = ref([
  { time: new Date(), content: "系统启动成功" },
  { time: new Date(Date.now() - 3600000), content: "数据备份完成" },
  { time: new Date(Date.now() - 7200000), content: "订单数据同步完成" },
]);

// 表单验证规则
const shopRules = {
  shopName: [{ required: true, message: "请输入店铺名称", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$|^400-\d{3}-\d{4}$/,
      message: "请输入正确的电话号码",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入联系邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

const businessRules = {
  businessHours: [{ required: true, message: "请选择营业时间", trigger: "change" }],
};

// 分类选择
function handleCategorySelect(key) {
  activeCategory.value = key;
}

// Logo上传
function handleLogoSuccess(response) {
  shopForm.logo = response.url || response.path;
  ElMessage.success("Logo上传成功");
}

function beforeLogoUpload(file) {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传文件只能是图片格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传图片大小不能超过 2MB!");
    return false;
  }
  return true;
}

// 保存店铺信息
async function handleShopSubmit() {
  if (!shopFormRef.value) return;
  await shopFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      // 模拟API请求
      setTimeout(() => {
        saving.value = false;
        ElMessage.success("店铺信息保存成功");
      }, 1000);
    }
  });
}

// 保存营业设置
async function handleBusinessSubmit() {
  if (!businessFormRef.value) return;
  await businessFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      setTimeout(() => {
        saving.value = false;
        ElMessage.success("营业设置保存成功");
      }, 1000);
    }
  });
}

// 保存通知设置
async function handleNotificationSubmit() {
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    ElMessage.success("通知设置保存成功");
  }, 1000);
}


// 数据导出
function handleExportData() {
  ElMessageBox.confirm("确定要导出所有数据吗？", "数据导出", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      ElMessage.success("数据导出功能开发中...");
    })
    .catch(() => {});
}

// 数据备份
function handleBackupData() {
  ElMessageBox.confirm("确定要备份所有数据吗？", "数据备份", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      lastBackupTime.value = new Date().toLocaleString("zh-CN");
      ElMessage.success("数据备份成功");
      systemLogs.value.unshift({
        time: new Date(),
        content: "数据备份完成",
      });
    })
    .catch(() => {});
}

// 清理数据
function handleCleanData() {
  ElMessageBox.confirm(
    "确定要清理过期数据吗？此操作不可恢复！",
    "数据清理",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      ElMessage.success("数据清理功能开发中...");
    })
    .catch(() => {});
}

// 重置系统
function handleSystemReset() {
  ElMessageBox.confirm(
    "警告：此操作将清空所有数据，包括订单、商品、用户等信息，且不可恢复！确定要继续吗？",
    "重置系统",
    {
      confirmButtonText: "确定重置",
      cancelButtonText: "取消",
      type: "error",
      dangerouslyUseHTMLString: true,
    }
  )
    .then(() => {
      ElMessage.warning("系统重置功能需要管理员权限，请联系系统管理员");
    })
    .catch(() => {});
}

// 格式化日志时间
function formatLogTime(date) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// 初始化
onMounted(() => {
  // 可以在这里加载保存的设置
});
</script>

<style scoped>
.settings {
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

.admin-page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.admin-page-content::-webkit-scrollbar {
  width: 8px;
}

.admin-page-content::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.admin-page-content::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.admin-page-content::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.category-card {
  margin-bottom: 20px;
}

.settings-menu {
  border: none;
}

.settings-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin-bottom: 4px;
  border-radius: 8px;
}

.settings-menu :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
}

.settings-content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.settings-form {
  max-width: 800px;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  transition: all 0.3s;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.logo-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.unit {
  margin-left: 8px;
  color: #606266;
}

/* 数据管理 */
.data-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-card {
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.data-icon {
  font-size: 32px;
  color: #409eff;
}

.data-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.data-desc {
  font-size: 14px;
  color: #909399;
}

/* 系统维护 */
.system-maintenance {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-card {
  margin-bottom: 16px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.system-item:last-child {
  border-bottom: none;
}

.system-label {
  font-size: 14px;
  color: #606266;
  width: 120px;
}

.system-value {
  font-size: 14px;
  color: #303133;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
}

.no-logs {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.log-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.log-content {
  font-size: 14px;
  color: #303133;
}

.danger-zone {
  padding: 20px;
}

.danger-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .admin-page-content {
    padding-right: 0;
  }

  .settings-form {
    max-width: 100%;
  }

  .data-card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
