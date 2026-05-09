export * from './auth.controller';
export * from './user.controller';
export * from './health.controller';
export * from './music.controller';
export * from './comment.controller';
export * from './article.controller';

// 统一控制器导出
import * as authController from './auth.controller';
import * as userController from './user.controller';
import * as healthController from './health.controller';
import * as musicController from './music.controller';
import * as commentController from './comment.controller';
import * as articleController from './article.controller';

export const controllers = {
  auth: authController,
  user: userController,
  health: healthController,
  music: musicController,
  comment: commentController,
  article: articleController,
};