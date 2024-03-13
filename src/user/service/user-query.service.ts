import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ToolsShopException } from '../../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../../exception/toolsShopExceptionEnum'
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
    isFrozen?: boolean | undefined,
    type?: 'common' | 'member'
  ) {
    try {
      const skip = (currentPage - 1) * pageSize

      let query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .where('user.isAdmin = :isAdmin', { isAdmin })

      if (type === 'common') {
        query = query.andWhere('role.name = :roleName', {
          roleName: '普通用户'
        })
      }

      if (type === 'member') {
        query = query.andWhere('role.name = :roleName', {
          roleName: '会员用户'
        })
      }

      if (isFrozen !== null) {
        query = query.andWhere('user.isFrozen = :isFrozen', { isFrozen })
      }

      if (username !== '') {
        query = query.andWhere('user.username LIKE :username', {
          username: `%${username}%`
        })
      }

      if (email !== '') {
        query = query.andWhere('user.email LIKE :email', {
          email: `%${email}%`
        })
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
    } catch (e) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.QUERY_USER_FAIL,
        ToolsShopExceptionEnumDesc.QUERY_USER_FAIL
      )
    }
  }

  async queryCommonUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = '',
      email = '',
      isFrozen = null
    } = queryCommonUserDto

    return await this.makeQuery(
      false,
      pageSize,
      currentPage,
      username,
      email,
      isFrozen,
      'common'
    )
  }

  async queryAdminUser(queryCommonUserDto: QueryCommonUserDto) {
    const {
      pageSize = 1,
      currentPage = 10,
      username = '',
      email = ''
    } = queryCommonUserDto

    return await this.makeQuery(true, pageSize, currentPage, username, email)
  }
}
