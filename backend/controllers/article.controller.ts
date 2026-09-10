import { Request, Response } from 'express';
import articleService from '../services/article.service';
import logger from '../utils/logger';

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '5', sort = 'time', tag } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 5));
    const sortBy = sort === 'hot' ? 'hot' : 'time';

    const tagStr = typeof tag === 'string' ? tag : undefined;
    const result = await articleService.getArticles(pageNum, limitNum, sortBy, tagStr);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GET_ARTICLES_FAILED', message: error instanceof Error ? error.message : '获取文章列表失败' },
    });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的文章ID' },
      });
    }

    // 纯读：浏览计数已拆到 POST /api/articles/:id/views
    const article = await articleService.getArticleById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '文章不存在' },
      });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    logger.error(`获取文章详情失败 (ID: ${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: { code: 'GET_ARTICLE_FAILED', message: error instanceof Error ? error.message : '获取文章详情失败' },
    });
  }
};

/**
 * 记录一次浏览（显式命令，替代此前挂在 GET 上的副作用）
 */
export const recordArticleView = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的文章ID' },
      });
    }

    const views = await articleService.recordView(id);
    if (views === null) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '文章不存在' },
      });
    }

    res.json({ success: true, data: { views } });
  } catch (error) {
    logger.error(`记录浏览失败 (ID: ${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: { code: 'RECORD_VIEW_FAILED', message: error instanceof Error ? error.message : '记录浏览失败' },
    });
  }
};

export const getTopArticles = async (_req: Request, res: Response) => {
  try {
    const articles = await articleService.getTopArticles(3);
    res.json({ success: true, data: articles });
  } catch (error) {
    logger.error('获取热门文章失败:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GET_TOP_ARTICLES_FAILED', message: error instanceof Error ? error.message : '获取热门文章失败' },
    });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, summary, cover_image, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '文章标题不能为空' },
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '文章内容不能为空' },
      });
    }

    const article = await articleService.createArticle(
      { title: title.trim(), content: content.trim(), summary, cover_image, tags },
      req.user!.userId
    );

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    logger.error('创建文章失败:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_ARTICLE_FAILED', message: error instanceof Error ? error.message : '创建文章失败' },
    });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的文章ID' },
      });
    }

    // 存在性检查改为轻量方法，不再取回整篇正文
    const exists = await articleService.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '文章不存在' },
      });
    }

    const { title, content, summary, cover_image, tags } = req.body;

    // 校验：更新时若提供了空标题/空内容则拒绝
    if (title !== undefined && (!title || !String(title).trim())) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '文章标题不能为空' },
      });
    }
    if (content !== undefined && (!content || !String(content).trim())) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '文章内容不能为空' },
      });
    }

    const article = await articleService.updateArticle(id, { title, content, summary, cover_image, tags });

    res.json({ success: true, data: article });
  } catch (error) {
    logger.error(`更新文章失败 (ID: ${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ARTICLE_FAILED', message: error instanceof Error ? error.message : '更新文章失败' },
    });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMS', message: '无效的文章ID' },
      });
    }

    // 存在性检查改为轻量方法，不再取回整篇正文
    const exists = await articleService.exists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '文章不存在' },
      });
    }

    await articleService.deleteArticle(id);
    res.json({ success: true, message: '文章已删除' });
  } catch (error) {
    logger.error(`删除文章失败 (ID: ${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_ARTICLE_FAILED', message: error instanceof Error ? error.message : '删除文章失败' },
    });
  }
};
