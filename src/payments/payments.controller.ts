import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.KASIR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Proses pembayaran pesanan (KASIR / ADMIN)' })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KASIR)
  @ApiOperation({ summary: 'Lihat semua riwayat pembayaran' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('report/daily')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Laporan penjualan harian (ADMIN)' })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2025-05-27',
    description: 'Format: YYYY-MM-DD. Kosongkan untuk hari ini.',
  })
  getDailyReport(@Query('date') date?: string) {
    return this.paymentsService.getDailyReport(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail satu pembayaran' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}