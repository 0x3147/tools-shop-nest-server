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
}
