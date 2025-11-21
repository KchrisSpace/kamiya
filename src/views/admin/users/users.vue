<template>
  <div class="users">
    <div class="charts">
      <el-card class="chart-card">
        <div ref="userChart" class="chart"></div>
      </el-card>
      <el-card class="chart-card">
        <div ref="roleChart" class="chart"></div>
      </el-card>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" />
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

    <el-table :data="users" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
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
        <el-form-item label="用户名" prop="username">
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
    { required: true, message: "请输入用户名", trigger: "blur" },
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

// 格式化用户数据，将 db.json 格式转换为页面显示格式
const formatUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email || `${user.username}@example.com`,
    phone: user.phone || "",
    role: user.role || (user.id === "admin" ? "admin" : "user"),
    status: user.status || "1",
    createTime: user.createTime || new Date().toLocaleString(),
    password: user.password || "",
    "user-info": user["user-info"] || {},
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
        const userData = {
          id: formData.id || `user${Date.now()}`,
          username: formData.username,
          password: formData.password || "000000",
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          createTime: formData.createTime || new Date().toLocaleString(),
          "user-info": formData["user-info"] || {
            nickname: formData.username,
            avatar: "",
          },
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
  padding: 20px;
}

.charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
