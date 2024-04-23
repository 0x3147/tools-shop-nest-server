import { IsNotEmpty } from 'class-validator'

export class FindProductsDto {
  name?: string

  isArchived?: boolean

  isFree?: boolean

  tag?: string

  @IsNotEmpty({
    message: '当前页信息不能为空'
  })
  currentPage: number

  @IsNotEmpty({
    message: '每页条数信息不能为空'
  })
  pageSize: number
}
