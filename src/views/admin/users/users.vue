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
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as echarts from "echarts";

// 模拟数据
const mockUsers = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
  role: Math.random() > 0.8 ? "admin" : "user",
  status: Math.random() > 0.5 ? "1" : "0",
  createTime: new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
  ).toLocaleString(),
}));

const loading = ref(false);
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
  username: "",
  email: "",
  phone: "",
  role: "user",
  status: "1",
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
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20)),
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
            value: mockUsers.filter((u) => u.role === "admin").length,
            name: "管理员",
          },
          {
            value: mockUsers.filter((u) => u.role === "user").length,
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

const fetchUsers = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    users.value = mockUsers.slice(start, end);
    total.value = mockUsers.length;
    loading.value = false;
  }, 500);
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

const resetFilter = () => {
  filterForm.username = "";
  filterForm.role = "";
  filterForm.status = "";
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleStatus = (row) => {
  const action = row.status === "1" ? "禁用" : "启用";
  ElMessageBox.confirm(`确定要${action}该用户吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 模拟API请求
    row.status = row.status === "1" ? "0" : "1";
    ElMessage.success(`${action}成功`);
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 模拟API请求
    const index = users.value.findIndex((item) => item.id === row.id);
    if (index !== -1) {
      users.value.splice(index, 1);
    }
    ElMessage.success("删除成功");
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      if (dialogType.value === "add") {
        users.value.unshift({
          ...formData,
          id: users.value.length + 1,
          createTime: new Date().toLocaleString(),
        });
        ElMessage.success("添加成功");
      } else {
        const index = users.value.findIndex((item) => item.id === formData.id);
        if (index !== -1) {
          users.value[index] = formData;
        }
        ElMessage.success("更新成功");
      }
      dialogVisible.value = false;
    }
  });
};

// 初始化
onMounted(() => {
  fetchUsers();
  initCharts();
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
