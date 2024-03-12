import { Controller, Get, Inject } from '@nestjs/common'
import { UserInitService } from '../service/user-init.service'

@Controller('user-init')
export class UserInitController {
  @Inject(UserInitService)
  userInitService: UserInitService

  /**
   * ⚠️此接口只能在测试环境下调用！！且只调用一次
   * ⚠️生产环境下添加管理员请导出sql直接在生产环境执行！
   */
  @Get('admin-init')
  async adminInit() {
    await this.userInitService.adminInit()
  }

  @Get('common-init')
  async commonInit() {
    await this.userInitService.commonInit()
  }
}
