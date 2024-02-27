import { IsNotEmpty, MinLength } from 'class-validator'

export class UpdateUserPasswordDto {
  @IsNotEmpty({
    message: '用户业务id不能为空'
  })
  postId: number | bigint

  @IsNotEmpty({
    message: '密码不能为空'
  })
  @MinLength(6, {
    message: '密码不能少于 6 位'
  })
  password: string
}
