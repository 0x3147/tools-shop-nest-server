import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WINSTON_LOGGER_TOKEN } from './common/winston.module'
import { ResponseInterceptor } from './interceptor/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const allowedOrigins = configService.get('ALLOWED_ORIGINS').split(',')

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

  await app.listen(6666)
}
bootstrap()
