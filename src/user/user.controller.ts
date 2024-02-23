import { Body, Controller, Inject, Post } from '@nestjs/common'
import {UserService} from './user.service'
import { RegisterUserDto } from './dto/registerUser.dto'

@Controller('user')
export class UserController {

  @Inject(UserService)
  private userService: UserService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }
}
