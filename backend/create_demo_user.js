const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function seedRentControl() {
  const url = 'postgresql://rentadmin:admin123@localhost:5432/rentcontrol?schema=public';
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const hashedPassword = await bcrypt.hash('R@diotec', 10);
    const results = await prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE email = $1`, 'eljorge7@gmail.com');
    if (results.length > 0) {
      await prisma.$executeRawUnsafe(`UPDATE "User" SET password = $1, role = CAST($2 AS "Role") WHERE email = $3`, hashedPassword, 'ADMIN', 'eljorge7@gmail.com');
      console.log(`✅ RentControl: Usuario actualizado.`);
    } else {
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, password, name, role, "isActive", "updatedAt") VALUES ($1, $2, $3, $4, CAST($5 AS "Role"), true, NOW())`,
        id, 'eljorge7@gmail.com', hashedPassword, 'Jorge Administrador', 'ADMIN'
      );
      console.log(`✅ RentControl: Usuario creado.`);
    }
  } catch(e) { console.error(`❌ Error en RentControl:`, e.message); } finally { await prisma.$disconnect(); }
}

async function seedFacturaPro() {
  const url = 'postgresql://rentadmin:admin123@localhost:5432/facturapro?schema=public';
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const hashedPassword = await bcrypt.hash('R@diotec', 10);
    
    // Buscar o crear Tenant
    let tenants = await prisma.$queryRawUnsafe(`SELECT id FROM "Tenant" WHERE name = $1`, 'MAJIA OS Demo');
    let tenantId;
    if (tenants.length === 0) {
      tenantId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(`INSERT INTO "Tenant" (id, name, "updatedAt") VALUES ($1, $2, NOW())`, tenantId, 'MAJIA OS Demo');
    } else {
      tenantId = tenants[0].id;
    }

    const results = await prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE email = $1`, 'eljorge7@gmail.com');
    if (results.length > 0) {
      await prisma.$executeRawUnsafe(`UPDATE "User" SET "passwordHash" = $1, role = $2, "tenantId" = $3 WHERE email = $4`, hashedPassword, 'ADMIN', tenantId, 'eljorge7@gmail.com');
      console.log(`✅ FacturaPro: Usuario actualizado.`);
    } else {
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, "passwordHash", name, role, "tenantId", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        id, 'eljorge7@gmail.com', hashedPassword, 'Jorge Administrador', 'ADMIN', tenantId
      );
      console.log(`✅ FacturaPro: Usuario creado en Tenant Demo.`);
    }
  } catch(e) { console.error(`❌ Error en FacturaPro:`, e.message); } finally { await prisma.$disconnect(); }
}

async function seedOmniChat() {
  const url = 'postgresql://rentadmin:admin123@localhost:5432/omnichat?schema=public';
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const hashedPassword = await bcrypt.hash('R@diotec', 10);
    
    // Buscar o crear Company
    let companies = await prisma.$queryRawUnsafe(`SELECT id FROM "Company" WHERE name = $1`, 'MAJIA OS Demo');
    let companyId;
    if (companies.length === 0) {
      companyId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(`INSERT INTO "Company" (id, name, "updatedAt") VALUES ($1, $2, NOW())`, companyId, 'MAJIA OS Demo');
    } else {
      companyId = companies[0].id;
    }

    const results = await prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE email = $1`, 'eljorge7@gmail.com');
    if (results.length > 0) {
      await prisma.$executeRawUnsafe(`UPDATE "User" SET password = $1, role = $2, "companyId" = $3 WHERE email = $4`, hashedPassword, 'ADMIN', companyId, 'eljorge7@gmail.com');
      console.log(`✅ OmniChat: Usuario actualizado.`);
    } else {
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, password, name, role, "companyId", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        id, 'eljorge7@gmail.com', hashedPassword, 'Jorge Administrador', 'ADMIN', companyId
      );
      console.log(`✅ OmniChat: Usuario creado en Company Demo.`);
    }
  } catch(e) { console.error(`❌ Error en OmniChat:`, e.message); } finally { await prisma.$disconnect(); }
}

async function main() {
  console.log("Iniciando creación de cuenta One-ID en todo el ecosistema...");
  await seedRentControl();
  await seedFacturaPro();
  await seedOmniChat();
  console.log("Proceso terminado exitosamente.");
}

main();
