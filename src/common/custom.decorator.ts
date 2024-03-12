import { SetMetadata } from '@nestjs/common'

export const RequireLogin = () => SetMetadata('require-login', true)

export const PERMISSIONS_KEY = 'permissions'
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
