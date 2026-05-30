import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

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
      throw new NotFoundException('Payment dengan id ' + id + ' tidak ditemukan');
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
