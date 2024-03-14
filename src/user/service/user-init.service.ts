import { HttpException, Inject, Injectable } from '@nestjs/common'
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

  async initRolesAndPermissions() {
    try {
      // 创建权限
      const haveAllPermission = this.permissionRepository.create({
        code: PermissionCode.HAVE_ALL_PERMISSIONS,
        description: PermissionDesc.HAVE_ALL_PERMISSIONS
      })
      const viewAndDownload = this.permissionRepository.create({
        code: PermissionCode.VIEW_AND_DOWNLOAD,
        description: PermissionDesc.VIEW_AND_DOWNLOAD
      })
      const viewOnly = this.permissionRepository.create({
        code: PermissionCode.VIEW_ONLY,
        description: PermissionDesc.VIEW_ONLY
      })

      await this.permissionRepository.save([
        haveAllPermission,
        viewAndDownload,
        viewOnly
      ])

      const adminRole = this.roleRepository.create({
        name: '管理员用户',
        permissions: [haveAllPermission]
      })
      const memberRole = this.roleRepository.create({
        name: '会员用户',
        permissions: [viewAndDownload]
      })
      const userRole = this.roleRepository.create({
        name: '普通用户',
        permissions: [viewOnly]
      })

      // 保存角色到数据库
      await this.roleRepository.save([adminRole, memberRole, userRole])
    } catch (error) {
      throw new HttpException('init error', 500)
    }
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

    const role = await this.roleRepository.findOne({
      where: { name: '管理员用户' }
    })

    adminUser.roles = [role]

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

    const role = await this.roleRepository.findOne({
      where: { name: '普通用户' }
    })

    commonUser.roles = [role]

    await this.userRepository.save(commonUser)
  }

  async memberInit() {
    const memberPass = 'Abc@1234'
    const memberEmail = this.randomEmail()
    const memberPostId = await this.snowFlakeService.nextId()

    const memberUser = new User()
    memberUser.username = this.randomUsername()
    memberUser.postId = memberPostId
    memberUser.password = await handleEncrypt(memberPass)
    memberUser.email = memberEmail
    memberUser.isAdmin = false

    const role = await this.roleRepository.findOne({
      where: { name: '会员用户' }
    })

    memberUser.roles = [role]

    await this.userRepository.save(memberUser)
  }
}
