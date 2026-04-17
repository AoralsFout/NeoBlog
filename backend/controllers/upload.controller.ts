import { Request, Response } from 'express';
import { uploadSingle, getFileUrl, getRelativePath, deleteFile } from '../utils/upload';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { userService } from '../services';
import logger from '../utils/logger';

/**
 * 上传单个文件（如图片）
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    // 验证令牌
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

    // 使用中间件处理文件上传
    uploadSingle('file')(req, res, async (err: any) => {
      if (err) {
        logger.error('文件上传失败:', err);
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: err.message || '文件上传失败',
          },
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: '未选择文件',
          },
        });
      }

      // 生成文件URL
      const fileUrl = getFileUrl(req.file.path);
      const relativePath = getRelativePath(req.file.filename);

      logger.info('文件上传成功:', {
        userId: payload.userId,
        filename: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
      });

      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
          path: relativePath,
        },
      });
    });
  } catch (error) {
    logger.error('上传文件处理失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_PROCESS_FAILED',
        message: error instanceof Error ? error.message : '文件上传处理失败',
      },
    });
  }
};

/**
 * 上传用户头像
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    // 验证令牌
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

    // 使用中间件处理文件上传
    uploadSingle('avatar')(req, res, async (err: any) => {
      if (err) {
        logger.error('头像上传失败:', err);
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: err.message || '头像上传失败',
          },
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: '未选择头像文件',
          },
        });
      }

      // 生成相对路径和完整URL
      const relativePath = getRelativePath(req.file.filename);
      const avatarUrl = getFileUrl(relativePath);

      try {
        // 获取用户当前头像信息（用于删除旧头像）
        const currentUser = await userService.getUserById(payload.userId);
        const oldAvatar = currentUser?.avatar;

        // 更新用户头像（存储相对路径到数据库）
        const user = await userService.updateUserAvatar(payload.userId, relativePath);

        // 如果用户有旧头像且不是默认头像，删除旧头像文件
        if (oldAvatar && !oldAvatar.includes('default-avatar')) {
          try {
            await deleteFile(oldAvatar);
          } catch (deleteError) {
            logger.warn('删除旧头像失败:', deleteError);
            // 不阻止上传流程继续
          }
        }

        logger.info('用户头像更新成功:', {
          userId: payload.userId,
          oldAvatar: oldAvatar || '无',
          newAvatar: avatarUrl,
        });

        res.json({
          success: true,
          data: {
            user,
            fileInfo: {
              filename: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
              url: avatarUrl,
              path: relativePath,
            },
          },
        });
      } catch (serviceError) {
        // 如果服务失败，删除已上传的文件
        try {
          await deleteFile(req.file.path);
        } catch (deleteError) {
          logger.warn('清理上传的文件失败:', deleteError);
        }

        logger.error('更新用户头像失败:', serviceError);
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_AVATAR_FAILED',
            message: serviceError instanceof Error ? serviceError.message : '更新用户头像失败',
          },
        });
      }
    });
  } catch (error) {
    logger.error('上传头像处理失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AVATAR_PROCESS_FAILED',
        message: error instanceof Error ? error.message : '头像上传处理失败',
      },
    });
  }
};

/**
 * 删除文件
 */
export const deleteUploadedFile = async (req: Request, res: Response) => {
  try {
    // 验证令牌
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

    const { filepath } = req.body;
    if (!filepath) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILEPATH',
          message: '未提供文件路径',
        },
      });
    }

    // 检查权限：用户只能删除自己的文件
    // 这里可以根据业务需求添加更严格的权限检查
    await deleteFile(filepath);

    logger.info('文件删除成功:', {
      userId: payload.userId,
      filepath,
    });

    res.json({
      success: true,
      message: '文件删除成功',
    });
  } catch (error) {
    logger.error('删除文件失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FILE_FAILED',
        message: error instanceof Error ? error.message : '删除文件失败',
      },
    });
  }
};