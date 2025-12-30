<template>
  <div class="customize-container">
    <h2 class="page-title">定制</h2>
    <!-- 未登录提示 -->
    <div v-if="!userid" class="login-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">
          <el-icon :size="64"><User /></el-icon>
        </div>
        <p class="prompt-text">暂未登录</p>
        <p class="prompt-desc">请先登录后查看定制功能</p>
        <button class="login-btn" @click="goToLogin">去登录</button>
      </div>
    </div>

    <!-- 定制内容（仅登录后显示） -->
    <div v-else class="customize-content">
      <!-- 顶部模式切换按钮 -->
      <div class="top-actions">
        <el-button
          :class="['upload-btn', { active: customizeMode === 'image' }]"
          :type="customizeMode === 'image' ? 'primary' : ''"
          @click="switchMode('image')"
        >
          <el-icon><Picture /></el-icon>
          <span>上传参考图</span>
        </el-button>
        <el-button
          :class="['ai-btn', { active: customizeMode === 'ai' }]"
          :type="customizeMode === 'ai' ? 'primary' : ''"
          @click="switchMode('ai')"
        >
          <el-icon><MagicStick /></el-icon>
          <span>AI灵感设计</span>
        </el-button>
      </div>

      <!-- 来图定制模式：您的需求和上传图片 -->
      <template v-if="customizeMode === 'image'">
        <!-- 您的需求 -->
        <div class="requirement-section">
          <h3 class="section-title">您的需求</h3>
          <div class="requirement-fields">
            <div class="field-item budget-range">
              <el-icon class="field-icon"><Money /></el-icon>
              <div class="budget-inputs">
                <el-input
                  v-model="requirements.budgetMin"
                  placeholder="最低预算"
                  class="budget-input"
                  type="number"
                />
                <span class="budget-separator">至</span>
                <el-input
                  v-model="requirements.budgetMax"
                  placeholder="最高预算"
                  class="budget-input"
                  type="number"
                />
              </div>
            </div>
            <div class="field-item">
              <el-icon class="field-icon"><Calendar /></el-icon>
              <el-date-picker
                v-model="requirements.expectedTime"
                type="date"
                placeholder="选择预期时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="requirement-date-picker"
                :disabled-date="disabledDate"
              />
            </div>
          </div>
          <div class="remark-field">
            <el-input
              v-model="requirements.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（选填）"
              maxlength="200"
              show-word-limit
              class="remark-textarea"
            />
          </div>
        </div>

        <!-- 上传图片区域 -->
        <div class="image-upload-section">
          <div v-if="uploadedImages.length === 0" class="upload-area">
            <el-upload
              class="image-uploader"
              drag
              :auto-upload="false"
              :on-change="handleImageChange"
              :file-list="fileList"
              accept="image/*"
              :show-file-list="false"
              multiple
            >
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将图片拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 jpg/png 格式，文件大小不超过 5MB，可上传多张图片
                </div>
              </template>
            </el-upload>
          </div>

          <!-- 上传后的图片预览 -->
          <div v-else class="uploaded-images-preview">
            <div class="images-grid">
              <div
                v-for="(image, index) in uploadedImages"
                :key="index"
                class="image-preview-item"
              >
                <div class="image-wrapper">
                  <img
                    :src="image.url"
                    :alt="`参考图 ${index + 1}`"
                    class="preview-image"
                  />
                  <div class="image-overlay">
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      @click="handleRemoveImage(index)"
                      class="remove-btn"
                    />
                  </div>
                </div>
              </div>
              <!-- 继续添加图片按钮 -->
              <div class="add-more-image" @click="triggerFileInput">
                <el-upload
                  ref="uploadRef"
                  class="hidden-upload"
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  :file-list="fileList"
                  accept="image/*"
                  :show-file-list="false"
                  multiple
                >
                  <div class="add-more-content">
                    <el-icon class="add-icon"><Plus /></el-icon>
                    <span>添加更多图片</span>
                  </div>
                </el-upload>
              </div>
            </div>
            <div class="preview-actions">
              <el-button @click="handleClearAllImages">清空所有图片</el-button>
            </div>
          </div>
        </div>
      </template>

      <!-- AI定制模式：描述和生成部分 -->
      <template v-if="customizeMode === 'ai'">
        <!-- 您的需求 -->
        <div class="requirement-section">
          <h3 class="section-title">您的需求</h3>
          <div class="requirement-fields">
            <div class="field-item budget-range">
              <el-icon class="field-icon"><Money /></el-icon>
              <div class="budget-inputs">
                <el-input
                  v-model="requirements.budgetMin"
                  placeholder="最低预算"
                  class="budget-input"
                  type="number"
                />
                <span class="budget-separator">至</span>
                <el-input
                  v-model="requirements.budgetMax"
                  placeholder="最高预算"
                  class="budget-input"
                  type="number"
                />
              </div>
            </div>
            <div class="field-item">
              <el-icon class="field-icon"><Calendar /></el-icon>
              <el-date-picker
                v-model="requirements.expectedTime"
                type="date"
                placeholder="选择预期时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="requirement-date-picker"
                :disabled-date="disabledDate"
              />
            </div>
          </div>
          <div class="remark-field">
            <el-input
              v-model="requirements.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（选填）"
              maxlength="200"
              show-word-limit
              class="remark-textarea"
            />
          </div>
        </div>

        <!-- 描述您梦想中的甜品 -->
        <div class="description-section">
          <h3 class="section-title">描述您梦想中的甜品</h3>
          <el-input
            v-model="description"
            type="textarea"
            :rows="6"
            placeholder="例如:一个粉色城堡蛋糕,有草莓和云朵装饰..."
            class="description-textarea"
            maxlength="500"
            show-word-limit
          />

          <!-- 标签选择 -->
          <div class="tag-list">
            <el-tag
              v-for="tag in tags"
              :key="tag.value"
              :class="[
                'tag-item',
                { active: selectedTags.includes(tag.value) },
              ]"
              @click="toggleTag(tag.value)"
            >
              <el-icon class="tag-icon"><component :is="tag.icon" /></el-icon>
              <span>{{ tag.label }}</span>
            </el-tag>
          </div>

          <!-- 生成设计灵感按钮 -->
          <el-button
            type="primary"
            class="generate-btn"
            @click="handleGenerateDesign"
          >
            <el-icon><MagicStick /></el-icon>
            <span>生成设计灵感</span>
          </el-button>
        </div>

        <!-- AI 设计方案 -->
        <div class="design-section">
          <h3 class="section-title">AI 设计方案</h3>

          <!-- 暂无设计方案 -->
          <div v-if="designPreviews.length === 0" class="no-design-placeholder">
            <span class="no-design-text">暂无</span>
          </div>

          <!-- 设计方案列表 -->
          <div v-else class="design-preview-list">
            <div
              v-for="(design, index) in designPreviews"
              :key="index"
              :class="[
                'design-preview-item',
                { selected: selectedDesignIndex === index },
              ]"
              @click="selectDesign(index)"
            >
              <div class="design-image-wrapper">
                <img
                  v-if="design.image"
                  :src="design.image"
                  :alt="`设计方案 ${index + 1}`"
                  class="design-image"
                />
                <div v-else class="design-placeholder">
                  <el-icon class="placeholder-icon"><Picture /></el-icon>
                </div>
                <div
                  v-if="selectedDesignIndex === index"
                  class="selected-badge"
                >
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮（仅在生成设计方案后显示） -->
          <div v-if="designPreviews.length > 0" class="design-actions">
            <el-button class="retry-btn" @click="handleRetry">
              <el-icon><Refresh /></el-icon>
              <span>不满意?再试一次</span>
            </el-button>
            <el-button
              type="primary"
              class="create-order-btn"
              @click="handleCreateOrder"
            >
              <el-icon><ShoppingCart /></el-icon>
              <span>选择此图创建订单</span>
            </el-button>
          </div>
        </div>
      </template>

      <!-- 来图定制模式：创建订单按钮 -->
      <div
        v-if="customizeMode === 'image' && uploadedImages.length > 0"
        class="image-order-actions"
      >
        <el-button
          type="primary"
          class="create-order-btn"
          @click="handleCreateOrderFromImage"
        >
          <el-icon><ShoppingCart /></el-icon>
          <span>创建订单</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  Picture,
  MagicStick,
  Money,
  Calendar,
  Check,
  Refresh,
  ShoppingCart,
  UploadFilled,
  Star,
  Document,
  ShoppingBag,
  User,
  Setting,
  Delete,
  Plus,
} from "@element-plus/icons-vue";

const router = useRouter();

// 检查用户是否登录
const userid = localStorage.getItem("userId");

// 跳转到登录页
function goToLogin() {
  router.push("/login");
}

// 定制模式：'image' 来图定制 | 'ai' AI定制
const customizeMode = ref("ai");

// 需求信息
const requirements = reactive({
  budgetMin: "",
  budgetMax: "",
  expectedTime: "",
  remark: "",
});

// 描述文本
const description = ref("");

// 标签列表
const tags = [
  { label: "草莓", value: "strawberry", icon: Star },
  { label: "巧克力", value: "chocolate", icon: Document },
  { label: "双层", value: "double", icon: ShoppingBag },
  { label: "森系", value: "forest", icon: User },
  { label: "可爱风", value: "cute", icon: Setting },
];

// 选中的标签
const selectedTags = ref([]);

// 设计预览列表
const designPreviews = ref([]);

// 选中的设计索引
const selectedDesignIndex = ref(-1);

// 上传相关
const fileList = ref([]);
const uploadedImages = ref([]); // 存储多张图片：[{ url, file }]
const uploadRef = ref(null);

// 切换模式
const switchMode = (mode) => {
  customizeMode.value = mode;
  // 切换模式时清空数据
  if (mode === "image") {
    description.value = "";
    selectedTags.value = [];
    designPreviews.value = [{ image: null }, { image: null }, { image: null }];
    selectedDesignIndex.value = -1;
  } else {
    uploadedImages.value = [];
    fileList.value = [];
  }
};

// 切换标签
const toggleTag = (tagValue) => {
  const index = selectedTags.value.indexOf(tagValue);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tagValue);
  }
};

// 处理图片变化（来图定制模式）
const handleImageChange = (file) => {
  if (file.raw) {
    // 检查文件大小（5MB）
    const isLt5M = file.raw.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      ElMessage.error("图片大小不能超过 5MB");
      return;
    }

    // 检查文件类型
    const isImage = file.raw.type.startsWith("image/");
    if (!isImage) {
      ElMessage.error("只能上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.value.push({
        url: e.target.result,
        file: file.raw,
      });
      ElMessage.success(`已添加图片 ${uploadedImages.value.length}`);
    };
    reader.onerror = () => {
      ElMessage.error("图片读取失败，请重试");
    };
    reader.readAsDataURL(file.raw);
  }
};

// 移除单张图片
const handleRemoveImage = (index) => {
  uploadedImages.value.splice(index, 1);
  ElMessage.success("图片已移除");
};

// 清空所有图片
const handleClearAllImages = () => {
  uploadedImages.value = [];
  fileList.value = [];
  ElMessage.success("已清空所有图片");
};

// 触发文件选择
const triggerFileInput = () => {
  // el-upload 会自动处理点击事件
};

// 生成设计灵感
const handleGenerateDesign = () => {
  if (!description.value.trim() && selectedTags.value.length === 0) {
    ElMessage.warning("请描述您的需求或选择标签");
    return;
  }

  ElMessage.info("正在生成设计方案...");

  // 模拟生成设计预览图
  setTimeout(() => {
    // 这里应该调用AI生成接口
    // 暂时使用占位图（实际项目中应该返回真实的图片URL）
    // 为了演示，我们使用null，这样会显示占位符
    designPreviews.value = [
      { image: null }, // 实际项目中替换为真实图片URL
      { image: null },
      { image: null },
    ];
    ElMessage.success("设计方案生成成功！");
    // 默认选中第一个
    selectedDesignIndex.value = 0;
  }, 2000);
};

// 选择设计
const selectDesign = (index) => {
  selectedDesignIndex.value = index;
};

// 重新生成
const handleRetry = () => {
  if (selectedDesignIndex.value === -1) {
    ElMessage.warning("请先选择一个设计方案");
    return;
  }
  handleGenerateDesign();
};

// 创建订单（AI定制模式）
const handleCreateOrder = () => {
  if (selectedDesignIndex.value === -1) {
    ElMessage.warning("请先选择一个设计方案");
    return;
  }

  // 跳转到创建订单页面，传递定制信息
  const customData = {
    mode: "ai",
    description: description.value,
    tags: selectedTags.value,
    budgetMin: requirements.budgetMin,
    budgetMax: requirements.budgetMax,
    expectedTime: requirements.expectedTime,
    remark: requirements.remark,
    designImage: designPreviews.value[selectedDesignIndex.value].image,
  };

  // 将定制数据存储到sessionStorage，在创建订单页面使用
  sessionStorage.setItem("customOrderData", JSON.stringify(customData));
  router.push("/create-order");
};

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
};

// 创建订单（来图定制模式）
const handleCreateOrderFromImage = () => {
  if (uploadedImages.value.length === 0) {
    ElMessage.warning("请先上传参考图");
    return;
  }

  // 跳转到创建订单页面，传递定制信息
  const customData = {
    mode: "image",
    referenceImages: uploadedImages.value.map((img) => img.url),
    referenceImageFiles: uploadedImages.value.map((img) => img.file),
    budgetMin: requirements.budgetMin,
    budgetMax: requirements.budgetMax,
    expectedTime: requirements.expectedTime,
    remark: requirements.remark,
  };

  // 将定制数据存储到sessionStorage，在创建订单页面使用
  sessionStorage.setItem("customOrderData", JSON.stringify(customData));
  router.push("/create-order");
};
</script>

<style scoped>
.customize-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
}

.page-title {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 登录提示样式 */
.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.prompt-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: linear-gradient(135deg, #fff9fb 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.2);
}

.prompt-icon {
  margin-bottom: 20px;
  color: #ff6b9d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-text {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  font-family: "Nunito", sans-serif;
}

.prompt-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
  font-family: "Nunito", sans-serif;
}

.login-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 100%);
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Nunito", sans-serif;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.35);
}

.login-btn:hover {
  background: linear-gradient(135deg, #ff91a4 0%, #ff6b9d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.45);
}

.login-btn:active {
  transform: translateY(0);
}

.customize-content {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: #fff5f7;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* 顶部操作按钮 */
.top-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.upload-btn,
.ai-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-btn,
.ai-btn {
  background: #fff;
  border: 2px solid #e0e0e0;
  color: #666;
  transition: all 0.3s;
}

.upload-btn:hover,
.ai-btn:hover {
  border-color: #f26371;
  color: #f26371;
}

.upload-btn.active,
.ai-btn.active {
  background: linear-gradient(135deg, #f26371 0%, #ff8a95 100%);
  border-color: #f26371;
  color: #fff;
}

.upload-btn.active:hover,
.ai-btn.active:hover {
  background: linear-gradient(135deg, #ff8a95 0%, #f26371 100%);
}

/* 章节标题 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ffe0e6;
}

/* 您的需求部分 */
.requirement-section {
  margin-bottom: 30px;
}

.requirement-fields {
  display: flex;
  gap: 20px;
}

.field-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #ffe0e6;
}

.field-item.budget-range {
  flex: 1.5; /* 预算范围需要更多空间 */
}

.budget-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.budget-input {
  flex: 1;
  border: none;
}

.budget-input :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0;
  border: none;
  background: transparent;
}

.budget-separator {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
  padding: 0 5px;
}

.field-icon {
  color: #f26371;
  font-size: 20px;
  flex-shrink: 0;
}

.requirement-input {
  flex: 1;
  border: none;
}

.requirement-input :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0;
}

.requirement-date-picker {
  flex: 1;
  width: 100%;
}

.requirement-date-picker :deep(.el-input__wrapper) {
  box-shadow: none;
  border: none;
  padding: 0;
  background: transparent;
}

.requirement-date-picker :deep(.el-input__inner) {
  padding: 0;
  border: none;
  background: transparent;
  color: #333;
}

.requirement-date-picker :deep(.el-input__inner::placeholder) {
  color: #999;
}

/* 备注输入框 */
.remark-field {
  margin-top: 20px;
}

.remark-textarea {
  width: 100%;
}

.remark-textarea :deep(.el-textarea__inner) {
  border: 2px solid #ffe0e6;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
  background: #fff;
  resize: none;
}

.remark-textarea :deep(.el-textarea__inner):focus {
  border-color: #f26371;
}

/* 描述部分 */
.description-section {
  margin-bottom: 30px;
}

.description-textarea {
  margin-bottom: 20px;
}

.description-textarea :deep(.el-textarea__inner) {
  border: 2px solid #ffe0e6;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
  background: #fff;
}

.description-textarea :deep(.el-textarea__inner):focus {
  border-color: #f26371;
}

/* 标签列表 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.tag-item {
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #ffe0e6;
  background: #fff;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.tag-item:hover {
  border-color: #f26371;
  color: #f26371;
}

.tag-item.active {
  background: linear-gradient(135deg, #f26371 0%, #ff8a95 100%);
  border-color: #f26371;
  color: #fff;
}

.tag-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f26371 0%, #ff8a95 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* AI设计方案部分 */
.design-section {
  margin-top: 30px;
}

/* 暂无设计方案占位符 */
.no-design-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #fff;
  border-radius: 12px;
  border: 2px dashed #ffe0e6;
}

.no-design-text {
  font-size: 18px;
  color: #999;
  font-weight: 500;
}

.design-preview-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.design-preview-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
}

.design-preview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(242, 99, 113, 0.2);
}

.design-preview-item.selected {
  border-color: #f26371;
  box-shadow: 0 0 0 3px rgba(242, 99, 113, 0.2);
}

.design-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
}

.design-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.design-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.placeholder-icon {
  font-size: 48px;
  color: #ccc;
}

.selected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #f26371;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(242, 99, 113, 0.3);
}

/* 来图定制模式：上传区域 */
.image-upload-section {
  margin-bottom: 30px;
}

.upload-area {
  width: 100%;
}

.image-uploader :deep(.el-upload) {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 300px;
  border: 2px dashed #ffe0e6;
  border-radius: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: #f26371;
  background: #fff9fb;
}

.upload-icon {
  font-size: 64px;
  color: #f26371;
  margin-bottom: 20px;
}

.image-uploader :deep(.el-upload__text) {
  color: #666;
  font-size: 16px;
  margin-top: 10px;
}

.image-uploader :deep(.el-upload__text em) {
  color: #f26371;
  font-style: normal;
  font-weight: 600;
}

.image-uploader :deep(.el-upload__tip) {
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}

/* 上传后的图片预览 */
.uploaded-images-preview {
  width: 100%;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.image-preview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(242, 99, 113, 0.2);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #f26371;
}

.remove-btn:hover {
  background: #fff;
  color: #ff4d7a;
}

/* 添加更多图片按钮 */
.add-more-image {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px dashed #ffe0e6;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.add-more-image:hover {
  border-color: #f26371;
  background: #fff9fb;
}

.hidden-upload {
  width: 100%;
  height: 100%;
}

.hidden-upload :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-more-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #999;
  font-size: 14px;
}

.add-icon {
  font-size: 32px;
  color: #f26371;
}

.add-more-image:hover .add-more-content {
  color: #f26371;
}

.preview-actions {
  padding: 20px 0;
  text-align: center;
  background: transparent;
}

/* 来图定制模式：创建订单按钮 */
.image-order-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.image-order-actions .create-order-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

/* 操作按钮 */
.design-actions {
  display: flex;
  gap: 20px;
}

.retry-btn,
.create-order-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.retry-btn {
  background: #fff;
  border: 2px solid #e0e0e0;
  color: #666;
}

.retry-btn:hover {
  border-color: #f26371;
  color: #f26371;
}

.create-order-btn {
  background: linear-gradient(135deg, #f26371 0%, #ff8a95 100%);
  border: none;
}

/* 上传对话框 */
.upload-icon {
  font-size: 48px;
  color: #f26371;
  margin-bottom: 16px;
}

.upload-demo :deep(.el-upload-dragger) {
  border: 2px dashed #ffe0e6;
  border-radius: 12px;
  background: #fff5f7;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: #f26371;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customize-container {
    padding: 20px;
  }

  .top-actions {
    flex-direction: column;
  }

  .requirement-fields {
    flex-direction: column;
  }

  .design-preview-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .design-actions {
    flex-direction: column;
  }
}
</style>
