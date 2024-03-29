import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as OSS from 'ali-oss'
import dayjs from 'dayjs'

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

  async getSignature() {
    // 使用 dayjs 设置过期时间为1天之后
    const expiration = dayjs().add(1, 'day').toISOString()
    const policy = {
      expiration,
      conditions: [['content-length-range', 0, 10485760000]]
    }

    const formData = this.client.calculatePostSignature(policy)

    const location = await this.client.getBucketLocation(
      this.configService.get('OSS_BUCKET')
    )

    const host = `http://${this.configService.get('OSS_BUCKET')}.${location.location}.aliyuncs.com`

    return {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host
    }
  }
}
