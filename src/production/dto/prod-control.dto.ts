import { IsNotEmpty } from 'class-validator'

export class ProdControlDto {
  @IsNotEmpty({
    message: '用户业务id不能为空'
  })
  postId: number | bigint

  permissions?: string[]
}