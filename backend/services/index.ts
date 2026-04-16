export { default as authService } from './auth.service';
export { default as userService } from './user.service';
export { default as oauthService } from './oauth.service';

// 统一服务导出
import authService from './auth.service';
import userService from './user.service';
import oauthService from './oauth.service';

export const services = {
  auth: authService,
  user: userService,
  oauth: oauthService,
};