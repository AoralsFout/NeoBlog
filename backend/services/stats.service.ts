import prisma from '../config/database';
import logger from '../utils/logger';

// 站点统计与标签聚合服务
class StatsService {
  /**
   * 获取站点统计信息
   */
  async getSiteStats() {
    try {
      const [articleCount, viewAgg, commentCount, firstArticle] = await Promise.all([
        prisma.article.count(),
        prisma.article.aggregate({ _sum: { views: true } }),
        prisma.comment.count(),
        prisma.article.findFirst({
          orderBy: { created_at: 'asc' },
          select: { created_at: true },
        }),
      ]);

      return {
        articles: articleCount,
        views: viewAgg._sum.views ?? 0,
        comments: commentCount,
        first_article_at: firstArticle ? firstArticle.created_at.toISOString() : null,
      };
    } catch (error) {
      logger.error('获取站点统计失败:', error);
      throw new Error(`获取站点统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取标签云（标签名 + 出现次数，按次数降序）
   */
  async getTagCloud(): Promise<{ name: string; count: number }[]> {
    try {
      const articles = await prisma.article.findMany({
        select: { tags: true },
      });

      const countMap = new Map<string, number>();
      for (const article of articles) {
        if (!article.tags) continue;
        for (const raw of article.tags.split(',')) {
          const name = raw.trim();
          if (name) {
            countMap.set(name, (countMap.get(name) ?? 0) + 1);
          }
        }
      }

      return [...countMap.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('获取标签云失败:', error);
      throw new Error(`获取标签云失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export default new StatsService();
