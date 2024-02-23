import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'
import { WinstonModule } from './common/winston.module'
import { EmailModule } from './email/email.module'
import { RedisModule } from './redis/redis.module'
import { SnowFlakeModule } from './snow-flake/snow-flake.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionParams),
    WinstonModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`
    }),
    UserModule,
    SnowFlakeModule,
    EmailModule,
    RedisModule
  ]
})
export class AppModule {}
