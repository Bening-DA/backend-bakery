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

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lihat semua riwayat pembayaran (ADMIN)' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('report/daily')
  @ApiOperation({ summary: 'Laporan penjualan harian (ADMIN)' })
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-05-30',
    description: 'Format: YYYY-MM-DD. Kosongkan untuk hari ini.',
  })
  getDailyReport(@Query('date') date?: string) {
    return this.paymentsService.getDailyReport(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail satu pembayaran (ADMIN)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}
