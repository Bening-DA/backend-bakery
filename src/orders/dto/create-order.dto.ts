import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID produk yang dipesan' })
  @IsInt()
  productId!: number;

  @ApiProperty({ example: 2, description: 'Jumlah item' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'ORD-001', description: 'Kode unik pesanan' })
  @IsString()
  orderCode!: string;

  @ApiPropertyOptional({ example: 'Tolong dikemas rapi' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Daftar item pesanan',
    example: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}