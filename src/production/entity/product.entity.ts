import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column({ type: 'varchar', length: 255 })
  imageUrl: string // 商品图片链接

  @Column({ type: 'varchar', length: 255 })
  name: string // 商品名

  @Column({ type: 'varchar', length: 255 })
  description: string // 商品介绍

  @Column({ type: 'varchar', length: 255 })
  downloadUrl: string // 商品下载链接
}
