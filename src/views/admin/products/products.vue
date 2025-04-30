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
            <el-option
              v-for="category in productsStore.categories"
              :key="category"
              :label="category"
              :value="category"
            />
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

      <el-table
        :data="productsStore.filteredProducts"
        style="width: 100%"
        v-loading="productsStore.loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="商品名称" />
        <el-table-column prop="main_category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.main_category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="price_info.current_price"
          label="价格"
          width="120"
        >
          <template #default="{ row }">
            ¥{{ row.price_info?.current_price }}
          </template>
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
          :total="productsStore.total"
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProductForm from "./components/ProductForm.vue";
import { useProductsStore } from "../../../data_stores/products";

const productsStore = useProductsStore();
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const dialogType = ref("add");
const formData = ref({});

const filterForm = reactive({
  name: "",
  category: "",
});

const handleSearch = () => {
  if (filterForm.name) {
    const results = productsStore.searchProducts(filterForm.name);
    productsStore.products = results;
  }
  if (filterForm.category) {
    productsStore.setCurrentCategory(filterForm.category);
  }
};

const resetFilter = () => {
  filterForm.name = "";
  filterForm.category = "";
  productsStore.setCurrentCategory("");
  productsStore.fetchProducts();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  productsStore.perPage = val;
  productsStore.fetchProducts();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  productsStore.setCurrentPage(val);
};

const handleAdd = () => {
  dialogType.value = "add";
  formData.value = {
    title: "",
    main_category: "",
    price_info: {
      current_price: "",
    },
    stock: "",
    description: "",
    images: [],
    promotion: {
      keywords: [],
    },
  };
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleStatus = async (row) => {
  const action = row.status === "1" ? "下架" : "上架";
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await productsStore.updateProduct(row.id, {
      ...row,
      status: row.status === "1" ? "0" : "1",
    });
    ElMessage.success(`${action}成功`);
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(`${action}失败`);
    }
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await productsStore.deleteProduct(row.id);
    ElMessage.success("删除成功");
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async (form) => {
  try {
    if (dialogType.value === "add") {
      await productsStore.addProduct(form);
      ElMessage.success("添加成功");
    } else {
      await productsStore.updateProduct(form.id, form);
      ElMessage.success("更新成功");
    }
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(dialogType.value === "add" ? "添加失败" : "更新失败");
  }
};

onMounted(async () => {
  await productsStore.fetchProducts();
});
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
