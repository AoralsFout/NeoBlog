import { User } from '../types/user';
import prisma from '../config/database';
import logger from '../utils/logger';
import { toApiUser, toDbRole, toDbStatus } from '../mappers/user';

// 用户服务类
class UserService {
  /**
   * 根据ID获取用户
   * @param userId 用户ID
   * @returns 用户或null
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return toApiUser(user);
    } catch (error) {
      logger.error('获取用户失败:', error);
      throw new Error(`获取用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据natayark_id获取用户
   * @param natayarkId Natayark用户ID
   * @returns 用户或null
   */
  async getUserByNatayarkId(natayarkId: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { natayark_id: natayarkId },
      });

      if (!user) {
        return null;
      }

      return toApiUser(user);
    } catch (error) {
      logger.error('根据natayark_id获取用户失败:', error);
      throw new Error(`获取用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取所有用户（分页）
   * @param page 页码
   * @param limit 每页数量
   * @returns 用户列表和总数
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.user.count(),
      ]);

      return {
        users: users.map(user => toApiUser(user)),
        total,
      };
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      throw new Error(`获取用户列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新用户信息
   * @param userId 用户ID
   * @param data 更新数据
   * @returns 更新后的用户
   */
  async updateUser(userId: number, data: Partial<Omit<User, 'id' | 'natayark_id' | 'created_at'>>): Promise<User> {
    try {
      // role / status 的方向转换集中在 mappers/user，此处不再手工 toUpperCase。
      // 使用真值判断以保持与历史行为一致（API role/status 均为非空字符串）。
      const { role, status, ...rest } = data;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...rest,
          ...(role && { role: toDbRole(role) as any }),
          ...(status && { status: toDbStatus(status) as any }),
          updated_at: new Date(),
        },
      });

      return toApiUser(user);
    } catch (error: any) {
      logger.error('更新用户失败:', error);
      // 邮箱唯一约束冲突
      if (error?.code === 'P2002') {
        throw new Error('该邮箱已被其他用户使用');
      }
      throw new Error(`更新用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新用户头像
   * @param userId 用户ID
   * @param avatarUrl 头像URL
   * @returns 更新后的用户
   */
  async updateUserAvatar(userId: number, avatarUrl: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: avatarUrl,
          updated_at: new Date(),
        },
      });

      return toApiUser(user);
    } catch (error) {
      logger.error('更新用户头像失败:', error);
      throw new Error(`更新用户头像失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除用户（软删除或硬删除）
   * @param userId 用户ID
   * @param hardDelete 是否硬删除
   */
  async deleteUser(userId: number, hardDelete: boolean = false): Promise<void> {
    try {
      if (hardDelete) {
        await prisma.user.delete({
          where: { id: userId },
        });
        logger.info('硬删除用户:', { userId });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: {
            status: 'BANNED',
            updated_at: new Date(),
          },
        });
        logger.info('软删除用户（标记为BANNED）:', { userId });
      }
    } catch (error) {
      logger.error('删除用户失败:', error);
      throw new Error(`删除用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 搜索用户
   * @param query 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 用户列表和总数
   */
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query } },
              { email: { contains: query } },
            ],
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.user.count({
          where: {
            OR: [
              { username: { contains: query } },
              { email: { contains: query } },
            ],
          },
        }),
      ]);

      return {
        users: users.map(user => toApiUser(user)),
        total,
      };
    } catch (error) {
      logger.error('搜索用户失败:', error);
      throw new Error(`搜索用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export default new UserService();