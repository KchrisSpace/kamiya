<template>
  <div class="products">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="商品名称">
          <el-input v-model="filterForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="filterForm.category" placeholder="请选择分类">
            <el-option label="全部" value="" />
            <el-option label="鲜花" value="flowers" />
            <el-option label="绿植" value="plants" />
            <el-option label="花束" value="bouquets" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="上架" value="1" />
            <el-option label="下架" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleAdd">添加商品</el-button>
        </div>
      </template>

      <el-table :data="products" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryName(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }"> ¥{{ row.price }} </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="120" />
        <el-table-column prop="sales" label="销量" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === "1" ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="primary" link @click="handleStatus(row)">
              {{ row.status === "1" ? "下架" : "上架" }}
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
      :title="dialogType === 'add' ? '添加商品' : '编辑商品'"
      width="50%"
    >
      <product-form
        v-if="dialogVisible"
        :form-data="formData"
        @submit="handleSubmit"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProductForm from "./components/ProductForm.vue";

// 模拟数据
const mockProducts = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `商品 ${i + 1}`,
  category: ["flowers", "plants", "bouquets"][Math.floor(Math.random() * 3)],
  price: (Math.random() * 1000).toFixed(2),
  stock: Math.floor(Math.random() * 1000),
  sales: Math.floor(Math.random() * 1000),
  status: Math.random() > 0.5 ? "1" : "0",
}));

const loading = ref(false);
const products = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const dialogType = ref("add");
const formData = ref({});

const filterForm = reactive({
  name: "",
  category: "",
  status: "",
});

const getCategoryType = (category) => {
  const types = {
    flowers: "success",
    plants: "warning",
    bouquets: "danger",
  };
  return types[category] || "info";
};

const getCategoryName = (category) => {
  const names = {
    flowers: "鲜花",
    plants: "绿植",
    bouquets: "花束",
  };
  return names[category] || "未知";
};

const fetchProducts = () => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    products.value = mockProducts.slice(start, end);
    total.value = mockProducts.length;
    loading.value = false;
  }, 500);
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

const resetFilter = () => {
  filterForm.name = "";
  filterForm.category = "";
  filterForm.status = "";
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchProducts();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchProducts();
};

const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    images: [],
  };
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleStatus = (row) => {
  const action = row.status === "1" ? "下架" : "上架";
  ElMessageBox.confirm(`确定要${action}该商品吗？`, "提示", {
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
  ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 模拟API请求
    const index = products.value.findIndex((item) => item.id === row.id);
    if (index !== -1) {
      products.value.splice(index, 1);
    }
    ElMessage.success("删除成功");
  });
};

const handleSubmit = (form) => {
  // 模拟API请求
  if (dialogType.value === "add") {
    products.value.unshift({
      ...form,
      id: products.value.length + 1,
      sales: 0,
    });
    ElMessage.success("添加成功");
  } else {
    const index = products.value.findIndex((item) => item.id === form.id);
    if (index !== -1) {
      products.value[index] = form;
    }
    ElMessage.success("更新成功");
  }
  dialogVisible.value = false;
};

// 初始化
fetchProducts();
</script>

<style scoped>
.products {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
