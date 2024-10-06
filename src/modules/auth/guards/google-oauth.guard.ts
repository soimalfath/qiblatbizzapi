import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(private readonly requiredRoles: string[] = []) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    // info: any,
    // context: ExecutionContext,
    // status?: any,
  ) {
    // console.log(info, context, status);
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    // Check if user has required roles
    if (
      this.requiredRoles.length &&
      !this.requiredRoles.some((role) => user.roles.includes(role))
    ) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return user;
  }
}
