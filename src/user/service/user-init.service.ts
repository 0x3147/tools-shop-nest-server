import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PermissionCode, PermissionDesc } from '../../common/permission'
import { SnowFlakeService } from '../../snow-flake/snow-flake.service'
import { handleEncrypt } from '../../util/argon2Util'
import { Permission } from '../entity/permission.entity'
import { Role } from '../entity/role.entity'
import { User } from '../entity/user.entity'

@Injectable()
export class UserInitService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>

  @Inject(SnowFlakeService)
  private snowFlakeService: SnowFlakeService

  @Inject(ConfigService)
  private configService: ConfigService

  randomEmail(domain: string = 'test.com'): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let email = ''
    for (let i = 0; i < 10; i++) {
      email += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return email + '@' + domain
  }

  randomPassword(length: number = 8): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  randomUsername(length: number = 8): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const digits = '0123456789'
    let username = letters.charAt(Math.floor(Math.random() * letters.length))

    for (let i = 1; i < length; i++) {
      const chars = letters + digits
      username += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return username
  }

  async adminInit() {
    const adminPass = this.configService.get<string>('ADMIN_PASSWORD')
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL')
    const adminPostId = await this.snowFlakeService.nextId()

    const adminUser = new User()
    adminUser.username = 'super_admin'
    adminUser.postId = adminPostId
    adminUser.password = await handleEncrypt(adminPass)
    adminUser.email = adminEmail
    adminUser.isAdmin = true

    const adminRole = new Role()
    adminRole.name = '超级管理员'

    const adminPermission = new Permission()
    adminPermission.code = PermissionCode.HAVE_ALL_PERMISSIONS
    adminPermission.description = PermissionDesc.HAVE_ALL_PERMISSIONS

    adminUser.roles = [adminRole]
    adminRole.permissions = [adminPermission]

    await this.permissionRepository.save([adminPermission])
    await this.roleRepository.save([adminRole])
    await this.userRepository.save(adminUser)
  }

  async commonInit() {
    const commonPass = this.randomPassword()
    const commonEmail = this.randomEmail()
    const commonPostId = await this.snowFlakeService.nextId()

    const commonUser = new User()
    commonUser.username = this.randomUsername()
    commonUser.postId = commonPostId
    commonUser.password = await handleEncrypt(commonPass)
    commonUser.email = commonEmail
    commonUser.isAdmin = false

    const commonRole = new Role()
    commonRole.name = '普通用户'

    const commonPermission = new Permission()
    commonPermission.code = PermissionCode.VIEW_ONLY
    commonPermission.description = PermissionDesc.VIEW_ONLY

    commonUser.roles = [commonRole]
    commonRole.permissions = [commonPermission]

    await this.permissionRepository.save([commonPermission])
    await this.roleRepository.save([commonRole])
    await this.userRepository.save(commonUser)
  }
}
