import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { RequireLogin, RequirePermissions } from '../../common/custom.decorator'
import { PermissionCode } from '../../common/permission'
import { EmailService } from '../../email/email.service'
import { RedisService } from '../../redis/redis.service'
import { ForgetPasswordDto } from '../dto/forget-password.dto'
import { FrozenDto } from '../dto/frozen.dto'
import { LoginUserDto } from '../dto/login-user.dto'
import { RegisterUserDto } from '../dto/register-user.dto'
import { UpdateUserInfoDto } from '../dto/update-user-info.dto'
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto'
import { UserService } from '../service/user.service'

@Controller('user')
export class UserController {
  @Inject(UserService)
  private userService: UserService

  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisClient: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(ConfigService)
  private configService: ConfigService

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @Get('register-captcha')
  async captcha(@Query() address: { address: string }) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisClient.set(`captcha_${address.address}`, code, 5 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const resp = await this.userService.login(loginUser)

    resp.token = this.jwtService.sign(
      {
        postId: resp.userInfo.postId,
        username: resp.userInfo.username,
        roles: resp.userInfo.roles,
        permission: resp.userInfo.permissions
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '7d'
      }
    )

    return resp
  }

  @Post('admin/login')
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const resp = await this.userService.login(loginUser)

    resp.token = this.jwtService.sign(
      {
        postId: resp.userInfo.postId,
        username: resp.userInfo.username,
        roles: resp.userInfo.roles,
        permission: resp.userInfo.permissions
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '7d'
      }
    )

    return resp
  }

  @Get('info')
  @RequireLogin()
  async getUserInfo(@Query('postId') postId: number | bigint) {
    return await this.userService.findUserInfoByPostId(BigInt(postId))
  }

  @Post(['update-password', 'admin/update-password'])
  @RequireLogin()
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(passwordDto)
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(@Body() updateUserInfoDto: UpdateUserInfoDto) {
    return await this.userService.updateInfo(updateUserInfoDto)
  }

  @Get('update/captcha')
  @RequireLogin()
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisClient.set(`update_user_captcha_${address}`, code, 10 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @Get('forget-captcha')
  async forgetCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisClient.set(
      `forget_password_captcha_${address}`,
      code,
      10 * 60
    )

    await this.emailService.sendMail({
      to: address,
      subject: '找回密码验证',
      html: `<p>你的验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @Post('forget')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.userService.forgetPassword(forgetPasswordDto)
  }

  @Post('freeze')
  async freeze(@Body() freezeUserDto: FrozenDto) {
    return await this.userService.freeze(BigInt(freezeUserDto.postId))
  }

  @Post('unfreeze')
  async unfreeze(@Body() unfreezeUserDto: FrozenDto) {
    return await this.userService.unfreeze(BigInt(unfreezeUserDto.postId))
  }
}
