import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const activate = super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    console.log(activate);
    return this.validateRequest(request) && activate;
  }
  validateRequest(request: any): boolean {
    console.log(request.user);
    // Tambahkan logika validasi kustom Anda di sini
    // Misalnya: Periksa apakah request memiliki header tertentu
    // atau apakah token memiliki hak akses khusus
    const hasValidHeader = request.headers['x-custom-header'] === 'valid';
    return hasValidHeader;
  }
}
