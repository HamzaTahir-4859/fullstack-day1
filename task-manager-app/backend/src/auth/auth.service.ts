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

  // Automatically creates a default Admin account when the server starts
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

  // Day 26: User Registration
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

  // Day 26 & 27: Regular User Login
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

  // Dedicated Admin Login (Rejects regular users with 403 Forbidden)
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

  // Day 32: Get User Profile
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

  // Day 32: Update User Profile
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

  // ADMIN ONLY: Get all users and all system tasks
  async getAdminDashboardData() {
    const users: any[] = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const tasks = await this.prisma.task.findMany({
      include: { category: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      stats: {
        totalUsers: users.length,
        totalAdmins: users.filter((u) => u.role === 'admin').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
      },
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name ?? 'User',
        role: u.role,
        createdAt: u.createdAt,
      })),
      tasks,
    };
  }

  // ADMIN ONLY: Change a user's role (user <-> admin)
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

  // ADMIN ONLY: Delete a user account
  async deleteUser(targetUserId: number) {
    await this.prisma.user.delete({
      where: { id: targetUserId },
    });
    return { message: 'User deleted successfully' };
  }
}