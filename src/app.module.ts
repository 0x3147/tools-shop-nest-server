import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'
import { WinstonModule } from './common/winston.module'
import { EmailModule } from './email/email.module'
import { LoginGuard } from './guard/login.guard'
import { PermissionsGuard } from './guard/permission.guard'
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
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME')
          }
        }
      },
      inject: [ConfigService]
    }),
    UserModule,
    SnowFlakeModule,
    EmailModule,
    RedisModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ]
})
export class AppModule {}
