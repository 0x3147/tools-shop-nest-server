export enum ToolsShopExceptionEnumDesc {
  CAPTCHA_ERROR = '验证码错误',
  CAPTCHA_EXPIRED = '验证码已失效',
  USER_EXISTED = '用户已存在',
  USER_NOT_EXISTED = '用户不存在',
  PASSWORD_ERROR = '密码错误',
  TOKEN_EXPIRED = 'token已失效',
  USER_NOT_LOGIN = '用户未登录',
  UPDATE_PASSWORD_FAIL = '修改密码失败',
  UPDATE_USER_INFO_FAIL = '修改用户信息失败'
}

export enum ToolsShopExceptionEnumCode {
  CAPTCHA_ERROR = 1001,
  CAPTCHA_EXPIRED = 1002,
  USER_EXISTED = 1003,
  USER_NOT_EXISTED = 1004,
  PASSWORD_ERROR = 1005,
  TOKEN_EXPIRED = 1006,
  USER_NOT_LOGIN = 1007,
  UPDATE_PASSWORD_FAIL = 1008,
  UPDATE_USER_INFO_FAIL = 1009
}
