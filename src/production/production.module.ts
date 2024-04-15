import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OssService } from '../oss/oss.service'
import { Product } from './entity/product.entity'
import { ProductionController } from './production.controller'
import { ProductionService } from './production.service'

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductionController],
  providers: [ProductionService, OssService]
})
export class ProductionModule {}
