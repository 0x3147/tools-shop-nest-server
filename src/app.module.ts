import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'
import { UserModule } from './user/user.module'

@Module({
  imports: [TypeOrmModule.forRoot(connectionParams), UserModule],
  controllers: [],
  providers: []
})
export class AppModule {}
