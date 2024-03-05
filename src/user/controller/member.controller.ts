import { Controller, Inject, Post } from '@nestjs/common'
import { SubscribeMemberDto } from '../dto/subscribe-member.dto'
import { UserService } from '../service/user.service'

@Controller('member')
export class MemberController {
  @Inject(UserService)
  private userService: UserService

  @Post('subscribe')
  async subscribeMember(subscribeDto: SubscribeMemberDto) {
    const { postId, memberType } = subscribeDto

    return await this.userService.subscribeMember(postId, memberType)
  }
}
