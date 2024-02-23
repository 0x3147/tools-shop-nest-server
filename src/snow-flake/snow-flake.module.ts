import { Global, Module } from '@nestjs/common'
import { SnowFlakeService } from './snow-flake.service';

@Global()
@Module({
  providers: [SnowFlakeService],
  exports: [SnowFlakeService]
})
export class SnowFlakeModule {}
