import { Global, Module } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisService } from './redis.service'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          password: configService.get('REDIS_PASSWORD'),
          database: configService.get<number>('REDIS_DB')
        })
        await client.connect()
        return client
      }
    }
  ],
  exports: [RedisService]
})
export class RedisModule {}
