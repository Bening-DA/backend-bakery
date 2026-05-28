import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'ID order yang akan dibayar' })
  @IsInt()
  orderId!: number;

  @ApiProperty({ example: 50000, description: 'Nominal uang yang dibayarkan' })
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiProperty({
    example: 'CASH',
    description: 'Metode pembayaran: CASH, QRIS, DEBIT, dll',
  })
  @IsString()
  @IsNotEmpty()
  method!: string;
}