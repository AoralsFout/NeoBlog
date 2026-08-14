import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import type { Article, PaginatedArticles } from '../types/article';

// 列表查询用到的文章字段（不含正文，减小响应体积）
const LIST_FIELDS = {
  id: true,
  title: true,
  summary: true,
  cover_image: true,
  tags: true,
  views: true,
  author_id: true,
  created_at: true,
  updated_at: true,
};

class ArticleService {
  async getArticles(
    page: number = 1,
    limit: number = 5,
    sortBy: 'hot' | 'time' = 'time',
    tag?: string
  ): Promise<PaginatedArticles> {
    try {
      const skip = (page - 1) * limit;

      if (sortBy === 'hot') {
        return this.getArticlesByHot(page, limit, skip, tag);
      }

      const where: any = {};
      if (tag) {
        where.tags = { contains: tag };
      }

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          select: LIST_FIELDS,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.article.count({ where }),
      ]);

      const articlesWithAuthors = await this.enrichAuthors(articles);

      return {
        articles: articlesWithAuthors,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('获取文章列表失败:', error);
      throw new Error(`获取文章列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async getArticlesByHot(
    page: number,
    limit: number,
    skip: number,
    tag?: string
  ): Promise<PaginatedArticles> {
    // 使用参数化查询，防止SQL注入；LIMIT/OFFSET为数字，由Prisma安全内联
    const tagFilter = tag
      ? Prisma.sql`WHERE a.tags LIKE ${`%${tag}%`}`
      : Prisma.empty;

    const countResult = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) as total FROM articles a ${tagFilter}
    `;
    const total = Number(countResult[0]?.total ?? 0);

    const articles = await prisma.$queryRaw<any[]>`
      SELECT a.id, a.title, a.summary, a.cover_image, a.tags, a.views, a.author_id,
             a.created_at, a.updated_at,
             COUNT(c.id) as comment_count, (a.views + COUNT(c.id)) as hot_score
      FROM articles a
      LEFT JOIN comments c ON c.source_id = CAST(a.id AS CHAR) COLLATE utf8mb4_unicode_ci
        AND c.source_type = 'article'
      ${tagFilter}
      GROUP BY a.id
      ORDER BY hot_score DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const articlesWithAuthors = await this.enrichAuthors(articles);

    return {
      articles: articlesWithAuthors,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getArticleById(id: number, incrementView: boolean = true): Promise<Article | null> {
    try {
      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) return null;

      // 浏览计数：编辑器等场景可传入 false 跳过
      if (incrementView) {
        await prisma.article.update({
          where: { id },
          data: { views: { increment: 1 } },
        });
      }

      const commentCount = await prisma.comment.count({
        where: { source_id: String(id), source_type: 'article' },
      });

      const author = await prisma.user.findUnique({
        where: { id: article.author_id },
        select: { id: true, username: true, avatar: true },
      });

      return {
        ...article,
        views: incrementView ? article.views + 1 : article.views,
        comment_count: commentCount,
        author: author || undefined,
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at.toISOString(),
      } as Article;
    } catch (error) {
      logger.error(`获取文章详情失败 (ID: ${id}):`, error);
      throw new Error(`获取文章详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async getTopArticles(limit: number = 3): Promise<Article[]> {
    try {
      const articles = await prisma.$queryRaw<any[]>`
        SELECT a.id, a.title, a.summary, a.cover_image, a.tags, a.views, a.author_id,
               a.created_at, a.updated_at,
               COUNT(c.id) as comment_count, (a.views + COUNT(c.id)) as hot_score
        FROM articles a
        LEFT JOIN comments c ON c.source_id = CAST(a.id AS CHAR) COLLATE utf8mb4_unicode_ci
          AND c.source_type = 'article'
        GROUP BY a.id
        ORDER BY hot_score DESC
        LIMIT ${limit}
      `;

      return this.enrichAuthors(articles);
    } catch (error) {
      logger.error('获取热门文章失败:', error);
      return [];
    }
  }

  async createArticle(data: {
    title: string;
    content: string;
    summary?: string;
    cover_image?: string;
    tags?: string;
  }, userId: number): Promise<Article> {
    try {
      const article = await prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          summary: data.summary || null,
          cover_image: data.cover_image || null,
          tags: data.tags || null,
          author_id: userId,
        },
      });

      const author = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, avatar: true },
      });

      return {
        ...article,
        views: article.views,
        comment_count: 0,
        author: author || undefined,
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at.toISOString(),
      } as Article;
    } catch (error) {
      logger.error('创建文章失败:', error);
      throw new Error(`创建文章失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async updateArticle(id: number, data: {
    title?: string;
    content?: string;
    summary?: string;
    cover_image?: string;
    tags?: string;
  }): Promise<Article | null> {
    try {
      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) return null;

      const article = await prisma.article.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.summary !== undefined && { summary: data.summary }),
          ...(data.cover_image !== undefined && { cover_image: data.cover_image }),
          ...(data.tags !== undefined && { tags: data.tags }),
        },
      });

      const author = await prisma.user.findUnique({
        where: { id: article.author_id },
        select: { id: true, username: true, avatar: true },
      });

      return {
        ...article,
        author: author || undefined,
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at.toISOString(),
      } as Article;
    } catch (error) {
      logger.error(`更新文章失败 (ID: ${id}):`, error);
      throw new Error(`更新文章失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) return false;

      // 在事务中先清理关联评论（source_id为字符串，无外键级联），再删除文章
      await prisma.$transaction([
        prisma.comment.deleteMany({
          where: { source_id: String(id), source_type: 'article' },
        }),
        prisma.article.delete({ where: { id } }),
      ]);

      return true;
    } catch (error) {
      logger.error(`删除文章失败 (ID: ${id}):`, error);
      throw new Error(`删除文章失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async enrichAuthors(articles: any[]): Promise<Article[]> {
    if (articles.length === 0) return [];

    const authorIds = [...new Set(articles.map((a) => a.author_id))];
    const users = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, username: true, avatar: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      ...(a.content !== undefined && { content: a.content }),
      summary: a.summary,
      cover_image: a.cover_image,
      tags: a.tags,
      views: a.views,
      author_id: a.author_id,
      author: userMap.get(a.author_id) || undefined,
      comment_count: typeof a.comment_count === 'bigint' ? Number(a.comment_count) : (a.comment_count || 0),
      created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
      updated_at: a.updated_at instanceof Date ? a.updated_at.toISOString() : a.updated_at,
    }));
  }
}

export default new ArticleService();
