import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import logger from './logger';

// 确保上传目录存在
const publicDir = path.join(__dirname, '..', 'public');
const uploadDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`创建上传目录: ${uploadDir}`);
}

// 存储配置
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 生成唯一的文件名: 时间戳-随机数-原始文件名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${random}${extension}`;
    cb(null, filename);
  },
});

// 文件过滤器
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // 允许的图片类型
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型。仅支持 JPEG、PNG、GIF 和 WebP 格式。'));
  }
};

// 创建上传中间件
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
});

// 单个文件上传中间件（用于头像上传）
export const uploadSingle = (fieldName: string = 'avatar') => {
  return upload.single(fieldName);
};

// 多个文件上传中间件
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

// 生成文件的公共访问URL
export const getFileUrl = (filepath: string): string => {
  if (!filepath) return '';

  // 如果是完整的URL，直接返回
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
    return filepath;
  }

  // 获取相对于public目录的路径
  let relativePath: string;

  if (path.isAbsolute(filepath)) {
    // 如果是绝对路径，计算相对于public目录的路径
    relativePath = path.relative(publicDir, filepath);
  } else if (filepath.startsWith('uploads/')) {
    // 如果已经是相对路径（以uploads/开头）
    relativePath = filepath;
  } else {
    // 其他情况，假设文件在uploads目录下
    relativePath = `uploads/${path.basename(filepath)}`;
  }

  // 确保路径使用正斜杠
  relativePath = relativePath.replace(/\\/g, '/');

  // 构建基于服务器的URL
  const baseUrl = env.backendUrl.replace(/\/$/, '');
  return `${baseUrl}/${relativePath}`;
};

// 获取文件相对路径（用于存储到数据库）
export const getRelativePath = (filepath: string): string => {
  if (!filepath) return '';

  // 如果是完整的URL，提取相对路径
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
    const url = new URL(filepath);
    // 移除开头的 '/'，返回路径如 'uploads/filename.jpg'
    return url.pathname.substring(1);
  }

  // 如果是绝对路径，计算相对于public目录的路径
  if (path.isAbsolute(filepath)) {
    const relativePath = path.relative(publicDir, filepath);
    return relativePath.replace(/\\/g, '/');
  }

  // 如果已经是相对路径（以uploads/开头），直接返回
  if (filepath.startsWith('uploads/')) {
    return filepath;
  }

  // 其他情况，假设文件在uploads目录下
  return `uploads/${path.basename(filepath)}`;
};

// 删除文件
export const deleteFile = (filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!filepath) {
      resolve();
      return;
    }

    // 如果是URL，提取本地路径
    let localPath = filepath;
    if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
      const url = new URL(filepath);
      const urlPath = url.pathname.substring(1); // 移除开头的 '/'

      // 检查URL路径是否包含驱动器盘符（如 /E:/...）
      if (urlPath.match(/^[a-zA-Z]:[\\\/]/)) {
        // 包含驱动器盘符，可能是错误的URL格式，提取文件名
        const filename = path.basename(urlPath);
        localPath = path.join(uploadDir, filename);
      } else {
        // 正常URL路径，相对于public目录
        localPath = path.join(publicDir, urlPath);
      }
    } else if (filepath.startsWith('uploads/')) {
      localPath = path.join(uploadDir, path.basename(filepath));
    } else if (path.isAbsolute(filepath)) {
      // 如果是绝对路径，直接使用
      localPath = filepath;
    } else {
      // 其他情况，假设文件在uploads目录下
      localPath = path.join(uploadDir, path.basename(filepath));
    }

    // 确保路径规范化
    localPath = path.normalize(localPath);

    fs.unlink(localPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // 文件不存在，不算错误
          logger.warn(`尝试删除不存在的文件: ${localPath}`);
          resolve();
        } else {
          logger.error(`删除文件失败: ${localPath}`, err);
          reject(err);
        }
      } else {
        logger.info(`文件已删除: ${localPath}`);
        resolve();
      }
    });
  });
};