import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token required');
    try {
      req.user = jwt.verify(token, this.config.get('JWT_SECRET') || 'dev-only-change-me');
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired token'); }
  }
}
