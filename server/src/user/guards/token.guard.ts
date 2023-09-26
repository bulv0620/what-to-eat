import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler());
    const guard = AuthTokenGuard.getAuthGuard(noAuth);
    return guard ? guard.canActivate(context) : true; //    执行所选策略Guard的canActivate方法
  }

  private static getAuthGuard(noAuth: boolean): IAuthGuard {
    if (noAuth) {
      return null;
    } else {
      return new (AuthGuard('jwt'))();
    }
  }
}
