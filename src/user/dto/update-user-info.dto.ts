import { IsEmail, IsNotEmpty } from 'class-validator'

export class UpdateUserInfoDto {
  @IsNotEmpty({
    message: '用户业务id不能为空'
  })
  postId: number | bigint

  username: string

  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式'
    }
  )
  email: string

  @IsNotEmpty({
    message: '验证码不能为空'
  })
  captcha: string
}
