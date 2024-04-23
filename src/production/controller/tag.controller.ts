import { Controller, Inject, Post } from '@nestjs/common'
import { CreateTagDto } from '../dto/create-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'
import { TagService } from '../service/tag.service'

@Controller('tag')
export class TagController {
  @Inject(TagService)
  private tagService: TagService

  @Post('create')
  async create(createTagDto: CreateTagDto) {
    return await this.tagService.create(createTagDto)
  }

  @Post('update')
  async update(updateTagDto: UpdateTagDto) {
    return await this.tagService.update(updateTagDto)
  }

  @Post('delete')
  async delete(updateTagDto: UpdateTagDto) {
    return await this.tagService.delete(updateTagDto)
  }
}
