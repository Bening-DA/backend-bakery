import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Roti Coklat' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'Roti dengan isian coklat lembut' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ example: 1, description: 'ID kategori produk' })
  @IsInt()
  categoryId!: number;
}
