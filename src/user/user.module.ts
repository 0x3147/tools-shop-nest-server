import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MemberController } from './controller/member.controller'
import { UserController } from './controller/user.controller'
import { Member } from './entity/member.entity'
import { User } from './entity/user.entity'
import { UserUtilService } from './service/user-util.service'
import { UserService } from './service/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Member])],
  controllers: [UserController, MemberController],
  providers: [UserService, UserUtilService]
})
export class UserModule {}
