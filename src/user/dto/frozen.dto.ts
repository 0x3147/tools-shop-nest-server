import { IsNotEmpty } from 'class-validator'

export class FrozenDto {
  @IsNotEmpty({
    message: '用户业务id不能为空'
  })
  postId: number | bigint

  permissions?: string[]
}
