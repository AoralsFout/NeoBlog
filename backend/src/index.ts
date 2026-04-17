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

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
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
app.get('/api/system', systemInfo);
app.get('/api/routes', listRoutes);

// 认证路由
app.get('/api/auth/natayark', redirectToOAuth);
app.get('/api/auth/natayark/callback', handleOAuthCallback);
app.get('/api/auth/me', getCurrentUser);
app.post('/api/auth/logout', logout);

// 用户路由
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUserById);
app.patch('/api/users/:id', updateUser);
app.get('/api/users/search', searchUsers);

// 文件上传路由
app.post('/api/upload', uploadFile);
app.post('/api/upload/avatar', uploadAvatar);
app.delete('/api/upload', deleteUploadedFile);

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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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