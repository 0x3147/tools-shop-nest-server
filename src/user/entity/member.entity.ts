import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { MemberType } from '../../common/member'
import { User } from './user.entity'

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: MemberType,
    default: MemberType.COMMON,
    nullable: true,
    comment: '会员类型'
  })
  memberType: string

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
