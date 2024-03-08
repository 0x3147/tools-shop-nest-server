import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QueryUserController } from './controller/query-user.controller'
import { UserInitController } from './controller/user-init.controller'
import { UserController } from './controller/user.controller'
import { Permission } from './entity/permission.entity'
import { Role } from './entity/role.entity'
import { User } from './entity/user.entity'
import { UserInitService } from './service/user-init.service'
import { UserService } from './service/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController, UserInitController, QueryUserController],
  providers: [UserService, UserInitService]
})
export class UserModule {}
