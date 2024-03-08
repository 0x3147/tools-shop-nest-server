import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { QueryCommonUserDto } from '../dto/query-common-user.dto'
import { User } from '../entity/user.entity'
import { QueryUserListVo } from '../resp/query-user-list.vo'

@Injectable()
export class UserQueryService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  async makeQuery(
    isAdmin: boolean,
    pageSize: number = 1,
    currentPage: number = 1,
    username: string | undefined,
    email: string | undefined,
    type?: 'common' | 'member'
  ) {
    const skip = (currentPage - 1) * pageSize

    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.isAdmin = :isAdmin', { isAdmin })

    if (type === 'common') {
      query = query.andWhere('role.name = :roleName', { roleName: '普通用户' })
    }

    if (type === 'member') {
      query = query.andWhere('role.name = :roleName', { roleName: '会员用户' })
    }

    if (username !== undefined && username !== '') {
      query = query.andWhere('user.username LIKE :username', {
        username: `%${username}%`
      })
    }

    if (email !== undefined && email !== '') {
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
    resp.lastPage = Math.ceil(total / pageSize)

    return resp
  }

  async queryCommonUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = undefined,
      email = undefined
    } = queryCommonUserDto

    return await this.makeQuery(
      false,
      pageSize,
      currentPage,
      username,
      email,
      'common'
    )
  }

  async queryAdminUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = undefined,
      email = undefined
    } = queryCommonUserDto

    return await this.makeQuery(true, pageSize, currentPage, username, email)
  }
}
