export * from './env';
export * from './database';
export * from './auth';

// 统一配置导出
import { env } from './env';
import prisma, { checkDatabaseConnection, disconnectDatabase } from './database';
import { jwtConfig, oauthConfig, sessionConfig, corsConfig, rateLimitConfig } from './auth';

export const config = {
  env,
  database: {
    prisma,
    checkConnection: checkDatabaseConnection,
    disconnect: disconnectDatabase,
  },
  auth: {
    jwt: jwtConfig,
    oauth: oauthConfig,
    session: sessionConfig,
    cors: corsConfig,
    rateLimit: rateLimitConfig,
  },
};