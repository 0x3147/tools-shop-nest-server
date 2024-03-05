export enum ToolsShopExceptionEnumDesc {
  CAPTCHA_ERROR = '验证码错误',
  CAPTCHA_EXPIRED = '验证码已失效',
  USER_EXISTED = '用户已存在',
  USER_NOT_EXISTED = '用户不存在',
  PASSWORD_ERROR = '密码错误',
  TOKEN_EXPIRED = 'token已失效',
  USER_NOT_LOGIN = '用户未登录',
  UPDATE_PASSWORD_FAIL = '修改密码失败',
  UPDATE_USER_INFO_FAIL = '修改用户信息失败',
  OLD_PASSWORD_ERROR = '原密码错误',
  SUBSCRIBE_MEMBER_FAIL = '会员订阅失败'
}

export enum ToolsShopExceptionEnumCode {
  CAPTCHA_ERROR = 10001,
  CAPTCHA_EXPIRED = 10002,
  USER_EXISTED = 10003,
  USER_NOT_EXISTED = 10004,
  PASSWORD_ERROR = 10005,
  TOKEN_EXPIRED = 10006,
  USER_NOT_LOGIN = 10007,
  UPDATE_PASSWORD_FAIL = 10008,
  UPDATE_USER_INFO_FAIL = 10009,
  OLD_PASSWORD_ERROR = 10010,
  SUBSCRIBE_MEMBER_FAIL = 10011
}
