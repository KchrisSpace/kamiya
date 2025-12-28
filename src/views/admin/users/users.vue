<template>
  <div class="users">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card stat-card-primary" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="40"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card stat-card-success" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="40"><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ adminCount }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card stat-card-info" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="40"><Avatar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCount }}</div>
            <div class="stat-label">普通用户</div>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card stat-card-warning" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon :size="40"><Lock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ disabledCount }}</div>
            <div class="stat-label">已禁用</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>用户增长趋势</span>
          </div>
        </template>
        <div ref="userChart" class="chart"></div>
      </el-card>
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>用户角色分布</span>
          </div>
        </template>
        <div ref="roleChart" class="chart"></div>
      </el-card>
    </div>

    <!-- 筛选和操作区域 -->
    <el-card class="filter-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>筛选条件</span>
        </div>
      </template>
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="登录账号">
          <el-input v-model="filterForm.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="filterForm.role" placeholder="请选择角色">
            <el-option label="全部" value="" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表表格 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="table-count">共 {{ total }} 条数据</span>
        </div>
      </template>
      <el-table 
        :data="users" 
        style="width: 100%" 
        v-loading="loading"
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="登录账号" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === "admin" ? "管理员" : "普通用户" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'">
            {{ row.status === "1" ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)"
            >编辑</el-button
          >
          <el-button type="primary" link @click="handleStatus(row)">
            {{ row.status === "1" ? "禁用" : "启用" }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)"
            >删除</el-button
          >
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
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="'1'"
            :inactive-value="'0'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, User, UserFilled, Avatar, Lock } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import axios from "axios";

const loading = ref(false);
const allUsers = ref([]);
const users = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const dialogType = ref("add");
const formRef = ref(null);

const filterForm = reactive({
  username: "",
  role: "",
  status: "",
});

const formData = reactive({
  id: "",
  username: "",
  email: "",
  phone: "",
  role: "user",
  status: "1",
  password: "",
});

const rules = {
  username: [
    { required: true, message: "请输入登录账号", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

const userChart = ref(null);
const roleChart = ref(null);

// 统计数据
const adminCount = computed(() => {
  return allUsers.value.filter((u) => u.role === "admin").length;
});

const userCount = computed(() => {
  return allUsers.value.filter((u) => u.role === "user").length;
});

const disabledCount = computed(() => {
  return allUsers.value.filter((u) => u.status === "0").length;
});

// 格式化用户数据，将 db.json 格式转换为页面显示格式
const formatUser = (user) => {
  const userInfo = user.user_info || user["user-info"] || {};
  return {
    id: user.id,
    username: user.username,
    nickname: userInfo.nickname || user.username || "未设置",
    email: user.email || `${user.username}@example.com`,
    phone: user.phone || "",
    role: user.role || (user.id === "admin" ? "admin" : "user"),
    status: user.status || "1",
    createTime: user.createTime || new Date().toLocaleString(),
    password: user.password || "",
    "user-info": userInfo,
  };
};

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...allUsers.value];

  // 用户名过滤
  if (filterForm.username && filterForm.username.trim()) {
    const keyword = filterForm.username.trim().toLowerCase();
    result = result.filter((user) =>
      user.username.toLowerCase().includes(keyword)
    );
  }

  // 角色过滤
  if (filterForm.role && filterForm.role.trim()) {
    result = result.filter((user) => user.role === filterForm.role);
  }

  // 状态过滤
  if (filterForm.status && filterForm.status.trim()) {
    result = result.filter((user) => user.status === filterForm.status);
  }

  return result;
});

const initCharts = () => {
  // 用户增长趋势图
  const userChartInstance = echarts.init(userChart.value);
  const userOption = {
    title: {
      text: "用户增长趋势",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString();
      }),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "新增用户",
        type: "line",
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5)),
        smooth: true,
      },
    ],
  };
  userChartInstance.setOption(userOption);

  // 用户角色分布图
  const roleChartInstance = echarts.init(roleChart.value);
  const roleOption = {
    title: {
      text: "用户角色分布",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "用户角色",
        type: "pie",
        radius: "50%",
        data: [
          {
            value: allUsers.value.filter((u) => u.role === "admin").length,
            name: "管理员",
          },
          {
            value: allUsers.value.filter((u) => u.role === "user").length,
            name: "普通用户",
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  roleChartInstance.setOption(roleOption);

  // 监听窗口大小变化，调整图表大小
  window.addEventListener("resize", () => {
    userChartInstance.resize();
    roleChartInstance.resize();
  });
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get("http://localhost:3001/users");
    // 格式化用户数据
    allUsers.value = response.data.map(formatUser);
    total.value = filteredUsers.value.length;

    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    users.value = filteredUsers.value.slice(start, end);

    // 更新图表
    if (userChart.value && roleChart.value) {
      initCharts();
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  updateUsersList();
};

// 更新用户列表（基于过滤结果）
const updateUsersList = () => {
  total.value = filteredUsers.value.length;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  users.value = filteredUsers.value.slice(start, end);

  // 更新图表
  if (userChart.value && roleChart.value) {
    initCharts();
  }
};

const resetFilter = () => {
  filterForm.username = "";
  filterForm.role = "";
  filterForm.status = "";
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  updateUsersList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  updateUsersList();
};

const handleAdd = () => {
  dialogType.value = "add";
  formData.id = "";
  formData.username = "";
  formData.email = "";
  formData.phone = "";
  formData.role = "user";
  formData.status = "1";
  formData.password = "";
  formData.createTime = "";
  formData["user-info"] = {};
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    email: row.email || "",
    phone: row.phone || "",
    role: row.role || "user",
    status: row.status || "1",
    password: row.password || "",
  });
  dialogVisible.value = true;
};

const handleStatus = async (row) => {
  const action = row.status === "1" ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const newStatus = row.status === "1" ? "0" : "1";
    const updatedUser = {
      ...row,
      status: newStatus,
    };

    await axios.put(`http://localhost:3001/users/${row.id}`, updatedUser);

    // 更新本地数据
    const index = allUsers.value.findIndex((u) => u.id === row.id);
    if (index !== -1) {
      allUsers.value[index].status = newStatus;
    }

    updateUsersList();
    ElMessage.success(`${action}成功`);
  } catch (error) {
    if (error !== "cancel") {
      console.error(`${action}用户失败:`, error);
      ElMessage.error(`${action}用户失败`);
    }
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await axios.delete(`http://localhost:3001/users/${row.id}`);

    // 更新本地数据
    const index = allUsers.value.findIndex((u) => u.id === row.id);
    if (index !== -1) {
      allUsers.value.splice(index, 1);
    }

    updateUsersList();
    ElMessage.success("删除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除用户失败:", error);
      ElMessage.error("删除用户失败");
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果是新用户，生成短ID（时间戳后6位 + 2位随机数）
        let userId = formData.id;
        if (!userId) {
          const timestamp = Date.now().toString();
          const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          userId = `user${timestamp.slice(-6)}${randomSuffix}`;
        }
        
        const userData = {
          id: userId,
          username: formData.username,
          password: formData.password || "000000",
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          createTime: formData.createTime || new Date().toLocaleString(),
          user_info: formData["user-info"] || formData.user_info || {
            nickname: formData.username,
            avatar: "",
          },
          created_at: formData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (dialogType.value === "add") {
          await axios.post("http://localhost:3001/users", userData);
          ElMessage.success("添加成功");
        } else {
          await axios.put(
            `http://localhost:3001/users/${formData.id}`,
            userData
          );
          ElMessage.success("更新成功");
        }

        dialogVisible.value = false;
        await fetchUsers();
      } catch (error) {
        console.error("保存用户失败:", error);
        ElMessage.error("保存用户失败");
      }
    }
  });
};

// 监听过滤条件变化
watch(
  [() => filterForm.username, () => filterForm.role, () => filterForm.status],
  () => {
    currentPage.value = 1;
    updateUsersList();
  }
);

// 初始化
onMounted(async () => {
  await fetchUsers();
  // 延迟初始化图表，等待DOM和数据加载完成
  setTimeout(() => {
    if (userChart.value && roleChart.value) {
      initCharts();
    }
  }, 300);
});
</script>

<style scoped>
.users {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-success {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-card-warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.stat-icon {
  margin-right: 16px;
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

/* 图表区域 */
.charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.table-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.chart {
  width: 100%;
  height: 350px;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

/* 表格卡片 */
.table-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th) {
  background-color: #f5f7fa;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

.table-card :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
