import { Request, Response } from 'express';
import commentService from '../services/comment.service';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import logger from '../utils/logger';

/**
 * 获取评论列表
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { source_id, source_type, page = '1', limit = '10', sort = 'time' } = req.query;

    if (!source_id || !source_type) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '缺少必要参数: source_id, source_type' },
      });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const sortBy = sort === 'hot' ? 'hot' : 'time';

    // 获取当前用户（可选）
    let currentUserId: number | undefined;
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        currentUserId = payload.userId;
      }
    }

    const result = await commentService.getComments(
      source_id as string,
      source_type as string,
      pageNum,
      limitNum,
      sortBy as 'hot' | 'time',
      currentUserId
    );

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('获取评论失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COMMENTS_FAILED',
        message: error instanceof Error ? error.message : '获取评论失败',
      },
    });
  }
};

/**
 * 创建评论
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
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

    const { content, source_id, source_type, parent_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '评论内容不能为空' },
      });
    }

    if (!source_id || !source_type) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '缺少必要参数: source_id, source_type' },
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: { code: 'CONTENT_TOO_LONG', message: '评论内容不能超过2000字' },
      });
    }

    const comment = await commentService.createComment(
      payload.userId,
      content.trim(),
      source_id as string,
      source_type as string,
      parent_id ? parseInt(parent_id as string, 10) : undefined
    );

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    logger.error('创建评论失败:', error);
    const status = error instanceof Error && error.message.includes('不存在') ? 404 : 500;
    res.status(status).json({
      success: false,
      error: {
        code: 'CREATE_COMMENT_FAILED',
        message: error instanceof Error ? error.message : '创建评论失败',
      },
    });
  }
};

/**
 * 切换点赞/点踩
 */
export const toggleReaction = async (req: Request, res: Response) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
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

    const commentId = parseInt(String(req.params.id), 10);
    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的评论ID' },
      });
    }

    const { type } = req.body;
    if (type !== 'like' && type !== 'dislike') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的反应类型，必须为 like 或 dislike' },
      });
    }

    const result = await commentService.toggleReaction(commentId, payload.userId, type);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('操作评论反应失败:', error);
    const status = error instanceof Error && error.message.includes('不存在') ? 404 : 500;
    res.status(status).json({
      success: false,
      error: {
        code: 'REACTION_FAILED',
        message: error instanceof Error ? error.message : '操作评论反应失败',
      },
    });
  }
};
