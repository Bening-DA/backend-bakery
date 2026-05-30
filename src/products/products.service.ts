import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createCategory(name: string) {
    return this.prisma.category.create({ data: { name } });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: { products: true },
    });
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { id: 'asc' },
      include: { category: true },
    });
  }

  async findAvailable() {
    return this.prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { categoryId: 'asc' },
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product)
      throw new NotFoundException(`Produk dengan id ${id} tidak ditemukan`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: `Produk dengan id ${id} berhasil dihapus` };
  }
}