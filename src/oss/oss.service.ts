import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OSS from 'ali-oss'

@Injectable()
export class OssService {
  private readonly client: OSS

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      region: this.configService.get('OSS_REGION'),
      accessKeyId: this.configService.get('OSS_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get('OSS_ACCESS_KEY_SECRET'),
      bucket: this.configService.get('OSS_BUCKET')
    })
  }

  // 普通上传
  async commonUpload(
    file: Buffer | NodeJS.ReadableStream,
    fileName: string
  ): Promise<OSS.PutObjectResult> {
    return await this.client.put(fileName, file)
  }

  // 分片上传
  async multipartUpload(
    file: Buffer | NodeJS.ReadableStream,
    fileName: string
  ): Promise<OSS.CompleteMultipartUploadResult> {
    return await this.client.multipartUpload(fileName, file, {
      // 这里可以设置分片上传的特定选项，如并行上传的分片数量等
      // parallel: 4,
      // partSize: 1024 * 1024,
    })
  }

  async getSignedUrl(objectName: string, expires: number): Promise<string> {
    return await this.client.asyncSignatureUrl(objectName, {
      expires,
      method: 'GET'
    })
  }
}
