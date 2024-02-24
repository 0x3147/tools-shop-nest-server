import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { EmailService } from '../email/email.service'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'
import { RedisService } from '../redis/redis.service'
import { LoginUserDto } from './dto/login-user.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  @Inject(UserService)
  private userService: UserService

  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(ConfigService)
  private configService: ConfigService

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

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const resp = await this.userService.login(loginUser, false)

    resp.accessToken = this.jwtService.sign(
      {
        postId: resp.userInfo.postId,
        username: resp.userInfo.username,
        member: resp.userInfo.member
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
      }
    )

    resp.refreshToken = this.jwtService.sign(
      {
        postId: resp.userInfo.postId
      },
      {
        expiresIn:
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
      }
    )

    return resp
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const resp = await this.userService.login(loginUser, true)

    resp.accessToken = this.jwtService.sign(
      {
        postId: resp.userInfo.postId,
        username: resp.userInfo.username,
        member: resp.userInfo.member
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
      }
    )

    resp.refreshToken = this.jwtService.sign(
      {
        postId: resp.userInfo.postId
      },
      {
        expiresIn:
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
      }
    )

    return resp
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserByPostId(data.postId, false)

      const access_token = this.jwtService.sign(
        {
          postId: user.postId,
          username: user.username,
          member: user.member
        },
        {
          expiresIn:
            this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        }
      )

      const refresh_token = this.jwtService.sign(
        {
          postId: user.postId
        },
        {
          expiresIn:
            this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        }
      )

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TOKEN_EXPIRED,
        ToolsShopExceptionEnumDesc.TOKEN_EXPIRED
      )
    }
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserByPostId(data.postId, true)

      const access_token = this.jwtService.sign(
        {
          postId: user.postId,
          username: user.username,
          member: user.member
        },
        {
          expiresIn:
            this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') || '30m'
        }
      )

      const refresh_token = this.jwtService.sign(
        {
          postId: user.postId
        },
        {
          expiresIn:
            this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') || '7d'
        }
      )

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TOKEN_EXPIRED,
        ToolsShopExceptionEnumDesc.TOKEN_EXPIRED
      )
    }
  }
}
