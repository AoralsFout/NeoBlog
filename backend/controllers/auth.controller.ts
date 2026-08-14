import { Request, Response } from 'express';
import { authService, oauthService } from '../services';
import logger from '../utils/logger';
import { env } from '../config/env';
import { AUTH_COOKIE_NAME } from '../config/auth';

// 认证Cookie配置
const authCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  // 可选：跨子域共享Cookie时通过 COOKIE_DOMAIN 设置（如 .aoralsfout.top）
  ...(env.cookieDomain && { domain: env.cookieDomain }),
};

/**
 * 重定向到Natayark OAuth授权页面
 */
export const redirectToOAuth = (req: Request, res: Response) => {
  try {
    // 生成无状态state（HMAC签名，无需存储）
    const state = oauthService.generateState();
    const authorizationUrl = oauthService.getAuthorizationUrl(state);

    logger.info('重定向到OAuth授权页面');

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

    // 验证state（HMAC签名校验，防CSRF）
    if (!oauthService.validateState(state)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: '无效的state参数',
        },
      });
    }

    // 处理OAuth回调
    const { user, token } = await authService.handleOAuthCallback(code, state);

    logger.info('OAuth回调处理成功:', { userId: user.id });

    // 将令牌写入HttpOnly Cookie（不经过URL，避免泄露到日志/历史/Referer）
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    // 重定向到前端回调页
    const frontendBase = env.frontendUrl.replace(/\/$/, '');
    res.redirect(`${frontendBase}/auth/callback`);
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
 * 获取当前用户信息（需通过authenticate中间件）
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 获取用户信息
    const user = await authService.getUserProfile(req.user!.userId);

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
 * 用户登出（需通过authenticate中间件）
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 撤销该用户所有已签发令牌（token_version +1）
    await authService.revokeUserToken(userId);

    // 清除认证Cookie（与设置时的选项保持一致，包括domain）
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      ...(env.cookieDomain && { domain: env.cookieDomain }),
    });

    logger.info('用户登出:', { userId });

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
