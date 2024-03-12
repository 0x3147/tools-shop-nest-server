import { Injectable } from '@nestjs/common'
import { SnowflakeIdv1 } from 'simple-flakeid'

@Injectable()
export class SnowFlakeService {
  private generator = new SnowflakeIdv1({ workerId: 1 })

  async nextId(): Promise<number | bigint> {
    return this.generator.NextId()
  }
}
