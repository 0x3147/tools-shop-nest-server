import { Body, Controller, Inject, Post } from '@nestjs/common'
import { RequireLogin, RequirePermissions } from '../../common/custom.decorator'
import { PermissionCode } from '../../common/permission'
import { QueryCommonUserDto } from '../dto/query-common-user.dto'
import { UserQueryService } from '../service/user-query.service'

@Controller('user-query')
export class QueryUserController {
  @Inject(UserQueryService)
  private userQueryService: UserQueryService

  @Post('common')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async queryCommonUser(@Body() queryCommonUserDto: QueryCommonUserDto) {
    return await this.userQueryService.queryCommonUser(queryCommonUserDto)
  }

  @Post('member')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async queryMemberUser(@Body() queryCommonUserDto: QueryCommonUserDto) {
    return await this.userQueryService.queryMember(queryCommonUserDto)
  }

  @Post('admin')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async queryAdminUser(@Body() queryCommonUserDto: QueryCommonUserDto) {
    return await this.userQueryService.queryAdminUser(queryCommonUserDto)
  }
}
