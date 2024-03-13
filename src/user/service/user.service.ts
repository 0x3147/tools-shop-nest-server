import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../../common/winston.module'
import { ToolsShopException } from '../../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../../exception/toolsShopExceptionEnum'
import { RedisService } from '../../redis/redis.service'
import { SnowFlakeService } from '../../snow-flake/snow-flake.service'
import { handleDecrypt, handleEncrypt } from '../../util/argon2Util'
import { ForgetPasswordDto } from '../dto/forget-password.dto'
import { LoginUserDto } from '../dto/login-user.dto'
import { RegisterUserDto } from '../dto/register-user.dto'
import { UpdateUserInfoDto } from '../dto/update-user-info.dto'
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto'
import { Role } from '../entity/role.entity'
import { User } from '../entity/user.entity'
import { LoginUserVo } from '../resp/login-vo'
import { UserDetailVo } from '../resp/user-info.vo'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

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

    const defaultRole = await this.roleRepository.findOne({
      where: { name: '普通用户' }
    })

    const newUser = new User()
    const hashPassword = await handleEncrypt(user.password)
    newUser.postId = await this.snowFlakeService.nextId()
    newUser.username = user.username
    newUser.password = hashPassword
    newUser.email = user.email

    newUser.roles = [defaultRole]

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

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username
      },
      relations: ['roles', 'roles.permissions']
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

    if (user.isFrozen) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_IS_FROZEN,
        ToolsShopExceptionEnumDesc.USER_IS_FROZEN
      )
    }

    const loginResponse = new LoginUserVo()
    loginResponse.userInfo = {
      postId: user.postId,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission.code)
          }
        })
        return arr
      }, []),
      createTime: user.createTime
    }

    return loginResponse
  }

  async findUserInfoByPostId(postId: number | bigint) {
    const user = await this.userRepository.findOne({
      where: {
        postId
      },
      relations: ['roles', 'roles.permissions']
    })

    const resp = new UserDetailVo()
    resp.postId = user.postId
    resp.username = user.username
    resp.email = user.email
    resp.roles = user.roles.map((item) => item.name)
    resp.permissions = user.roles.reduce((arr, item) => {
      item.permissions.forEach((permission) => {
        if (arr.indexOf(permission) === -1) {
          arr.push(permission.code)
        }
      })
      return arr
    }, [])
    resp.createTime = user.createTime

    return resp
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const currentUser = await this.userRepository.findOne({
      where: {
        postId: passwordDto.postId
      }
    })

    if (!(await handleDecrypt(currentUser.password, passwordDto.oldPassword))) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.OLD_PASSWORD_ERROR,
        ToolsShopExceptionEnumDesc.OLD_PASSWORD_ERROR
      )
    }

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
    const currentUser = await this.userRepository.findOne({
      where: {
        postId: updateUserInfoDto.postId
      }
    })

    if (updateUserInfoDto.email) {
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

      currentUser.email = updateUserInfoDto.email
    }

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

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const captcha = await this.redisClient.get(
      `forget_password_captcha_${forgetPasswordDto.email}`
    )

    if (!captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_EXPIRED,
        ToolsShopExceptionEnumDesc.CAPTCHA_EXPIRED
      )
    }

    if (forgetPasswordDto.captcha !== captcha) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CAPTCHA_ERROR,
        ToolsShopExceptionEnumDesc.CAPTCHA_ERROR
      )
    }

    const user = await this.userRepository.findOne({
      where: {
        email: forgetPasswordDto.email
      }
    })

    if (!user) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_NOT_EXISTED,
        ToolsShopExceptionEnumDesc.USER_NOT_EXISTED
      )
    }

    user.password = await handleEncrypt(forgetPasswordDto.password)

    try {
      await this.userRepository.save(user)
      return '密码重设成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.UPDATE_PASSWORD_FAIL,
        ToolsShopExceptionEnumDesc.UPDATE_PASSWORD_FAIL
      )
    }
  }

  async freeze(postId: number | bigint) {
    const user = await this.userRepository.findOneBy({ postId })

    user.isFrozen = true

    try {
      await this.userRepository.save(user)
      return '冻结用户成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.FREEZE_USER_FAIL,
        ToolsShopExceptionEnumDesc.FREEZE_USER_FAIL
      )
    }
  }

  async unfreeze(postId: number | bigint) {
    const user = await this.userRepository.findOneBy({ postId })

    user.isFrozen = false

    try {
      await this.userRepository.save(user)
      return '解冻用户成功'
    } catch (e) {
      this.logger.error(e, UserService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.UNFREEZE_USER_FAIL,
        ToolsShopExceptionEnumDesc.UNFREEZE_USER_FAIL
      )
    }
  }

  async upgrade(postId: number | bigint) {
    // 开始数据库事务
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      // 获取“普通用户”角色
      const normalUserRole = await this.roleRepository.findOne({
        where: { name: '普通用户' }
      })

      // 获取“会员用户”角色
      const memberUserRole = await this.roleRepository.findOne({
        where: { name: '会员用户' }
      })

      // 移除用户的“普通用户”角色
      await queryRunner.manager
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(postId)
        .remove(normalUserRole)

      // 赋予用户“会员用户”角色
      await queryRunner.manager
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(postId)
        .add(memberUserRole)

      // 提交事务
      await queryRunner.commitTransaction()
    } catch (e) {
      // 如果遇到错误，回滚事务
      this.logger.error(e, UserService)
      await queryRunner.rollbackTransaction()
    } finally {
      // 无论成功还是失败，都需要释放查询运行器
      await queryRunner.release()
    }
  }
}
