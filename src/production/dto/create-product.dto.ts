import { IsNotEmpty } from 'class-validator'
export class CreateProductDto {
  @IsNotEmpty({
    message: '产品名称不能为空'
  })
  name: string

  description: string

  tags?: string[]
}
