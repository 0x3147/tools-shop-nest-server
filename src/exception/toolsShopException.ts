import { HttpException, HttpStatus } from '@nestjs/common'

export class ToolsShopException extends HttpException {
  constructor(errorCode: string, errorMessage: string) {
    super({ errorCode, errorMessage }, HttpStatus.OK)
  }
}
