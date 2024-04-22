import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Logger } from 'winston'
import { WINSTON_LOGGER_TOKEN } from '../../common/winston.module'
import { ToolsShopException } from '../../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../../exception/toolsShopExceptionEnum'
import { SnowFlakeService } from '../../snow-flake/snow-flake.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { FindProductsDto } from '../dto/find-products.dto'
import { Product } from '../entity/product.entity'
import { AdminProdList } from '../resp/admin-prod-list.vo'

@Injectable()
export class ProductionService {
  @InjectRepository(Product)
  private productRepository: Repository<Product>

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Inject(SnowFlakeService)
  private snowFlakeService: SnowFlakeService

  async findProducts(findProductsDto: FindProductsDto): Promise<AdminProdList> {
    const {
      name,
      isArchived,
      tag,
      currentPage = 1,
      pageSize = 10
    } = findProductsDto

    try {
      const skip = (currentPage - 1) * pageSize

      let query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.tags', 'tag')

      if (name) {
        query = query.andWhere('product.name LIKE :name', { name: `%${name}%` })
      }
      if (isArchived !== undefined) {
        query = query.andWhere('product.isArchived = :isArchived', {
          isArchived
        })
      }
      if (tag) {
        query = query.andWhere('tag.name = :tagName', { tagName: tag })
      }

      const [result, total] = await query
        .skip(skip)
        .take(pageSize)
        .getManyAndCount()

      const formattedData = result.map((product) => ({
        postId: product.postId,
        name: product.name,
        imageUrl: product.imageUrl,
        description: product.description,
        downloadUrl: product.downloadUrl,
        tags: product.tags.map((tag) => tag.name)
      }))

      const resp = new AdminProdList()
      resp.tableData = formattedData
      resp.total = total
      resp.currentPage = currentPage
      resp.lastPage = Math.ceil(total / pageSize)

      return resp
    } catch (e) {
      this.logger.error(e)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.QUERY_PRODUCT_FAIL,
        ToolsShopExceptionEnumDesc.QUERY_PRODUCT_FAIL
      )
    }
  }

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
