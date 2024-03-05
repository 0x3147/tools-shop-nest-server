import { IsNotEmpty } from 'class-validator'
import { MemberType } from '../../common/member'

export class SubscribeMemberDto {
  @IsNotEmpty({
    message: '用户业务id不能为空'
  })
  postId: number | bigint

  @IsNotEmpty({
    message: '会员类型不能为空'
  })
  memberType: MemberType
}
