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

// 允许的图片类型 -> 安全扩展名映射
// 扩展名由服务端根据声明MIME推导，不再信任原始文件名的扩展名
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

// 各格式的magic bytes签名（用于上传后校验真实内容）
const MAGIC_BYTES: Record<string, Array<{ offset: number; bytes: number[] }>> = {
  'image/jpeg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  'image/jpg': [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  'image/png': [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  'image/gif': [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  'image/webp': [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
};

// 存储配置
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 生成唯一文件名: 时间戳-随机数.服务端推导的扩展名
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = ALLOWED_MIME_TO_EXT[file.mimetype] || 'bin';
    const filename = `${timestamp}-${random}.${extension}`;
    cb(null, filename);
  },
});

// 文件过滤器（先按声明MIME过滤，落盘后还会校验magic bytes）
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TO_EXT[file.mimetype]) {
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

/**
 * 校验已上传文件的magic bytes是否与声明MIME一致
 * @param filepath 文件绝对路径
 * @param mimetype 声明的MIME类型
 * @returns 是否匹配
 */
export const verifyImageSignature = (filepath: string, mimetype: string): boolean => {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) {
    return false;
  }

  try {
    const fd = fs.openSync(filepath, 'r');
    try {
      // 读取前16字节（覆盖webp的offset 8）
      const buf = Buffer.alloc(16);
      const bytesRead = fs.readSync(fd, buf, 0, 16, 0);
      return signatures.some((sig) => {
        if (sig.offset + sig.bytes.length > bytesRead) {
          return false;
        }
        return sig.bytes.every((byte, i) => buf[sig.offset + i] === byte);
      });
    } finally {
      fs.closeSync(fd);
    }
  } catch (error) {
    logger.error('校验文件签名失败:', error);
    return false;
  }
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

    // 解析为候选本地路径（只允许 uploads 目录内的文件）
    let candidate: string | null = null;

    if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
      // URL：仅取文件名，丢弃其余路径（防穿越）
      const url = new URL(filepath);
      const filename = path.basename(url.pathname);
      candidate = path.join(uploadDir, filename);
    } else if (path.isAbsolute(filepath)) {
      // 绝对路径：仅当位于 uploads 目录内才允许
      candidate = filepath;
    } else {
      // 相对路径：仅取文件名
      candidate = path.join(uploadDir, path.basename(filepath));
    }

    if (!candidate) {
      resolve();
      return;
    }

    const uploadDirResolved = path.resolve(uploadDir);
    const resolvedPath = path.resolve(candidate);

    // 路径包含校验：必须位于 uploads 目录内
    if (resolvedPath !== uploadDirResolved && !resolvedPath.startsWith(uploadDirResolved + path.sep)) {
      logger.warn(`拒绝删除uploads目录外的文件: ${filepath}`);
      reject(new Error('非法文件路径'));
      return;
    }

    fs.unlink(resolvedPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // 文件不存在，不算错误
          logger.warn(`尝试删除不存在的文件: ${resolvedPath}`);
          resolve();
        } else {
          logger.error(`删除文件失败: ${resolvedPath}`, err);
          reject(err);
        }
      } else {
        logger.info(`文件已删除: ${resolvedPath}`);
        resolve();
      }
    });
  });
};
