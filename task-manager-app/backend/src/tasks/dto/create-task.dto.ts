import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed']) 
  status?: string;

  @IsString()
  @IsOptional()
  categoryName?: string; 
}