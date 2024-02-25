import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    const res = exception.getResponse() as any
    console.log(res)

    // 直接返回自定义异常中的内容
    response.status(status).json({
      statusCode: status,
      success: false,
      errorCode: res?.errorCode,
      message: res?.message?.join ? res?.message.join(',') : exception.message
    })
  }
}
