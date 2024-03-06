import { Controller, Get, Inject } from '@nestjs/common'
import { UserInitService } from '../service/user-init.service'

@Controller('user-init')
export class UserInitController {
  @Inject(UserInitService)
  userInitService: UserInitService

  @Get('admin-init')
  async adminInit() {
    await this.userInitService.adminInit()
  }
}
