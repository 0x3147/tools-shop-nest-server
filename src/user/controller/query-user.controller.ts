import { Body, Controller, Inject, Post } from '@nestjs/common'
import { RequireLogin, RequirePermission } from '../../common/custom.decorator'
import { PermissionCode } from '../../common/permission'
import { QueryCommonUserDto } from '../dto/query-common-user.dto'
import { UserService } from '../service/user.service'

@Controller('user-query')
export class QueryUserController {
  @Inject(UserService)
  private userService: UserService

  @Post('common')
  @RequireLogin()
  @RequirePermission(PermissionCode.HAVE_ALL_PERMISSIONS)
  async queryCommonUser(@Body() queryCommonUserDto: QueryCommonUserDto) {
    return await this.userService.queryCommonUser(queryCommonUserDto)
  }
}
