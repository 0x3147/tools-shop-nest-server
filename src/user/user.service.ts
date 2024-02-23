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
import { handleEncrypt } from '../util/argon2Util'
import { RegisterUserDto } from './dto/registerUser.dto'
import { User } from './entity/user.entity'

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
}