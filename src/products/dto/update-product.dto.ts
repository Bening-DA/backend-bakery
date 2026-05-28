import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Roti Coklat Keju' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 18000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'Roti dengan isian coklat dan keju' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  categoryId?: number;
}