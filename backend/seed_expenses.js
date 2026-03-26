const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // 1. Get or create Owner
  const hashedPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@rentcontrol.com' },
    update: {},
    create: {
      email: 'owner@rentcontrol.com',
      password: hashedPassword,
      name: 'Jorge (Propietario)',
      role: 'OWNER',
      isActive: true,
    },
  });

  // 2. Create Test Property linked to Owner
  const property = await prisma.property.create({
    data: {
      name: 'Edificio Roma',
      address: 'Av. Roma 123, Col. Centro',
      ownerId: owner.id,
      units: {
        create: [
          { name: 'Apto 101', basePrice: 5000, isOccupied: false },
          { name: 'Apto 102', basePrice: 5000, isOccupied: false },
        ]
      }
    }
  });

  // 3. Create some past expenses for this property
  await prisma.expense.createMany({
    data: [
      { propertyId: property.id, amount: 1500, category: 'UTILITIES', description: 'Recibo de Agua Global' },
      { propertyId: property.id, amount: 3200, category: 'MAINTENANCE', description: 'Pintura exterior' },
      { propertyId: property.id, amount: 500, category: 'OTHER', description: 'Artículos de limpieza' },
    ]
  });

  console.log('Seeded Owner, Property, and Expenses successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
