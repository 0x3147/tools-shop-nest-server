import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OssService } from '../oss/oss.service'
import { ProductionController } from './controller/production.controller'
import { Product } from './entity/product.entity'
import { ProductionService } from './service/production.service'

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductionController],
  providers: [ProductionService, OssService]
})
export class ProductionModule {}
