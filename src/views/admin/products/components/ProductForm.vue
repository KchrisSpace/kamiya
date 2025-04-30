<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    class="product-form"
  >
    <el-form-item label="商品名称" prop="title">
      <el-input v-model="form.title" placeholder="请输入商品名称" />
    </el-form-item>

    <el-form-item label="商品分类" prop="main_category">
      <el-select v-model="form.main_category" placeholder="请选择分类">
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="价格" prop="price_info.current_price">
      <el-input-number
        v-model="form.price_info.current_price"
        :min="0"
        :precision="2"
        :step="0.1"
      />
    </el-form-item>

    <el-form-item label="库存" prop="stock">
      <el-input-number v-model="form.stock" :min="0" :step="1" />
    </el-form-item>

    <el-form-item label="商品描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="4"
        placeholder="请输入商品描述"
      />
    </el-form-item>

    <el-form-item label="商品图片" prop="images">
      <el-upload
        v-model:file-list="form.images"
        action="/api/upload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
    </el-form-item>

    <el-form-item label="关键词" prop="promotion.keywords">
      <el-select
        v-model="form.promotion.keywords"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请输入关键词"
      >
        <el-option
          v-for="keyword in form.promotion.keywords"
          :key="keyword"
          :label="keyword"
          :value="keyword"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);
const dialogVisible = ref(false);
const dialogImageUrl = ref("");
const categories = ["热销", "上新", "特价出售"];

const form = reactive({
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
});

const rules = {
  title: [
    { required: true, message: "请输入商品名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  main_category: [
    { required: true, message: "请选择商品分类", trigger: "change" },
  ],
  "price_info.current_price": [
    { required: true, message: "请输入商品价格", trigger: "blur" },
  ],
  stock: [{ required: true, message: "请输入库存数量", trigger: "blur" }],
  description: [
    { required: true, message: "请输入商品描述", trigger: "blur" },
    { min: 10, max: 500, message: "长度在 10 到 500 个字符", trigger: "blur" },
  ],
  images: [{ required: true, message: "请上传商品图片", trigger: "change" }],
  "promotion.keywords": [
    { required: true, message: "请输入关键词", trigger: "change" },
  ],
};

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

const handleRemove = (file, fileList) => {
  form.images = fileList;
};

const handleUploadSuccess = (response, file, fileList) => {
  form.images = fileList;
  ElMessage.success("上传成功");
};

const handleUploadError = () => {
  ElMessage.error("上传失败");
};

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("submit", { ...form });
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

const cancel = () => {
  emit("cancel");
};

// 初始化表单数据
onMounted(() => {
  Object.assign(form, props.formData);
});
</script>

<style scoped>
.product-form {
  padding: 20px;
}

.el-input-number {
  width: 200px;
}

.el-select {
  width: 100%;
}

.el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}
</style>
