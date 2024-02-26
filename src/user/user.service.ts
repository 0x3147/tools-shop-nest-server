import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../common/winston.module'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'
import { RedisService } from '../redis/redis.service'
import { SnowFlakeService } from '../snow-flake/snow-flake.service'
import { handleDecrypt, handleEncrypt } from '../util/argon2Util'
import { LoginUserDto } from './dto/login-user.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { UpdateUserInfoDto } from './dto/update-user-info.dto'
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'
import { User } from './entity/user.entity'
import { LoginUserVo } from './resp/login-vo'
import { UserDetailVo } from './resp/user-info.vo'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Inject(RedisService)
  private redisClient: RedisService

  @Inject(SnowFlakeService)
  private snowFlakeService: SnowFlakeService

  async register(user: RegisterUserDto) {
    const captcha = await this.redisClient.get(`captcha_${user.email}`)

    if (!captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_EXPIRED,
        ToolsShopExceptionEnumDesc.CAPTCHA_EXPIRED
      )
    }

    if (user.captcha !== captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_ERROR,
        ToolsShopExceptionEnumDesc.CAPTCHA_ERROR
      )
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username
    })

    if (foundUser) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_EXISTED,
        ToolsShopExceptionEnumDesc.USER_EXISTED
      )
    }

    const newUser = new User()
    const hashPassword = await handleEncrypt(user.password)
    newUser.postId = await this.snowFlakeService.nextId()
    newUser.username = user.username
    newUser.password = hashPassword
    newUser.email = user.email

    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_EXISTED,
        ToolsShopExceptionEnumDesc.USER_EXISTED
      )
    }
  }

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin
      },
      relations: ['member']
    })

    if (!user) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_NOT_EXISTED,
        ToolsShopExceptionEnumDesc.USER_NOT_EXISTED
      )
    }

    if (!(await handleDecrypt(user.password, loginUserDto.password))) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.PASSWORD_ERROR,
        ToolsShopExceptionEnumDesc.PASSWORD_ERROR
      )
    }

    const loginResponse = new LoginUserVo()
    loginResponse.userInfo = {
      postId: user.postId,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createTime: user.createTime
    }

    return loginResponse
  }

  async findUserInfoByPostId(postId: number | bigint) {
    const user = await this.userRepository.findOne({
      where: {
        postId
      }
    })

    const resp = new UserDetailVo()
    resp.postId = user.postId
    resp.username = user.username
    resp.email = user.email
    resp.createTime = user.createTime

    return resp
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisClient.get(
      `update_password_captcha_${passwordDto.email}`
    )

    if (!captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_EXPIRED,
        ToolsShopExceptionEnumDesc.CAPTCHA_EXPIRED
      )
    }

    if (passwordDto.captcha !== captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_ERROR,
        ToolsShopExceptionEnumDesc.CAPTCHA_ERROR
      )
    }

    const currentUser = await this.userRepository.findOne({
      where: {
        postId: passwordDto.postId
      }
    })

    currentUser.password = await handleEncrypt(passwordDto.password)

    try {
      await this.userRepository.save(currentUser)
      return '密码修改成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.UPDATE_PASSWORD_FAIL,
        ToolsShopExceptionEnumDesc.UPDATE_PASSWORD_FAIL
      )
    }
  }

  async updateInfo(updateUserInfoDto: UpdateUserInfoDto) {
    const captcha = await this.redisClient.get(
      `update_user_captcha_${updateUserInfoDto.email}`
    )

    if (!captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_EXPIRED,
        ToolsShopExceptionEnumDesc.CAPTCHA_EXPIRED
      )
    }

    if (updateUserInfoDto.captcha !== captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_ERROR,
        ToolsShopExceptionEnumDesc.CAPTCHA_ERROR
      )
    }

    const currentUser = await this.userRepository.findOne({
      where: {
        postId: updateUserInfoDto.postId
      }
    })

    if (updateUserInfoDto.username) {
      currentUser.username = updateUserInfoDto.username
    }

    try {
      await this.userRepository.save(currentUser)
      return '用户信息修改成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.UPDATE_USER_INFO_FAIL,
        ToolsShopExceptionEnumDesc.UPDATE_USER_INFO_FAIL
      )
    }
  }
}
