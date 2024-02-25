import { HttpException, HttpStatus } from '@nestjs/common'

export class ToolsShopException extends HttpException {
  constructor(errorCode: number, message: string) {
    super({ errorCode, message }, HttpStatus.OK)
  }
}
