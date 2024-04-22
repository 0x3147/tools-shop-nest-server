import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OssService } from '../oss/oss.service'
import { ProductionController } from './controller/production.controller'
import { TagController } from './controller/tag.controller'
import { Product } from './entity/product.entity'
import { Tag } from './entity/tag.entity'
import { ProductionService } from './service/production.service'
import { TagService } from './service/tag.service'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Tag])],
  controllers: [ProductionController, TagController],
  providers: [ProductionService, TagService, OssService]
})
export class ProductionModule {}
