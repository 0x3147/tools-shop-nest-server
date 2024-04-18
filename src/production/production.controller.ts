import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { OssService } from '../oss/oss.service'
import { CreateProductDto } from './dto/create-product.dto'
import { FindProductsDto } from './dto/find-products.dto'
import { ProdControlDto } from './dto/prod-control.dto'
import { ProductionService } from './production.service'

@Controller('prod')
export class ProductionController {
  @Inject(ProductionService)
  productionService: ProductionService

  @Inject(OssService)
  ossService: OssService

  @Post('list')
  async getProductionList(@Body() findProductsDto: FindProductsDto) {
    return await this.productionService.findProducts(findProductsDto)
  }

  @Post('add')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'productFile', maxCount: 1 }
    ])
  )
  async addProduction(
    @UploadedFiles() files: any,
    @Body() createProductDto: CreateProductDto
  ) {
    const imageFile = files.image[0]
    const productFile = files.productFile[0]

    const imageUrl = await this.ossService.uploadFile(imageFile, 'images/')

    const downloadUrl = await this.ossService.uploadFile(
      productFile,
      'products/'
    )

    return await this.productionService.createProduct(
      createProductDto,
      imageUrl,
      downloadUrl
    )
  }

  @Post('update')
  async updateProduction() {}

  @Post('remove')
  async removeProduction(@Body() prodControlDto: ProdControlDto) {
    return await this.productionService.removeProduct(
      BigInt(prodControlDto.postId)
    )
  }

  @Post('delete')
  async deleteProduction(@Body() prodControlDto: ProdControlDto) {
    return await this.productionService.deleteProduct(
      BigInt(prodControlDto.postId)
    )
  }
}
