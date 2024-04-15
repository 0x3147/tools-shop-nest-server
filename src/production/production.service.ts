import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../common/winston.module'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'
import { SnowFlakeService } from '../snow-flake/snow-flake.service'
import { CreateProductDto } from './dto/create-product.dto'
import { Product } from './entity/product.entity'

@Injectable()
export class ProductionService {
  @InjectRepository(Product)
  private productRepository: Repository<Product>

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Inject(SnowFlakeService)
  private snowFlakeService: SnowFlakeService

  async createProduct(
    createProductDto: CreateProductDto,
    imageUrl: string,
    downloadUrl: string
  ): Promise<string> {
    const product = new Product()
    product.postId = await this.snowFlakeService.nextId()
    product.name = createProductDto.name
    product.description = createProductDto.description
    product.imageUrl = imageUrl
    product.downloadUrl = downloadUrl

    try {
      await this.productRepository.save(product)
      return '创建产品成功'
    } catch (e) {
      this.logger.error(e, ProductionService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.ADD_PRODUCT_FAIL,
        ToolsShopExceptionEnumDesc.ADD_PRODUCT_FAIL
      )
    }
  }

  async removeProduct(postId: number | bigint): Promise<string> {
    const product = await this.productRepository.findOneBy({ postId })

    if (!product) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.PRODUCT_NOT_EXISTED,
        ToolsShopExceptionEnumDesc.PRODUCT_NOT_EXISTED
      )
    }

    product.isArchived = true

    try {
      await this.productRepository.save(product)
      return '下架产品成功'
    } catch (e) {
      this.logger.error(e, ProductionService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.REMOVE_PRODUCT_FAIL,
        ToolsShopExceptionEnumDesc.REMOVE_PRODUCT_FAIL
      )
    }
  }

  async deleteProduct(postId: number | bigint): Promise<string> {
    const result = await this.productRepository.delete({ postId })

    if (result.affected === 0) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.DELETE_PRODUCT_FAIL,
        ToolsShopExceptionEnumDesc.DELETE_PRODUCT_FAIL
      )
    }

    return '删除产品成功'
  }
}
