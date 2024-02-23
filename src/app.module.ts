import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import Redis from 'ioredis'
import { connectionParams } from '../ormconfig'
import { WinstonModule } from './common/winston.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(connectionParams),
    WinstonModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`
    }),
    UserModule
  ],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB')
        })
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {}
