import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Dedicated Admin Login Route
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }

  // ADMIN PORTAL ENDPOINTS (Protected by both AuthGuard + AdminGuard)
  @UseGuards(AuthGuard, AdminGuard)
  @Get('admin/overview')
  getAdminOverview() {
    return this.authService.getAdminDashboardData();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('admin/users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.authService.updateUserRole(id, role);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('admin/users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deleteUser(id);
  }
}