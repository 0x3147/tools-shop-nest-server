import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { ToolsShopException } from '../exception/toolsShopException'
import {
  ToolsShopExceptionEnumCode,
  ToolsShopExceptionEnumDesc
} from '../exception/toolsShopExceptionEnum'

interface JwtUserData {
  postId: number | bigint
  username: string
  member: boolean
}

declare module 'express' {
  interface Request {
    user: JwtUserData
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector

  @Inject(JwtService)
  private jwtService: JwtService
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler()
    ])

    if (!requireLogin) {
      return true
    }

    const authorization = request.headers.authorization

    if (!authorization) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.USER_NOT_LOGIN,
        ToolsShopExceptionEnumDesc.USER_NOT_LOGIN
      )
    }

    try {
      const token = authorization.split(' ')[1]
      const data = this.jwtService.verify<JwtUserData>(token)

      request.user = {
        postId: data.postId,
        username: data.username,
        member: data.member
      }
      return true
    } catch (e) {
      throw new ToolsShopException(
        ToolsShopExceptionEnumCode.TOKEN_EXPIRED,
        ToolsShopExceptionEnumDesc.TOKEN_EXPIRED
      )
    }
  }
}
