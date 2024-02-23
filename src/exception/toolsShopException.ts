import { HttpException, HttpStatus } from '@nestjs/common'

export class ToolsShopException extends HttpException {
  constructor(statusCode: number, message: string) {
    super({ statusCode, message }, HttpStatus.OK)
  }
}
