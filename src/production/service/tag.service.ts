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
import { CreateTagDto } from '../dto/create-tag.dto'
import { UpdateTagDto } from '../dto/update-tag.dto'
import { Tag } from '../entity/tag.entity'

@Injectable()
export class TagService {
  @InjectRepository(Tag)
  private readonly tagRepository: Repository<Tag>

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: Logger

  @Inject(SnowFlakeService)
  private snowFlakeService: SnowFlakeService

  async create(createTagDto: CreateTagDto) {
    const { name } = createTagDto

    const existingTag = await this.tagRepository.findOneBy({ name })

    if (existingTag) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TAG_ALREADY_EXISTS,
        ToolsShopExceptionEnumDesc.TAG_ALREADY_EXISTS
      )
    }

    try {
      const newTag = new Tag()
      newTag.postId = await this.snowFlakeService.nextId()
      newTag.name = name

      await this.tagRepository.save(newTag)

      return 'tag创建成功'
    } catch (e) {
      this.logger.error(e, TagService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CREATE_TAG_FAIL,
        ToolsShopExceptionEnumDesc.CREATE_TAG_FAIL
      )
    }
  }

  async update(updateTagDto: UpdateTagDto) {
    const { postId, name } = updateTagDto

    const tag = await this.findTagByPostId(postId)

    try {
      tag.name = name

      await this.tagRepository.save(tag)

      return 'tag更新成功'
    } catch (e) {
      this.logger.error(e, TagService)
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.CREATE_TAG_FAIL,
        ToolsShopExceptionEnumDesc.CREATE_TAG_FAIL
      )
    }
  }

  async delete(updateTagDto: UpdateTagDto) {
    const { postId } = updateTagDto

    await this.findTagByPostId(postId)

    const res = await this.tagRepository.delete({ postId })

    if (res.affected === 0) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TAG_HAS_REFERENCE,
        ToolsShopExceptionEnumDesc.TAG_HAS_REFERENCE
      )
    }

    return 'tag删除成功'
  }

  async findTagByPostId(postId: number | bigint) {
    const tag = await this.tagRepository.findOne({
      where: { postId },
      relations: ['products']
    })

    if (!tag) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TAG_ALREADY_EXISTS,
        ToolsShopExceptionEnumDesc.TAG_ALREADY_EXISTS
      )
    }

    if (tag.products && tag.products.length > 0) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TAG_HAS_REFERENCE,
        ToolsShopExceptionEnumDesc.TAG_HAS_REFERENCE
      )
    }

    return tag
  }
}
