import { DynamicModule, Global, Module } from '@nestjs/common'
import { MyLogger } from './logger'

export const WINSTON_LOGGER_TOKEN = 'WINSTON_LOGGER'

@Global()
@Module({})
export class WinstonModule {
  public static forRoot(): DynamicModule {
    return {
      module: WinstonModule,
      providers: [
        {
          provide: WINSTON_LOGGER_TOKEN,
          useValue: new MyLogger()
        }
      ],
      exports: [WINSTON_LOGGER_TOKEN]
    }
  }
}
