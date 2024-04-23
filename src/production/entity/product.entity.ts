import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Tag } from './tag.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    comment: '业务id',
    type: 'bigint'
  })
  postId: number | bigint

  @Column({ default: false })
  isArchived: boolean // 商品是否被下架

  @Column({ default: false })
  isFree: boolean

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string // 商品图片链接

  @Column({ type: 'varchar', length: 255 })
  name: string // 商品名

  @Column({ type: 'varchar', length: 255 })
  description: string // 商品介绍

  @Column({ type: 'varchar', length: 255 })
  downloadUrl: string // 商品下载链接

  @ManyToMany(() => Tag, (tag) => tag.products)
  @JoinTable({
    name: 'product_tags'
  })
  tags: Tag[]

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date
}
