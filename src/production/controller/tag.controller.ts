import { Controller, Inject, Post } from '@nestjs/common'
import { RequireLogin, RequirePermissions } from '../../common/custom.decorator'
import { PermissionCode } from '../../common/permission'
import { CreateTagDto } from '../dto/create-tag.dto'
import { FindTagDto } from '../dto/find-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'
import { TagService } from '../service/tag.service'

@Controller('tag')
export class TagController {
  @Inject(TagService)
  private tagService: TagService

  @Post('list')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async getTagList(findTagDto: FindTagDto) {
    return await this.tagService.findTags(findTagDto)
  }

  @Post('create')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async create(createTagDto: CreateTagDto) {
    return await this.tagService.create(createTagDto)
  }

  @Post('update')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async update(updateTagDto: UpdateTagDto) {
    return await this.tagService.update(updateTagDto)
  }

  @Post('delete')
  @RequireLogin()
  @RequirePermissions(PermissionCode.HAVE_ALL_PERMISSIONS)
  async delete(updateTagDto: UpdateTagDto) {
    return await this.tagService.delete(updateTagDto)
  }
}
