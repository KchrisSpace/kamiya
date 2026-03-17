import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

dotenv.config();

// 启用 CORS
app.use(cors());
app.use(express.json());

// 确保上传目录存在（用户头像）
const uploadDir = path.join(__dirname, "public", "images", "users", "avater");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 品牌 / 店铺相关图片目录（例如店铺 Logo、品牌形象图）
const brandDir = path.join(__dirname, "public", "images", "brand");
if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

// 配置 multer 存储 - 用户头像
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用用户ID和时间戳生成唯一文件名
    const userId = req.body.userId || "user";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

// 文件过滤器：只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件（jpeg, jpg, png, gif, webp）"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// 配置 multer 存储 - 品牌 / 店铺图片（Logo、品牌形象等）
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, brandDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `brand_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const uploadBrand = multer({
  storage: brandStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// 文件上传接口
app.post("/api/upload/avatar", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "没有上传文件" });
    }

    // 返回文件路径（相对于 public 目录）
    const filePath = `/images/users/avater/${req.file.filename}`;
    res.json({
      success: true,
      path: filePath,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("上传失败:", error);
    res.status(500).json({ error: error.message || "上传失败" });
  }
});

// 店铺 / 品牌图片上传接口（用于店铺 Logo、品牌形象等）
app.post("/api/upload/logo", uploadBrand.single("logo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "没有上传文件" });
    }

    // 返回相对于 public 目录的路径，前端直接作为 img 的 src 使用
    const filePath = `/images/brand/${req.file.filename}`;
    res.json({
      success: true,
      path: filePath,
      url: filePath,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("品牌图片上传失败:", error);
    res.status(500).json({ error: error.message || "上传失败" });
  }
});

// 健康检查（用于确认 3002 服务已更新）
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "upload-and-ai-proxy",
    routes: [
      "/api/upload/avatar",
      "/api/upload/logo",
      "/api/ai/generate",
      "/api/ai/submit",
      "/api/ai/result",
    ],
  });
});

// =============== Volcengine Visual (文生图) 代理接口 ===============
const VOLC_ENDPOINT = "visual.volcengineapi.com";
const VOLC_REGION = process.env.VOLC_REGION || "cn-north-1";
const VOLC_SERVICE = process.env.VOLC_SERVICE || "cv";
const VOLC_ACCESS_KEY_ID = (process.env.VOLC_ACCESS_KEY_ID || "").trim();
const VOLC_SECRET_ACCESS_KEY = (process.env.VOLC_SECRET_ACCESS_KEY || "").trim();
const SILICONFLOW_API_KEY = (process.env.SILICONFLOW_API_KEY || "").trim();

const HEADER_KEYS_TO_IGNORE = new Set([
  "authorization",
  "content-type",
  "content-length",
  "user-agent",
  "presigned-expires",
  "expect",
]);

function hmac(secret, s) {
  return crypto.createHmac("sha256", secret).update(s, "utf8").digest();
}

function hash(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function uriEscape(str) {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch {
    return "";
  }
}

function queryParamsToString(params) {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const val = params[key];
      if (typeof val === "undefined" || val === null) return undefined;
      const escapedKey = uriEscape(key);
      if (!escapedKey) return undefined;
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(String(val))}`;
    })
    .filter((v) => v)
    .join("&");
}

function getSignHeaders(originHeaders, needSignHeaders) {
  const trimHeaderValue = (header) =>
    (header?.toString?.() ?? "").trim().replace(/\s+/g, " ");

  let h = Object.keys(originHeaders);
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set(
      [...needSignHeaders, "x-date", "host"].map((k) => k.toLowerCase())
    );
    h = h.filter((k) => needSignSet.has(k.toLowerCase()));
  }
  h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
  const signedHeaderKeys = h
    .slice()
    .map((k) => k.toLowerCase())
    .sort()
    .join(";");
  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join("\n");
  return [signedHeaderKeys, canonicalHeaders];
}

function getDateTimeNow() {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function signV4({
  method,
  pathName = "/",
  query = {},
  headers = {},
  body = "",
  accessKeyId,
  secretAccessKey,
  region,
  serviceName,
}) {
  const datetime = headers["X-Date"];
  const date = datetime.substring(0, 8);

  const bodySha = hash(body || "");
  const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, []);

  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha,
  ].join("\n");

  const credentialScope = [date, region, serviceName, "request"].join("/");
  const stringToSign = [
    "HMAC-SHA256",
    datetime,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");

  const kDate = hmac(secretAccessKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, "request");
  const signature = hmac(kSigning, stringToSign).toString("hex");

  return [
    "HMAC-SHA256",
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(" ");
}

function ensureVolcKeys(res) {
  if (!VOLC_ACCESS_KEY_ID || !VOLC_SECRET_ACCESS_KEY) {
    res.status(500).json({
      success: false,
      error:
        "服务器未配置 VOLC_ACCESS_KEY_ID / VOLC_SECRET_ACCESS_KEY，请在 .env 中配置",
    });
    return false;
  }
  return true;
}

function ensureSiliconFlowKey(res) {
  if (!SILICONFLOW_API_KEY) {
    res.status(500).json({
      success: false,
      error: "服务器未配置 SILICONFLOW_API_KEY，请在 .env 中配置",
    });
    return false;
  }
  return true;
}

// SiliconFlow 文生图（一次请求直接返回图片URL）
app.post("/api/ai/generate", async (req, res) => {
  if (!ensureSiliconFlowKey(res)) return;
  try {
    const {
      prompt,
      model = "Kwai-Kolors/Kolors",
      image_size = "1024x1024",
      batch_size = 3,
      num_inference_steps = 20,
      guidance_scale = 7.5,
      negative_prompt,
      seed,
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      res.status(400).json({ success: false, error: "prompt 不能为空" });
      return;
    }

    const payload = {
      model,
      prompt: String(prompt),
      image_size,
      batch_size,
      num_inference_steps,
      guidance_scale,
    };
    if (negative_prompt) payload.negative_prompt = String(negative_prompt);
    if (typeof seed === "number") payload.seed = seed;

    const url = "https://api.siliconflow.cn/v1/images/generations";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const traceId = resp.headers.get("x-siliconcloud-trace-id") || null;
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      res.status(resp.status).json({
        success: false,
        http_status: resp.status,
        trace_id: traceId,
        data,
      });
      return;
    }

    res.json({
      success: true,
      http_status: resp.status,
      trace_id: traceId,
      data,
    });
  } catch (error) {
    console.error("SiliconFlow 文生图失败:", error);
    res.status(500).json({ success: false, error: error.message || "生成失败" });
  }
});

// 提交文生图任务
app.post("/api/ai/submit", async (req, res) => {
  if (!ensureVolcKeys(res)) return;
  try {
    const {
      prompt,
      width = 1328,
      height = 1328,
      seed = -1,
      scale = 2.5,
      use_pre_llm = false,
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      res.status(400).json({ success: false, error: "prompt 不能为空" });
      return;
    }

    const query = {
      Action: "CVSync2AsyncSubmitTask",
      Version: "2022-08-31",
    };

    const bodyObj = {
      req_key: "high_aes_general_v30l_zt2i",
      prompt: String(prompt),
      seed,
      width,
      height,
      scale,
      use_pre_llm,
    };
    const body = JSON.stringify(bodyObj);

    const headers = {
      Host: VOLC_ENDPOINT,
      "X-Date": getDateTimeNow(),
    };
    // POST 请求建议带上 body sha256（并参与签名）
    headers["X-Content-Sha256"] = hash(body);

    const authorization = signV4({
      method: "POST",
      pathName: "/",
      query,
      headers,
      body,
      accessKeyId: VOLC_ACCESS_KEY_ID,
      secretAccessKey: VOLC_SECRET_ACCESS_KEY,
      region: VOLC_REGION,
      serviceName: VOLC_SERVICE,
    });

    const url = `https://${VOLC_ENDPOINT}/?${queryParamsToString(query)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body, // IMPORTANT: must match body used in signature
    });
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    // 透传上游状态，便于排查（签名失败/风控等）
    res.json({
      success: resp.ok && data?.code === 10000,
      data,
      http_status: resp.status,
    });
  } catch (error) {
    console.error("提交文生图任务失败:", error);
    res.status(500).json({ success: false, error: error.message || "提交失败" });
  }
});

// 查询文生图任务
app.post("/api/ai/result", async (req, res) => {
  if (!ensureVolcKeys(res)) return;
  try {
    const { task_id, return_url = true } = req.body || {};
    if (!task_id) {
      res.status(400).json({ success: false, error: "task_id 不能为空" });
      return;
    }

    const query = {
      Action: "CVSync2AsyncGetResult",
      Version: "2022-08-31",
    };

    const req_json = JSON.stringify({ return_url });
    const bodyObj = {
      req_key: "high_aes_general_v30l_zt2i",
      task_id,
      req_json,
    };
    const body = JSON.stringify(bodyObj);

    const headers = {
      Host: VOLC_ENDPOINT,
      "X-Date": getDateTimeNow(),
    };
    headers["X-Content-Sha256"] = hash(body);

    const authorization = signV4({
      method: "POST",
      pathName: "/",
      query,
      headers,
      body,
      accessKeyId: VOLC_ACCESS_KEY_ID,
      secretAccessKey: VOLC_SECRET_ACCESS_KEY,
      region: VOLC_REGION,
      serviceName: VOLC_SERVICE,
    });

    const url = `https://${VOLC_ENDPOINT}/?${queryParamsToString(query)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body, // IMPORTANT: must match body used in signature
    });
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.json({
      success: resp.ok && data?.code === 10000,
      data,
      http_status: resp.status,
    });
  } catch (error) {
    console.error("查询文生图任务失败:", error);
    res.status(500).json({ success: false, error: error.message || "查询失败" });
  }
});

// 删除旧头像
app.delete("/api/upload/avatar", (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: "缺少文件名" });
    }

    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "文件删除成功" });
    } else {
      res.status(404).json({ error: "文件不存在" });
    }
  } catch (error) {
    console.error("删除失败:", error);
    res.status(500).json({ error: error.message || "删除失败" });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`文件上传服务器运行在 http://localhost:${PORT}`);
});

