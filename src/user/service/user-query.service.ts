import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { QueryCommonUserDto } from '../dto/query-common-user.dto'
import { Permission } from '../entity/permission.entity'
import { Role } from '../entity/role.entity'
import { User } from '../entity/user.entity'
import { QueryUserListVo } from '../resp/query-user-list.vo'

@Injectable()
export class UserQueryService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>

  async queryCommonUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = undefined,
      email = undefined
    } = queryCommonUserDto

    const skip = (currentPage - 1) * pageSize

    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.isAdmin = :isAdmin', { isAdmin: false })
      .andWhere('role.name = :roleName', { roleName: '普通用户' })

    if (username) {
      query = query.andWhere('user.username LIKE :username', {
        username: `%${username}%`
      })
    }

    if (email) {
      query = query.andWhere('user.email LIKE :email', { email: `%${email}%` })
    }

    const [result, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    const tableData = result.map((user) => ({
      postId: user.postId,
      username: user.username,
      email: user.email,
      isFrozen: user.isFrozen,
      createTime: user.createTime
    }))

    const resp = new QueryUserListVo()
    resp.tableData = tableData
    resp.total = total
    resp.currentPage = currentPage

    return resp
  }

  async queryAdminUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = undefined,
      email = undefined
    } = queryCommonUserDto

    const skip = (currentPage - 1) * pageSize

    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.isAdmin = :isAdmin', { isAdmin: true })

    if (username) {
      query = query.andWhere('user.username LIKE :username', {
        username: `%${username}%`
      })
    }

    if (email) {
      query = query.andWhere('user.email LIKE :email', { email: `%${email}%` })
    }

    const [result, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount()

    const tableData = result.map((user) => ({
      postId: user.postId,
      username: user.username,
      email: user.email,
      isFrozen: user.isFrozen,
      createTime: user.createTime
    }))

    const resp = new QueryUserListVo()
    resp.tableData = tableData
    resp.total = total
    resp.currentPage = currentPage

    return resp
  }
}
