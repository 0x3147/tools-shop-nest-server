import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'
import { WinstonModule } from './common/winston.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionParams),
    WinstonModule.forRoot(),
    UserModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
