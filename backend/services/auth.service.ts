import { User, Role, Status } from '../types/user';
import prisma from '../config/database';
import oauthService from './oauth.service';
import { generateToken, JwtPayload } from '../utils/jwt';
import logger from '../utils/logger';
import { NatayarkUser } from './oauth.service';

// 认证服务类
class AuthService {
  /**
   * 处理OAuth回调
   * @param code 授权码
   * @param state state参数
   * @param originalState 原始state
   * @returns 用户和JWT令牌
   */
  async handleOAuthCallback(code: string, state: string, originalState: string): Promise<{ user: User; token: string }> {
    try {
      // 验证state
      if (!oauthService.validateState(state, originalState)) {
        throw new Error('无效的state参数');
      }

      // 交换令牌
      const accessToken = await oauthService.exchangeCodeForToken(code);

      // 获取用户信息
      const natayarkUser = await oauthService.getUserInfo(accessToken);

      // 查找或创建用户
      const user = await this.findOrCreateUser(natayarkUser);

      // 更新最后登录时间
      await this.updateLastLogin(user.id);

      // 生成JWT令牌
      const token = this.generateUserToken(user);

      logger.info('用户登录成功:', { userId: user.id, username: user.username });

      return { user, token };
    } catch (error) {
      logger.error('OAuth回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 查找或创建用户
   * @param natayarkUser Natayark用户信息
   * @returns 用户
   */
  async findOrCreateUser(natayarkUser: NatayarkUser): Promise<User> {
    const userFields = oauthService.mapToUserFields(natayarkUser);

    try {
      // 查找现有用户
      let user = await prisma.user.findUnique({
        where: { natayark_id: natayarkUser.id },
      });

      if (!user) {
        // 创建新用户
        user = await prisma.user.create({
          data: userFields,
        });
        logger.info('创建新用户:', { userId: user.id, username: user.username });
      } else {
        // 更新用户信息（如果需要）
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            username: userFields.username,
            email: userFields.email,
            avatar: userFields.avatar || user.avatar,
            updated_at: new Date(),
          },
        });
        logger.info('更新用户信息:', { userId: user.id });
      }

      // 转换为User类型
      return this.mapPrismaUserToUser(user);
    } catch (error) {
      logger.error('查找或创建用户失败:', error);
      throw new Error(`用户处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新最后登录时间
   * @param userId 用户ID
   */
  async updateLastLogin(userId: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { last_login: new Date() },
      });
    } catch (error) {
      logger.error('更新最后登录时间失败:', error);
      // 不抛出错误，因为这不是关键操作
    }
  }

  /**
   * 生成用户JWT令牌
   * @param user 用户
   * @returns JWT令牌
   */
  generateUserToken(user: User): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      natayarkId: user.natayark_id,
      username: user.username,
      role: user.role,
    };

    return generateToken(payload);
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 用户ID或null
   */
  async verifyUserToken(token: string): Promise<number | null> {
    const payload = await Promise.resolve().then(() => {
      // 这里使用同步验证，因为verifyToken是同步的
      const result = require('../utils/jwt').verifyToken(token);
      return result;
    });

    if (!payload) {
      return null;
    }

    // 检查用户是否存在且状态正常
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true },
    });

    if (!user || user.status !== 'NORMAL') {
      return null;
    }

    return payload.userId;
  }

  /**
   * 获取用户信息（合并Natayark和数据库数据）
   * @param userId 用户ID
   * @returns 合并后的用户信息
   */
  async getUserProfile(userId: number): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 这里可以添加从Natayark获取最新信息的逻辑
    // 目前只返回数据库信息
    return this.mapPrismaUserToUser(user);
  }

  /**
   * 将Prisma用户转换为User类型
   * @param prismaUser Prisma用户对象
   * @returns User类型
   */
  private mapPrismaUserToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      natayark_id: prismaUser.natayark_id,
      username: prismaUser.username,
      email: prismaUser.email,
      avatar: prismaUser.avatar || '',
      role: prismaUser.role.toLowerCase() as Role,
      created_at: prismaUser.created_at.toISOString(),
      updated_at: prismaUser.updated_at.toISOString(),
      status: prismaUser.status.toLowerCase() as Status,
    };
  }
}

export default new AuthService();