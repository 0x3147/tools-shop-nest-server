import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RegisterUserDto } from '../dto/registerUser.dto'
import { User } from '../entity/user.entity'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  async register(user: RegisterUserDto) {}
}
