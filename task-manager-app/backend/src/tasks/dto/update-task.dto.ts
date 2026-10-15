import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

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