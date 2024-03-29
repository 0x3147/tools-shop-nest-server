import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as dotenv from 'dotenv'
import { AppModule } from './app.module'
import { WINSTON_LOGGER_TOKEN } from './common/winston.module'
import { HttpExceptionFilter } from './filter/http-exception.filter'
import { InvokeRecordInterceptor } from './interceptor/invoke-record.interceptor'
import { ResponseInterceptor } from './interceptor/response.interceptor'

// 根据 NODE_ENV 显式选择 .env 文件
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const allowedOrigins = configService.get('ALLOWED_ORIGINS').split(',')

  app.setGlobalPrefix('/api/v1')

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'), false)
      }
    }
  })

  app.useLogger(app.get(WINSTON_LOGGER_TOKEN))

  app.useGlobalPipes(new ValidationPipe())

  app.useGlobalInterceptors(new ResponseInterceptor())

  app.useGlobalInterceptors(new InvokeRecordInterceptor())

  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(3001)
}
bootstrap()
