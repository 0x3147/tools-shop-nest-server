import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { Logger } from 'winston'
import { RequireLogin, RequirePermissions } from '../../common/custom.decorator'
import { PermissionCode } from '../../common/permission'
import { WINSTON_LOGGER_TOKEN } from '../../common/winston.module'
import { OssService } from '../../oss/oss.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { FindProductsDto } from '../dto/find-products.dto'
import { ProdControlDto } from '../dto/prod-control.dto'
import { ProductionService } from '../service/production.service'

@Controller('prod')
export class ProductionController {
  @Inject(ProductionService)
  productionService: ProductionService

  @Inject(OssService)
  ossService: OssService

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Post('list')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
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
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async addProduction(
    @UploadedFiles() files: any,
    @Body() createProductDto: CreateProductDto
  ) {
    try {
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
    } catch (e) {
      this.logger.error(e, ProductionController)
    }
  }

  @Post('update')
  async updateProduction() {}

  @Post('remove')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async removeProduction(@Body() prodControlDto: ProdControlDto) {
    return await this.productionService.removeProduct(
      BigInt(prodControlDto.postId)
    )
  }

  @Post('delete')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async deleteProduction(@Body() prodControlDto: ProdControlDto) {
    return await this.productionService.deleteProduct(
      BigInt(prodControlDto.postId)
    )
  }
}
