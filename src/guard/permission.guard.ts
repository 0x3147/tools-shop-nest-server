import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if (!request.user) {
      return true
    }

    const permissions = request.user.permissions

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'require-permission',
      [context.getClass(), context.getHandler()]
    )

    if (!requiredPermissions) {
      return true
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i]
      const found = permissions.find((item) => item.code === curPermission)
      if (!found) {
        throw new ToolsShopException(
          ToolsShopExceptionEnumCode.PERMISSION_DENIED,
          ToolsShopExceptionEnumDesc.PERMISSION_DENIED
        )
      }
    }

    return true
  }
}
