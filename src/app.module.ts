import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { connectionParams } from '../ormconfig'

@Module({
  imports: [TypeOrmModule.forRoot(connectionParams)],
  controllers: [],
  providers: []
})
export class AppModule {}
