import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Day 26: User Registration with Password Hashing
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save user in DB
    const user: any = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    this.logger.log(`Registered new user: ${user.email}`);

    // Return user info WITHOUT the password
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

  // Day 26 & 27: User Login & JWT Access Token Generation
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user: any = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate JWT Access Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`User logged in: ${user.email}`);

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

  // Day 32: Get User Profile from Database
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

  // Day 32: Update User Profile (Name, Bio, and Profile Picture)
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User profile not found');
    }

    const updatedUser: any = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.name !== undefined && { name: updateProfileDto.name }),
        ...(updateProfileDto.bio !== undefined && { bio: updateProfileDto.bio }),
        ...(updateProfileDto.avatar !== undefined && { avatar: updateProfileDto.avatar }),
      } as any,
    });

    this.logger.log(`Updated profile for user ID ${userId}`);

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
}