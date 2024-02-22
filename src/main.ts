import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './interceptor/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())

  app.useGlobalInterceptors(new ResponseInterceptor())

  await app.listen(3000)
}
bootstrap()
