import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { PERMISSIONS_KEY } from '../common/custom.decorator'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler()
    )
    if (!requiredPermissions) {
      return true // 如果没有设置所需权限，则默认允许访问
    }

    const request = context.switchToHttp().getRequest()
    const userPermissions = request.body.permissions // 从请求体中获取权限

    if (!userPermissions) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.PERMISSION_DENIED,
        ToolsShopExceptionEnumDesc.PERMISSION_DENIED
      )
    }

    // 检查请求中的权限是否包含所需权限
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.PERMISSION_DENIED,
        ToolsShopExceptionEnumDesc.PERMISSION_DENIED
      )
    }

    return true
  }
}
