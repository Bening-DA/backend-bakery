import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.DIPROSES,
    description: 'Status pesanan: PENDING | DIPROSES | SIAP | SELESAI',
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}