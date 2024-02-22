import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [TypeOrmModule.forRoot(connectionParams)],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
