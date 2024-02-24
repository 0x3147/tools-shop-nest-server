import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Member } from './member.entity'

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

  @OneToOne(() => Member, (member) => member.user, {
    cascade: true // 启用级联操作（例如，当保存用户时自动保存会员信息）
  })
  @JoinColumn()
  member: Member

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date
}
