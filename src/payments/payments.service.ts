import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    // 1. Cek order ada
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });
    if (!order) {
      throw new NotFoundException(
        `Order dengan id ${dto.orderId} tidak ditemukan`,
      );
    }

    // 2. Cek belum dibayar
    if (order.payment) {
      throw new BadRequestException('Order ini sudah dibayar');
    }

    // 3. Cek status order minimal DIPROSES
    if (order.status === OrderStatus.PENDING) {
      throw new BadRequestException(
        'Pesanan masih PENDING, tunggu bagian produksi konfirmasi dulu',
      );
    }

    // 4. Cek nominal cukup
    if (dto.amount < order.total) {
      throw new BadRequestException(
        `Uang kurang. Total: Rp${order.total}, Dibayar: Rp${dto.amount}`,
      );
    }

    // 5. Hitung kembalian
    const change = dto.amount - order.total;

    // 6. Simpan payment + update status order ke SELESAI
    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          orderId: dto.orderId,
          amount: dto.amount,
          change,
          method: dto.method,
        },
      }),
      this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: OrderStatus.SELESAI },
      }),
    ]);

    return {
      message: 'Pembayaran berhasil',
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        total: order.total,
        amount: dto.amount,
        change,
        method: dto.method,
        paymentId: payment.id,
        paidAt: payment.createdAt,
      },
    };
  }

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!payment)
      throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    return payment;
  }

  async getDailyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        order: {
          include: { items: { include: { product: true } } },
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.order.total, 0);
    const totalTransactions = payments.length;

    return {
      date: targetDate.toISOString().split('T')[0],
      totalTransactions,
      totalRevenue,
      payments,
    };
  }
}