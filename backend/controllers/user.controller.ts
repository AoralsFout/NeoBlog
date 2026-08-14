import { Request, Response } from 'express';
import { userService } from '../services';
import { validateRequest, validateIdParam, validatePagination } from '../utils/validator';
import logger from '../utils/logger';

/**
 * 获取用户列表（需要管理员权限，通过中间件校验）
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    // 获取分页参数
    const { page, limit } = validatePagination(req.query.page as string, req.query.limit as string);

    // 获取用户列表
    const { users, total } = await userService.getUsers(page, limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USERS_FAILED',
        message: error instanceof Error ? error.message : '获取用户列表失败',
      },
    });
  }
};

/**
 * 获取指定用户信息（需通过authenticate中间件）
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // 验证用户ID参数
    const userId = validateIdParam(req.params.id as string);
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的用户ID',
        },
      });
    }

    // 检查权限（只能查看自己的信息，除非是管理员）
    if (req.user!.userId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权查看其他用户信息',
        },
      });
    }

    // 获取用户信息
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
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
 * 更新用户信息（需通过authenticate中间件 + userUpdateValidationRules）
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    // 验证用户ID参数
    const userId = validateIdParam(req.params.id as string);
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '无效的用户ID',
        },
      });
    }

    // 检查权限（只能更新自己的信息，除非是管理员）
    if (req.user!.userId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权更新其他用户信息',
        },
      });
    }

    // 验证请求数据
    const validationError = validateRequest(req);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求数据验证失败',
          details: validationError,
        },
      });
    }

    // 更新用户信息
    const { username, email, avatar, role, status } = req.body;
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (avatar) {
      updateData.avatar = avatar;
    }
    if (role !== undefined && req.user!.role === 'admin') {
      // 角色必须为合法枚举值
      if (!['admin', 'member'].includes(String(role).toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '无效的角色值，必须为 admin 或 member' },
        });
      }
      updateData.role = String(role).toLowerCase();
    }
    if (status !== undefined && req.user!.role === 'admin') {
      // 状态必须为合法枚举值
      if (!['normal', 'banned', 'frozen'].includes(String(status).toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '无效的状态值，必须为 normal、banned 或 frozen' },
        });
      }
      updateData.status = String(status).toLowerCase();
    }

    const user = await userService.updateUser(userId, updateData);

    logger.info('更新用户信息:', { userId, updatedBy: req.user!.userId });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('更新用户信息失败:', error);
    // 邮箱唯一约束冲突
    if (error instanceof Error && error.message.includes('已被使用')) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_CONFLICT', message: error.message },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_USER_FAILED',
        message: error instanceof Error ? error.message : '更新用户信息失败',
      },
    });
  }
};

/**
 * 搜索用户（需要管理员权限，通过中间件校验）
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    // 兼容 query 与 q 两种参数名
    const { query, q } = req.query;
    const keyword = (typeof query === 'string' && query) || (typeof q === 'string' && q) || '';
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: '搜索关键词不能为空',
        },
      });
    }

    // 获取分页参数
    const { page, limit } = validatePagination(req.query.page as string, req.query.limit as string);

    // 搜索用户
    const { users, total } = await userService.searchUsers(keyword, page, limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('搜索用户失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_USERS_FAILED',
        message: error instanceof Error ? error.message : '搜索用户失败',
      },
    });
  }
};
