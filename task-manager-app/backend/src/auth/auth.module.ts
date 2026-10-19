import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Makes JwtService available to AuthGuard in TasksController
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-2026',
      signOptions: { expiresIn: '1d' }, // Token expires in 1 day
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}