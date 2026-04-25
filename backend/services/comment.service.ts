import prisma from '../config/database';
import logger from '../utils/logger';
import type { Comment, PaginatedComments, Reaction } from '../types/comment';

class CommentService {
  /**
   * 获取评论列表（分页、支持排序）
   */
  async getComments(
    sourceId: string,
    sourceType: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'hot' | 'time' = 'time',
    currentUserId?: number
  ): Promise<PaginatedComments> {
    try {
      const skip = (page - 1) * limit;

      const orderBy = sortBy === 'hot'
        ? [{ likes_count: 'desc' as const }, { created_at: 'desc' as const }]
        : [{ created_at: 'desc' as const }];

      // 只查顶级评论（parent_id IS NULL）
      const where = {
        source_id: sourceId,
        source_type: sourceType,
        parent_id: null,
      };

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
            replies: {
              orderBy: { created_at: 'asc' },
              include: {
                user: {
                  select: { id: true, username: true, avatar: true },
                },
                reactions: currentUserId
                  ? { where: { user_id: currentUserId }, select: { type: true } }
                  : false,
              },
            },
            reactions: currentUserId
              ? { where: { user_id: currentUserId }, select: { type: true } }
              : false,
          },
        }),
        prisma.comment.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const mapped = comments.map((c) => this.mapComment(c, currentUserId));

      return {
        comments: mapped,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      logger.error('获取评论列表失败:', error);
      throw new Error(`获取评论列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建评论
   */
  async createComment(
    userId: number,
    content: string,
    sourceId: string,
    sourceType: string,
    parentId?: number
  ): Promise<Comment> {
    try {
      // 如果是回复，检查父评论是否存在且属于同一来源
      if (parentId) {
        const parent = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, source_id: true, source_type: true, parent_id: true },
        });

        if (!parent) {
          throw new Error('父评论不存在');
        }
        if (parent.source_id !== sourceId || parent.source_type !== sourceType) {
          throw new Error('父评论不属于该来源');
        }
        // 只允许一层嵌套，回复的回复直接挂在顶级评论下
        if (parent.parent_id !== null) {
          parentId = parent.parent_id;
        }
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          source_id: sourceId,
          source_type: sourceType,
          user_id: userId,
          parent_id: parentId ?? null,
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      return this.mapComment(comment, userId);
    } catch (error) {
      logger.error('创建评论失败:', error);
      throw error instanceof Error ? error : new Error('创建评论失败');
    }
  }

  /**
   * 切换点赞/点踩
   */
  async toggleReaction(
    commentId: number,
    userId: number,
    type: Reaction
  ): Promise<{ likes_count: number; dislikes_count: number; user_reaction: Reaction | null }> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true },
      });

      if (!comment) {
        throw new Error('评论不存在');
      }

      // 检查已有的 reaction
      const existing = await prisma.commentReaction.findUnique({
        where: {
          comment_id_user_id: {
            comment_id: commentId,
            user_id: userId,
          },
        },
      });

      if (existing) {
        if (existing.type === type.toUpperCase()) {
          // 相同操作 -> 取消
          await prisma.commentReaction.delete({
            where: { id: existing.id },
          });

          await this.updateReactionCounts(commentId);
        } else {
          // 切换类型
          await prisma.commentReaction.update({
            where: { id: existing.id },
            data: { type: type.toUpperCase() as any },
          });

          await this.updateReactionCounts(commentId);
        }
      } else {
        // 新增
        await prisma.commentReaction.create({
          data: {
            comment_id: commentId,
            user_id: userId,
            type: type.toUpperCase() as any,
          },
        });

        await this.updateReactionCounts(commentId);
      }

      // 返回最新状态
      const updated = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likes_count: true, dislikes_count: true },
      });

      const userReaction = await prisma.commentReaction.findUnique({
        where: { comment_id_user_id: { comment_id: commentId, user_id: userId } },
        select: { type: true },
      });

      return {
        likes_count: updated!.likes_count,
        dislikes_count: updated!.dislikes_count,
        user_reaction: userReaction ? (userReaction.type.toLowerCase() as Reaction) : null,
      };
    } catch (error) {
      logger.error('操作评论反应失败:', error);
      throw error instanceof Error ? error : new Error('操作评论反应失败');
    }
  }

  /**
   * 更新评论的点赞/点踩计数
   */
  private async updateReactionCounts(commentId: number): Promise<void> {
    const [likes, dislikes] = await Promise.all([
      prisma.commentReaction.count({
        where: { comment_id: commentId, type: 'LIKE' },
      }),
      prisma.commentReaction.count({
        where: { comment_id: commentId, type: 'DISLIKE' },
      }),
    ]);

    await prisma.comment.update({
      where: { id: commentId },
      data: { likes_count: likes, dislikes_count: dislikes },
    });
  }

  /**
   * 映射评论数据
   */
  private mapComment(prismaComment: any, currentUserId?: number): Comment {
    const userReaction = prismaComment.reactions?.length
      ? (prismaComment.reactions[0].type.toLowerCase() as Reaction)
      : null;

    const replies = prismaComment.replies
      ? prismaComment.replies.map((r: any) => {
          const replyReaction = r.reactions?.length
            ? (r.reactions[0].type.toLowerCase() as Reaction)
            : null;
          return {
            id: r.id,
            content: r.content,
            source_id: r.source_id,
            source_type: r.source_type,
            user_id: r.user_id,
            parent_id: r.parent_id,
            likes_count: r.likes_count,
            dislikes_count: r.dislikes_count,
            created_at: r.created_at.toISOString(),
            updated_at: r.updated_at.toISOString(),
            user: r.user,
            user_reaction: replyReaction,
            replies: [],
          } satisfies Comment;
        })
      : undefined;

    return {
      id: prismaComment.id,
      content: prismaComment.content,
      source_id: prismaComment.source_id,
      source_type: prismaComment.source_type,
      user_id: prismaComment.user_id,
      parent_id: prismaComment.parent_id,
      likes_count: prismaComment.likes_count,
      dislikes_count: prismaComment.dislikes_count,
      created_at: prismaComment.created_at.toISOString(),
      updated_at: prismaComment.updated_at.toISOString(),
      user: prismaComment.user,
      user_reaction: userReaction,
      replies,
    };
  }
}

export default new CommentService();
