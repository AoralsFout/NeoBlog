export { default as authService } from './auth.service';
export { default as userService } from './user.service';
export { default as oauthService } from './oauth.service';
export { default as musicService } from './music.service';
export { default as commentService } from './comment.service';

// 统一服务导出
import authService from './auth.service';
import userService from './user.service';
import oauthService from './oauth.service';
import musicService from './music.service';
import commentService from './comment.service';

export const services = {
  auth: authService,
  user: userService,
  oauth: oauthService,
  music: musicService,
  comment: commentService,
};