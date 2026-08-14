import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from '../config/env';
import { checkDatabaseConnection } from '../config/database';
import logger from '../utils/logger';

// 导入控制器
import {
  redirectToOAuth,
  handleOAuthCallback,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller';

import {
  getUsers,
  getUserById,
  updateUser,
  searchUsers,
} from '../controllers/user.controller';

import {
  healthCheck,
  systemInfo,
  listRoutes,
} from '../controllers/health.controller';

import {
  uploadFile,
  uploadAvatar,
  deleteUploadedFile,
} from '../controllers/upload.controller';

import {
  getMusicList,
} from '../controllers/music.controller';

import {
  getComments,
  createComment,
  toggleReaction,
} from '../controllers/comment.controller';

import {
  getArticles,
  getArticleById,
  getTopArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/article.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { userUpdateValidationRules } from '../utils/validator';

// 创建Express应用
const app = express();
const port = env.port;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

// 请求体解析（限制放宽到2MB，避免长文章被100KB默认值拦截）
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP限制1000个请求
  message: '请求过于频繁，请稍后再试。',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 静态文件服务
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// 日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// API路由
// 健康检查
app.get('/api/health', healthCheck);
app.get('/api/system', authenticate, requireAdmin, systemInfo);
app.get('/api/routes', authenticate, requireAdmin, listRoutes);

// 认证路由
app.get('/api/auth/natayark', redirectToOAuth);
app.get('/api/auth/natayark/callback', handleOAuthCallback);
app.get('/api/auth/me', authenticate, getCurrentUser);
app.post('/api/auth/logout', authenticate, logout);

// 用户路由（注意：/search 必须注册在 /:id 之前）
app.get('/api/users', authenticate, requireAdmin, getUsers);
app.get('/api/users/search', authenticate, requireAdmin, searchUsers);
app.get('/api/users/:id', authenticate, getUserById);
app.patch('/api/users/:id', authenticate, userUpdateValidationRules, updateUser);

// 音乐路由
app.get('/api/music/getMusicList', getMusicList);

// 评论路由
app.get('/api/comments', getComments);
app.post('/api/comments', authenticate, createComment);
app.post('/api/comments/:id/reaction', authenticate, toggleReaction);

// 文章路由
app.get('/api/articles/top', getTopArticles);
app.get('/api/articles', getArticles);
app.get('/api/articles/:id', getArticleById);
app.post('/api/articles', authenticate, requireAdmin, createArticle);
app.patch('/api/articles/:id', authenticate, requireAdmin, updateArticle);
app.delete('/api/articles/:id', authenticate, requireAdmin, deleteArticle);

// 文件上传路由（需登录；删除文件需管理员）
app.post('/api/upload', authenticate, uploadFile);
app.post('/api/upload/avatar', authenticate, uploadAvatar);
app.delete('/api/upload', authenticate, requireAdmin, deleteUploadedFile);

// 根路由
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'NeoBlog API 服务正在运行',
    version: '1.0.0',
    documentation: `${env.backendUrl}/api/routes`,
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
    },
  });
});

// 错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // 请求体解析错误：映射为4xx
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: '请求体过大' },
    });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: '请求体不是有效的JSON' },
    });
  }

  logger.error('服务器错误:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误',
      // 在生产环境中不应返回堆栈跟踪
      ...(env.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 检查数据库连接
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      logger.error('数据库连接失败，服务器启动中止');
      process.exit(1);
    }

    app.listen(port, () => {
      logger.info(`🚀 服务器已启动`);
      logger.info(`📡 地址: ${env.backendUrl}`);
      logger.info(`🌍 环境: ${env.nodeEnv}`);
      logger.info(`🔗 前端地址: ${env.frontendUrl}`);
      logger.info(`🗄️  数据库: ${env.databaseUrl.split('@')[1] || '已连接'}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
const shutdown = async () => {
  logger.info('正在关闭服务器...');

  // 这里可以添加清理逻辑，如断开数据库连接
  // await disconnectDatabase();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 启动服务器
if (require.main === module) {
  startServer();
}

export default app;
