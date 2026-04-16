export * from './auth.controller';
export * from './user.controller';
export * from './health.controller';

// 统一控制器导出
import * as authController from './auth.controller';
import * as userController from './user.controller';
import * as healthController from './health.controller';

export const controllers = {
  auth: authController,
  user: userController,
  health: healthController,
};