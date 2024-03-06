import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Role } from './role.entity'

@Entity({
  name: 'tools_shop_user'
})
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    comment: '业务id',
    type: 'bigint'
  })
  postId: number | bigint

  @Column({
    comment: '用户名',
    type: 'varchar',
    length: 50
  })
  username: string

  @Column({
    comment: '密码',
    type: 'varchar',
    length: 255
  })
  password: string

  @Column({
    comment: '邮箱',
    type: 'varchar',
    length: 255
  })
  email: string

  @Column({
    comment: '是否管理员',
    default: false
  })
  isAdmin: boolean

  @Column({
    comment: '是否冻结',
    default: false
  })
  isFrozen: boolean

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles'
  })
  roles: Role[]

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date
}
