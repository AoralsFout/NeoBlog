import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, JwtPayload } from '../utils/jwt';
import { parseCookies } from '../utils/cookie';
import { AUTH_COOKIE_NAME } from '../config/auth';
import prisma from '../config/database';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 认证中间件：
 * 1. 从 Authorization Bearer 头或 HttpOnly Cookie 中提取令牌
 * 2. 验证签名
 * 3. 校验用户存在、状态正常、令牌版本匹配（登出/降权立即生效）
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = parseCookies(req.headers.cookie)[AUTH_COOKIE_NAME];
    const token = extractTokenFromHeader(req.headers.authorization) ?? cookieToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: '无效的认证令牌' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, status: true, token_version: true },
    });

    if (!user || user.status !== 'NORMAL') {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_DISABLED', message: '用户不存在或已被禁用' },
      });
    }

    if (user.token_version !== payload.tv) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REVOKED', message: '认证令牌已失效，请重新登录' },
      });
    }

    // 以数据库中的最新角色为准（防止令牌中的角色过期）
    req.user = {
      ...payload,
      role: user.role.toLowerCase(),
    };
    next();
  } catch (error) {
    logger.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: '认证过程发生错误' },
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: '需要管理员权限' },
    });
  }
  next();
};
