import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'CLIENT_ID',
  'CLIENT_SECRET',
  'JWT_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'NODE_ENV',
];

// 验证必需的环境变量
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`环境变量 ${envVar} 未设置`);
  }
}

// 环境变量类型定义
export const env = {
  // 数据库
  databaseUrl: process.env.DATABASE_URL!,

  // Natayark OAuth
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  authorizationUrl: process.env.NATAYARK_AUTHORIZATION_URL || 'https://account.naids.com/oauth2/authorize',
  tokenUrl: process.env.NATAYARK_TOKEN_URL || 'https://account.naids.com/api/oauth2/token',
  userInfoUrl: process.env.NATAYARK_USERINFO_URL || 'https://account.naids.com/api/api/user/data',

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // 应用配置
  frontendUrl: process.env.FRONTEND_URL!,
  backendUrl: process.env.BACKEND_URL!,
  nodeEnv: process.env.NODE_ENV! as 'development' | 'production' | 'test',

  // 其他
  port: parseInt(process.env.PORT || '3001', 10),
};

// 导出类型
export type EnvConfig = typeof env;