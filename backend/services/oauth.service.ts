import axios from 'axios';
import { env } from '../config/env';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

// Natayark用户信息接口
export interface NatayarkUser {
  id: number;
  username: string;
  email: string;
  realname: boolean;
  last_login: string | null;
  last_ip: string;
  regtime: string;
  status: number;
  // 其他可能字段
}

// 令牌响应接口
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

// OAuth服务类
class OAuthService {
  /**
   * 生成授权URL
   * @param state CSRF state参数
   * @returns 授权URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.clientId,
      redirect_uri: `${env.backendUrl}/api/auth/natayark/callback`,
      state,
    });

    return `${env.authorizationUrl}?${params.toString()}`;
  }

  /**
   * 交换授权码获取访问令牌
   * @param code 授权码
   * @returns 访问令牌
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      // 根据文档要求，需要对client_secret进行PASSWORD_HASH
      const hashedClientSecret = await hashPassword(env.clientSecret);

      const data = {
        grant_type: 'authorization_code',
        code,
        client_id: env.clientId,
        client_secret: hashedClientSecret,
        redirect_uri: `${env.backendUrl}/api/auth/natayark/callback`,
      };

      logger.info('交换授权码获取令牌:', { code, clientId: env.clientId });

      const response = await axios.post<TokenResponse>(env.tokenUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.data.access_token) {
        throw new Error('未收到访问令牌');
      }

      return response.data.access_token;
    } catch (error) {
      logger.error('交换授权码失败:', error);
      throw new Error(`获取访问令牌失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户信息
   * @param accessToken 访问令牌
   * @returns Natayark用户信息
   */
  async getUserInfo(accessToken: string): Promise<NatayarkUser> {
    try {
      const response = await axios.get(env.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.code !== 200 || !response.data.data) {
        throw new Error(`Natayark API错误: ${response.data.msg || '未知错误'}`);
      }

      return response.data.data;
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      throw new Error(`获取用户信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证state参数（防止CSRF）
   * @param receivedState 接收到的state
   * @param originalState 原始state
   * @returns 是否有效
   */
  validateState(receivedState: string, originalState: string): boolean {
    return receivedState === originalState;
  }

  /**
   * 将Natayark用户信息映射到数据库用户字段
   * @param natayarkUser Natayark用户信息
   * @returns 数据库用户字段
   */
  mapToUserFields(natayarkUser: NatayarkUser) {
    return {
      natayark_id: natayarkUser.id,
      username: natayarkUser.username,
      email: natayarkUser.email,
      avatar: '', // Natayark可能不提供头像，使用默认
      role: 'MEMBER' as const,
      status: 'NORMAL' as const,
    };
  }
}

export default new OAuthService();