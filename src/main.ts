import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './interceptor/response.interceptor'
import { WINSTON_LOGGER_TOKEN } from './common/winston.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useLogger(app.get(WINSTON_LOGGER_TOKEN));

  app.useGlobalPipes(new ValidationPipe())

  app.useGlobalInterceptors(new ResponseInterceptor())

  await app.listen(3000)
}
bootstrap()
