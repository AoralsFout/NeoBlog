import { body, validationResult } from 'express-validator';

/**
 * 验证请求数据，返回错误信息
 * @param req 请求对象
 * @returns 错误数组或null
 */
export const validateRequest = (req: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((error: any) => ({
      field: error.path,
      message: error.msg,
    }));
  }
  return null;
};

/**
 * 用户注册验证规则
 */
export const userValidationRules = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
];

/**
 * 用户登录验证规则
 */
export const loginValidationRules = [
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

/**
 * 用户更新验证规则
 */
export const userUpdateValidationRules = [
  body('username').optional().notEmpty().withMessage('用户名不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('avatar').optional().isURL().withMessage('头像必须是有效的URL'),
];

/**
 * 验证ID参数
 */
export const validateIdParam = (id: string): number | null => {
  const num = parseInt(id, 10);
  if (isNaN(num) || num <= 0) {
    return null;
  }
  return num;
};

/**
 * 验证分页参数
 */
export const validatePagination = (page: string = '1', limit: string = '10') => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 || limitNum > 100 ? 10 : limitNum,
  };
};