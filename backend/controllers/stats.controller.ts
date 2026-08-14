import { Request, Response } from 'express';
import statsService from '../services/stats.service';
import logger from '../utils/logger';

/**
 * 获取站点统计信息
 */
export const getSiteStats = async (_req: Request, res: Response) => {
  try {
    const stats = await statsService.getSiteStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取站点统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_FAILED',
        message: error instanceof Error ? error.message : '获取站点统计失败',
      },
    });
  }
};

/**
 * 获取标签云
 */
export const getTagCloud = async (_req: Request, res: Response) => {
  try {
    const tags = await statsService.getTagCloud();
    res.json({ success: true, data: tags });
  } catch (error) {
    logger.error('获取标签云失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TAGS_FAILED',
        message: error instanceof Error ? error.message : '获取标签云失败',
      },
    });
  }
};
