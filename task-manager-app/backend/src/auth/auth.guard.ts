import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Extend the Express Request interface so TypeScript knows 'user' exists
export interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    // 1. Test Case: Unauthorized Access (No token provided)
    if (!token) {
      throw new UnauthorizedException('Unauthorized access: Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-2026',
      });
      // Attach the decoded user payload to the request object
      request.user = payload;
    } catch (error: any) {
      // 2. Test Case: Expired Token
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Session expired: Your access token has expired');
      }
      // 3. Test Case: Invalid / Tampered Token
      throw new UnauthorizedException('Invalid token: Signature verification failed');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}