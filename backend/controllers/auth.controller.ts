import { Request, Response } from 'express';
import { authService, oauthService } from '../services';
import { generateState } from '../utils/hash';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import logger from '../utils/logger';
import { env } from '../config/env';

// 存储临时的state
const stateStore = new Map<string, { state: string; timestamp: number }>();

// 清理过期的state（每5分钟清理一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10分钟过期
      stateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * 重定向到Natayark OAuth授权页面
 */
export const redirectToOAuth = (req: Request, res: Response) => {
  try {
    const state = generateState();
    const authorizationUrl = oauthService.getAuthorizationUrl(state);

    // 存储state
    stateStore.set(state, { state, timestamp: Date.now() });

    logger.info('重定向到OAuth授权页面:' + authorizationUrl, { state });

    res.redirect(authorizationUrl);
  } catch (error) {
    logger.error('重定向到OAuth失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_REDIRECT_FAILED',
        message: '重定向到OAuth失败',
      },
    });
  }
};

/**
 * 处理OAuth回调
 */
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '缺少必要的参数: code 或 state',
        },
      });
    }

    // 验证state
    const storedState = stateStore.get(state);
    if (!storedState) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: '无效的state参数',
        },
      });
    }

    // 使用后删除state
    stateStore.delete(state);

    // 处理OAuth回调
    const { user, token } = await authService.handleOAuthCallback(code, state, storedState.state);

    logger.info('OAuth回调处理成功:', { userId: user.id });

    // 重定向到前端，携带令牌
    const redirectUrl = new URL(env.frontendUrl + '/auth/callback');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user_id', user.id.toString());

    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('OAuth回调处理失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_CALLBACK_FAILED',
        message: error instanceof Error ? error.message : 'OAuth回调处理失败',
      },
    });
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 从请求头提取令牌
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌',
        },
      });
    }

    // 验证令牌
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌',
        },
      });
    }

    // 获取用户信息
    const user = await authService.getUserProfile(payload.userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('获取当前用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_FAILED',
        message: error instanceof Error ? error.message : '获取用户信息失败',
      },
    });
  }
};

/**
 * 用户登出
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // 从请求头提取令牌
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌',
        },
      });
    }

    // 验证令牌
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌',
        },
      });
    }

    logger.info('用户登出:', { userId: payload.userId });

    res.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    logger.error('用户登出失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: error instanceof Error ? error.message : '登出失败',
      },
    });
  }
};