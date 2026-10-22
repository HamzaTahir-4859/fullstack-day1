import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Bio cannot exceed 200 characters' })
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}