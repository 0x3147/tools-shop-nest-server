import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './user.entity' // 假设用户实体文件名为 user.entity.ts

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: false })
  isMember: boolean

  @Column({ nullable: true, type: 'timestamp' })
  startDate: Date

  @Column({ nullable: true, type: 'timestamp' })
  endDate: Date

  @OneToOne(() => User, (user) => user.member)
  user: User

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date
}
