import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { EmailService } from '../email/email.service'
import { RedisService } from '../redis/redis.service'
import { RegisterUserDto } from './dto/registerUser.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  @Inject(UserService)
  private userService: UserService

  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @Get('register-captcha')
  async captcha(@Query() address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(`captcha_${address}`, code, 5 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    })
    return '发送成功'
  }
}
