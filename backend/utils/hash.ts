import bcrypt from 'bcrypt';

/**
 * 哈希密码（用于client_secret的PASSWORD_HASH）
 * @param plainText 明文
 * @returns 哈希后的字符串
 */
export const hashPassword = async (plainText: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(plainText, saltRounds)
};

/**
 * 验证密码
 * @param plainText 明文
 * @param hash 哈希值
 * @returns 是否匹配
 */
export const verifyPassword = async (plainText: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plainText, hash);
};

/**
 * 生成随机state参数（用于OAuth CSRF防护）
 * @returns 随机字符串
 */
export const generateState = (): string => {
  return bcrypt.genSaltSync(10).replace(/\//g, '_').replace(/\./g, '_');
};

/**
 * 生成随机令牌
 * @param length 长度
 * @returns 随机字符串
 */
export const generateRandomToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};