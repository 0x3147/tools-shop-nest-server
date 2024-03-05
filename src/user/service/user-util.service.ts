import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'

@Injectable()
export class UserUtilService {
  calculateExpiryDate(startDate: Date, memberType: string): Date {
    const startDayjs = dayjs(startDate)
    let expiryDayjs: dayjs.Dayjs

    switch (memberType) {
      case 'MONTHLY':
        expiryDayjs = startDayjs.add(1, 'month')
        break
      case 'QUARTERLY':
        expiryDayjs = startDayjs.add(3, 'months')
        break
      case 'ANNUALLY':
        expiryDayjs = startDayjs.add(1, 'year')
        break
      default:
        throw new Error('Invalid member type')
    }

    return expiryDayjs.toDate()
  }
}
