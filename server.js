import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

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

