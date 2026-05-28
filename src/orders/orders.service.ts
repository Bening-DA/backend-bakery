import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: number) {
    // 1. Cek orderCode belum dipakai
    const existing = await this.prisma.order.findUnique({
      where: { orderCode: dto.orderCode },
    });
    if (existing) {
      throw new BadRequestException('Kode pesanan sudah digunakan');
    }

    // 2. Ambil semua produk yang dipesan
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Salah satu produk tidak ditemukan');
    }

    // 3. Cek semua produk available
    const unavailable = products.filter((p) => !p.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException(
        `Produk berikut tidak tersedia: ${unavailable.map((p) => p.name).join(', ')}`,
      );
    }

    // 4. Hitung total harga
    let total = 0;
    const orderItemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const subtotal = product!.price * item.quantity;
      total += subtotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        subtotal,
      };
    });

    // 5. Buat order + items sekaligus
    const order = await this.prisma.order.create({
      data: {
        orderCode: dto.orderCode,
        note: dto.note,
        total,
        userId,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, username: true, role: true } },
      },
    });

    return order;
  }

  async findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, username: true, role: true } },
        payment: true,
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, username: true, role: true } },
        payment: true,
      },
    });
    if (!order)
      throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
      },
    });
  }
}