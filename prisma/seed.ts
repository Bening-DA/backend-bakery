import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Buat kategori
  const pastry = await prisma.category.upsert({
    where: { name: 'Pastry' },
    update: {},
    create: { name: 'Pastry' },
  });

  const bread = await prisma.category.upsert({
    where: { name: 'Bread' },
    update: {},
    create: { name: 'Bread' },
  });

  const beverages = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: { name: 'Beverages' },
  });

  // Buat produk
  const products = [
    { name: 'Butter Croissant', price: 15000, description: 'Buttery, flaky and perfectly golden', stock: 50, categoryId: pastry.id },
    { name: 'Danish Pastry Icing Raisins', price: 19000, description: 'Sweet Danish pastry topped with icing and juicy raisins', stock: 50, categoryId: pastry.id },
    { name: 'Danish Pastry Golden Crust', price: 19000, description: 'Flaky danish pastry with a rich golden buttery crust', stock: 50, categoryId: pastry.id },
    { name: 'Cinnamon Roll', price: 18000, description: 'Soft cinnamon roll with warm sweet cinnamon filling', stock: 50, categoryId: pastry.id },
    { name: 'Golden Swirl Pastry', price: 17000, description: 'Soft layered pastry with a sweet golden swirl', stock: 50, categoryId: pastry.id },
    { name: 'Rustic Sourdough', price: 22000, description: 'Classic artisan sourdough with a crisp crust and chewy texture', stock: 30, categoryId: bread.id },
    { name: 'Artisan Bread Golden Crust', price: 22000, description: 'Fresh artisan bread baked with a crunchy golden crust', stock: 30, categoryId: bread.id },
    { name: 'Ice Americano', price: 19000, description: 'Bold chilled espresso with a refreshing finish', stock: 100, categoryId: beverages.id },
    { name: 'Ice Cafe Latte', price: 20000, description: 'Smooth espresso blended with creamy chilled milk', stock: 100, categoryId: beverages.id },
    { name: 'Ice Matcha Latte', price: 23000, description: 'Delicious matcha latte with a creamy finish', stock: 100, categoryId: beverages.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: (await prisma.product.findFirst({ where: { name: product.name } }))?.id ?? 0 },
      update: {},
      create: { ...product, isAvailable: true },
    });
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
