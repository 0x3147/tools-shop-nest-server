import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Permission } from './permission.entity'

@Entity({
  name: 'tools_shop_user_roles'
})
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    length: 20,
    comment: '角色名'
  })
  name: string

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission_relation'
  })
  permissions: Permission[]
}