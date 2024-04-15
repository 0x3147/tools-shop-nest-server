import { Controller, Get, Inject } from '@nestjs/common'
import { OssService } from './oss.service'

@Controller('oss')
export class OssController {
  @Inject(OssService)
  ossService: OssService

  @Get('signature')
  async getSignature() {
    return await this.ossService.getSignature()
  }
}
