import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Product } from './product.entity'

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    comment: '业务id',
    type: 'bigint'
  })
  postId: number | bigint

  @Column({ type: 'varchar', length: 255 })
  name: string

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
