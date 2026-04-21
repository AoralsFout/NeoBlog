import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import logger from '../utils/logger';

/**
 * 健康检查端点
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkDatabaseConnection();

    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // 如果数据库不健康，返回503
    if (!dbStatus) {
      healthInfo.status = 'unhealthy';
      return res.status(503).json({
        success: false,
        data: healthInfo,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: '数据库服务不可用',
        },
      });
    }

    res.json({
      success: true,
      data: healthInfo,
    });
  } catch (error) {
    logger.error('健康检查失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: '健康检查失败',
      },
    });
  }
};

/**
 * 系统信息端点
 */
export const systemInfo = (req: Request, res: Response) => {
  const info = {
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
  };

  res.json({
    success: true,
    data: info,
  });
};

/**
 * 路由列表端点
 */
export const listRoutes = (req: Request, res: Response) => {
  const routes = [
    {
      method: 'GET',
      path: '/api/health',
      description: '健康检查',
    },
    {
      method: 'GET',
      path: '/api/system',
      description: '系统信息',
    },
    {
      method: 'GET',
      path: '/api/auth/natayark',
      description: '重定向到Natayark OAuth',
    },
    {
      method: 'GET',
      path: '/api/auth/natayark/callback',
      description: 'OAuth回调处理',
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      description: '获取当前用户信息',
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      description: '用户登出',
    },
    {
      method: 'GET',
      path: '/api/users',
      description: '获取用户列表（管理员）',
    },
    {
      method: 'GET',
      path: '/api/users/:id',
      description: '获取指定用户信息',
    },
    {
      method: 'PATCH',
      path: '/api/users/:id',
      description: '更新用户信息',
    },
    {
      method: 'GET',
      path: '/api/users/search',
      description: '搜索用户（管理员）',
    },
    {
      method: 'GET',
      path: '/api/music/getMusicList',
      description: '获取音乐列表',
    },
  ];

  res.json({
    success: true,
    data: routes,
  });
};