import { Body, Controller, Inject, Post } from '@nestjs/common'
import { QueryCommonUserDto } from '../dto/query-common-user.dto'
import { UserService } from '../service/user.service'

@Controller('user-query')
export class QueryUserController {
  @Inject(UserService)
  private userService: UserService

  @Post('common')
  async queryCommonUser(@Body() queryCommonUserDto: QueryCommonUserDto) {
    return await this.userService.queryCommonUser(queryCommonUserDto)
  }
}
