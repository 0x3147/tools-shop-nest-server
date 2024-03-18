import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Express, Response } from 'express'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../common/winston.module'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'
import { OssService } from './oss.service'

@Controller('files')
export class OssController {
  @Inject(OssService)
  ossService: OssService

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    // 选择上传方式，可以根据文件大小或其他标准来决定
    const uploadMethod =
      file.size > 1024 * 1024 * 100 ? 'multipartUpload' : 'put'

    try {
      let result: any
      if (uploadMethod === 'put') {
        // 普通上传
        result = await this.ossService.commonUpload(
          file.buffer,
          file.originalname
        )
      } else {
        // 分片上传
        result = await this.ossService.multipartUpload(
          file.buffer,
          file.originalname
        )
      }

      // 返回上传结果
      return res.json(result)
    } catch (error) {
      this.logger.error(error, OssController)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.UPLOAD_TO_OSS_FAIL,
        ToolsShopExceptionEnumDesc.UPLOAD_TO_OSS_FAIL
      )
    }
  }

  @Get('download/:objectName')
  async downloadFile(@Param('objectName') objectName: string) {
    try {
      return await this.ossService.getSignedUrl(objectName, 3600)
    } catch (error) {
      this.logger.error(error, OssController)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.DOWNLOAD_TO_OSS_FAIL,
        ToolsShopExceptionEnumDesc.DOWNLOAD_TO_OSS_FAIL
      )
    }
  }
}
