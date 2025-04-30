<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    class="product-form"
  >
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入商品名称" />
    </el-form-item>

    <el-form-item label="商品分类" prop="category">
      <el-select v-model="form.category" placeholder="请选择分类">
        <el-option label="鲜花" value="flowers" />
        <el-option label="绿植" value="plants" />
        <el-option label="花束" value="bouquets" />
      </el-select>
    </el-form-item>

    <el-form-item label="价格" prop="price">
      <el-input-number
        v-model="form.price"
        :precision="2"
        :step="0.1"
        :min="0"
        placeholder="请输入价格"
      />
    </el-form-item>

    <el-form-item label="库存" prop="stock">
      <el-input-number
        v-model="form.stock"
        :min="0"
        :step="1"
        placeholder="请输入库存"
      />
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

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);
const dialogVisible = ref(false);
const dialogImageUrl = ref("");

const form = reactive({
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  images: [],
});

const rules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择商品分类", trigger: "change" }],
  price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
  stock: [{ required: true, message: "请输入商品库存", trigger: "blur" }],
  description: [{ required: true, message: "请输入商品描述", trigger: "blur" }],
};

// 监听表单数据变化
watch(
  () => props.formData,
  (newVal) => {
    if (newVal) {
      Object.assign(form, newVal);
    }
  },
  { immediate: true }
);

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
</script>

<style scoped>
.product-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style>
