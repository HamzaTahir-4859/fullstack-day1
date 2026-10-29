import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const adminEmail = 'admin@kodex.com';
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'System Admin',
          bio: 'Administrator Account',
          role: 'admin',
        } as any,
      });
      this.logger.log('Default Admin seeded -> Email: admin@kodex.com | Pass: admin123');
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: any = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? 'Hamza',
        bio: user.bio ?? 'Full-Stack Developer',
        avatar: user.avatar ?? null,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user: any = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? 'Hamza',
        bio: user.bio ?? 'Full-Stack Developer',
        avatar: user.avatar ?? null,
        role: user.role,
      },
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user: any = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Access denied: This account does not have Admin privileges');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Admin login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? 'System Admin',
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user: any = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? 'Hamza',
      bio: user.bio ?? 'Full-Stack Developer',
      avatar: user.avatar ?? null,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const updatedUser: any = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.name !== undefined && { name: updateProfileDto.name }),
        ...(updateProfileDto.bio !== undefined && { bio: updateProfileDto.bio }),
        ...(updateProfileDto.avatar !== undefined && { avatar: updateProfileDto.avatar }),
      } as any,
    });

    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    };
  }

  // USER PAYMENT: Send payment to Admin
  async createPayment(
    userId: number,
    dto: { amount: number; method?: string; description?: string },
  ) {
    const payment = await (this.prisma as any).payment.create({
      data: {
        userId: Number(userId),
        amount: Number(dto.amount),
        method: dto.method || 'Card',
        description: dto.description || 'Payment to Admin',
        status: 'completed',
      },
      include: { user: true },
    });

    return {
      message: 'Payment sent to Admin successfully!',
      payment,
    };
  }

  // USER PAYMENT HISTORY
  async getUserPayments(userId: number) {
    return (this.prisma as any).payment.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ADMIN ONLY: Get all users, tasks (with creator info), and payments
  async getAdminDashboardData() {
    const users: any[] = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const tasks: any[] = await this.prisma.task.findMany({
      include: { category: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    const payments: any[] = await (this.prisma as any).payment.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      stats: {
        totalUsers: users.length,
        totalAdmins: users.filter((u) => u.role === 'admin').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        totalRevenue,
      },
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name ?? 'User',
        role: u.role,
        createdAt: u.createdAt,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        userId: t.userId,
        userName: t.user?.name || 'Unknown User',
        userEmail: t.user?.email || 'Unassigned',
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
        userName: p.user?.name || 'User',
        userEmail: p.user?.email || '',
      })),
    };
  }

  async updateUserRole(targetUserId: number, role: string) {
    const updated: any = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });
    return {
      message: `User role updated to ${role}`,
      user: { id: updated.id, email: updated.email, role: updated.role },
    };
  }

  async deleteUser(targetUserId: number) {
    await this.prisma.user.delete({
      where: { id: targetUserId },
    });
    return { message: 'User deleted successfully' };
  }
}