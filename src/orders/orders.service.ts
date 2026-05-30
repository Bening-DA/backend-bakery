import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: number) {
    const orderCode = 'ORD-' + Date.now();
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new NotFoundException('Salah satu produk tidak ditemukan');
    }
    const unavailable = products.filter((p) => !p.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        'Produk tidak tersedia: ' + unavailable.map((p) => p.name).join(', '),
      );
    }
    let total = 0;
    const orderItemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException('Produk tidak ditemukan');
      const subtotal = product.price * item.quantity;
      total += subtotal;
      return { productId: item.productId, quantity: item.quantity, subtotal };
    });
    const order = await this.prisma.order.create({
      data: {
        orderCode,
        customerName: dto.customerName,
        tableNumber: dto.tableNumber,
        note: dto.note,
        total,
        status: OrderStatus.PENDING,
        userId,
        items: { create: orderItemsData },
        payment: {
          create: {
            amount: total,
            change: 0,
            method: dto.paymentMethod as PaymentMethod,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, fullName: true, email: true, role: true } },
        payment: true,
      },
    });
    return { message: 'Order berhasil dibuat', data: order };
  }

  async findAll(status?: OrderStatus, search?: string) {
    return this.prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search ? { customerName: { contains: search } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, fullName: true, email: true, role: true } },
        payment: true,
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, fullName: true, email: true, role: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order id ' + id + ' tidak ditemukan');
    return order;
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });
  }

  async getStats() {
    const totalOrders = await this.prisma.order.count();
    const pendingOrders = await this.prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });
    const revenueData = await this.prisma.payment.aggregate({
      _sum: { amount: true },
    });
    return {
      totalOrders,
      pendingOrders,
      revenue: revenueData._sum.amount || 0,
    };
  }
}
