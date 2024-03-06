import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './controller/user.controller'
import { Permission } from './entity/permission.entity'
import { Role } from './entity/role.entity'
import { User } from './entity/user.entity'
import { UserService } from './service/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
