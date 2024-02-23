import { Body, Controller, Inject, Post } from '@nestjs/common'
import { RegisterUserDto } from './dto/registerUser.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  @Inject(UserService)
  private userService: UserService

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }
}
