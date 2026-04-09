import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { FacturaProService } from './src/facturapro/facturapro.service';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const facturapro = app.get(FacturaProService);
  const prisma = app.get(PrismaService);
  
  console.log("Conectado a RentControl DB...");
  const payment = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' }
  });

  if (!payment) {
      console.log("No payments found");
      process.exit(1);
  }

  console.log("Testing issueInvoice for payment:", payment.id);

  try {
      const result = await facturapro.issueInvoice(payment.id);
      console.log("SUCCESS M2M -> ", result);
  } catch (error) {
      console.error("ERROR TRONÓ M2M -> ", error.message || error);
  }

  await app.close();
}

bootstrap();
