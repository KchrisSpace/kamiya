<template>
  <div class="settings">
    <div class="header">
      <h2>系统设置</h2>
    </div>

    <el-card class="settings-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="网站名称" prop="siteName">
              <el-input v-model="basicForm.siteName" />
            </el-form-item>
            <el-form-item label="网站描述" prop="siteDescription">
              <el-input
                v-model="basicForm.siteDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="网站Logo">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img
                  v-if="basicForm.logo"
                  :src="basicForm.logo"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="客服电话" prop="servicePhone">
              <el-input v-model="basicForm.servicePhone" />
            </el-form-item>
            <el-form-item label="客服邮箱" prop="serviceEmail">
              <el-input v-model="basicForm.serviceEmail" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit"
                >保存</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="支付设置" name="payment">
          <el-form
            ref="paymentFormRef"
            :model="paymentForm"
            :rules="paymentRules"
            label-width="120px"
          >
            <el-form-item label="支付宝支付" prop="alipayEnabled">
              <el-switch v-model="paymentForm.alipayEnabled" />
            </el-form-item>
            <el-form-item
              v-if="paymentForm.alipayEnabled"
              label="支付宝AppID"
              prop="alipayAppId"
            >
              <el-input v-model="paymentForm.alipayAppId" />
            </el-form-item>
            <el-form-item
              v-if="paymentForm.alipayEnabled"
              label="支付宝私钥"
              prop="alipayPrivateKey"
            >
              <el-input
                v-model="paymentForm.alipayPrivateKey"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="微信支付" prop="wechatEnabled">
              <el-switch v-model="paymentForm.wechatEnabled" />
            </el-form-item>
            <el-form-item
              v-if="paymentForm.wechatEnabled"
              label="微信商户号"
              prop="wechatMerchantId"
            >
              <el-input v-model="paymentForm.wechatMerchantId" />
            </el-form-item>
            <el-form-item
              v-if="paymentForm.wechatEnabled"
              label="微信API密钥"
              prop="wechatApiKey"
            >
              <el-input v-model="paymentForm.wechatApiKey" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePaymentSubmit"
                >保存</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="物流设置" name="shipping">
          <el-form
            ref="shippingFormRef"
            :model="shippingForm"
            :rules="shippingRules"
            label-width="120px"
          >
            <el-form-item label="默认运费" prop="defaultShippingFee">
              <el-input-number
                v-model="shippingForm.defaultShippingFee"
                :min="0"
                :precision="2"
              />
            </el-form-item>
            <el-form-item label="免运费金额" prop="freeShippingThreshold">
              <el-input-number
                v-model="shippingForm.freeShippingThreshold"
                :min="0"
                :precision="2"
              />
            </el-form-item>
            <el-form-item label="发货时间" prop="shippingTime">
              <el-input-number
                v-model="shippingForm.shippingTime"
                :min="1"
                :max="7"
              />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleShippingSubmit"
                >保存</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

const activeTab = ref("basic");
const basicFormRef = ref(null);
const paymentFormRef = ref(null);
const shippingFormRef = ref(null);

const basicForm = reactive({
  siteName: "花华商城",
  siteDescription: "专业的鲜花销售平台",
  logo: "",
  servicePhone: "400-123-4567",
  serviceEmail: "service@example.com",
});

const paymentForm = reactive({
  alipayEnabled: true,
  alipayAppId: "",
  alipayPrivateKey: "",
  wechatEnabled: true,
  wechatMerchantId: "",
  wechatApiKey: "",
});

const shippingForm = reactive({
  defaultShippingFee: 10,
  freeShippingThreshold: 200,
  shippingTime: 3,
});

const basicRules = {
  siteName: [{ required: true, message: "请输入网站名称", trigger: "blur" }],
  servicePhone: [
    { required: true, message: "请输入客服电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  serviceEmail: [
    { required: true, message: "请输入客服邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

const paymentRules = {
  alipayAppId: [
    { required: true, message: "请输入支付宝AppID", trigger: "blur" },
  ],
  alipayPrivateKey: [
    { required: true, message: "请输入支付宝私钥", trigger: "blur" },
  ],
  wechatMerchantId: [
    { required: true, message: "请输入微信商户号", trigger: "blur" },
  ],
  wechatApiKey: [
    { required: true, message: "请输入微信API密钥", trigger: "blur" },
  ],
};

const shippingRules = {
  defaultShippingFee: [
    { required: true, message: "请输入默认运费", trigger: "blur" },
  ],
  freeShippingThreshold: [
    { required: true, message: "请输入免运费金额", trigger: "blur" },
  ],
  shippingTime: [
    { required: true, message: "请输入发货时间", trigger: "blur" },
  ],
};

const handleLogoSuccess = (response) => {
  basicForm.logo = response.url;
};

const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传文件只能是图片格式!");
  }
  if (!isLt2M) {
    ElMessage.error("上传图片大小不能超过 2MB!");
  }
  return isImage && isLt2M;
};

const handleBasicSubmit = async () => {
  if (!basicFormRef.value) return;
  await basicFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      ElMessage.success("保存成功");
    }
  });
};

const handlePaymentSubmit = async () => {
  if (!paymentFormRef.value) return;
  await paymentFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      ElMessage.success("保存成功");
    }
  });
};

const handleShippingSubmit = async () => {
  if (!shippingFormRef.value) return;
  await shippingFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      ElMessage.success("保存成功");
    }
  });
};
</script>

<style scoped>
.settings {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.unit {
  margin-left: 10px;
  color: #666;
}
</style>
