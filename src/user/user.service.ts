import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { Repository } from 'typeorm'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../common/winston.module'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'
import { SnowFlakeService } from '../snow-flake/snow-flake.service'
import { RegisterUserDto } from './dto/registerUser.dto'
import { User } from './entity/user.entity'
import {handleEncrypt} from '../util/argon2Util'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Inject('REDIS_CLIENT')
  private redisClient: Redis

  @Inject()
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
    newUser.username = user.username
    newUser.password = hashPassword
    newUser.email = user.email
    newUser.postId = await this.snowFlakeService.nextId()

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
}
