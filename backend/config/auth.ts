import { env } from './env';

// JWT配置
export const jwtConfig = {
  secret: env.jwtSecret,
  expiresIn: env.jwtExpiresIn,
  algorithm: 'HS256' as const,
};

// OAuth配置
export const oauthConfig = {
  clientId: env.clientId,
  clientSecret: env.clientSecret,
  authorizationUrl: env.authorizationUrl,
  tokenUrl: env.tokenUrl,
  userInfoUrl: env.userInfoUrl,
  redirectUri: `${env.backendUrl}/api/auth/natayark/callback`,
  scope: '', // Natayark OAuth不需要scope
};

// 会话配置（如果使用express-session）
export const sessionConfig = {
  secret: env.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  },
};

// CORS配置
export const corsConfig = {
  origin: env.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200,
};

// 速率限制配置
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
};