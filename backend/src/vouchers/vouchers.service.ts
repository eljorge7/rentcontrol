import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';
import { randomBytes } from 'crypto';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(private prisma: PrismaService, private mikrotik: MikrotikService) {}

  async createBatch(data: { amount: number, duration: number, price: number, routerId: string, propertyId?: string }, user: any) {
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      throw new BadRequestException('Solo los gestores pueden generar fichas.');
    }

    const { amount, duration, price, routerId, propertyId } = data;
    const router = await this.prisma.mikrotikRouter.findUnique({ where: { id: routerId } });
    if (!router || !router.isActive) {
      throw new NotFoundException('Router no encontrado o inactivo.');
    }

    const vouchers = [];
    let successCount = 0;

    for (let i = 0; i < amount; i++) {
      // Generate a 6 character random alphanumeric code
      const code = randomBytes(3).toString('hex').toUpperCase(); 
      
      try {
        // Provision in Mikrotik
        await this.mikrotik.createHotspotUser(router.id, code, code, duration, 'default');
        
        // Save in DB
        // @ts-ignore
        const voucher = await this.prisma.hotspotVoucher.create({
          data: {
            code,
            password: code,
            duration,
            price,
            routerId,
            propertyId,
            managerId: user.userId, // El Gestor que lo generó
            status: 'AVAILABLE'
          }
        });
        vouchers.push(voucher);
        successCount++;
      } catch (error: any) {
        this.logger.error(`Error generando voucher ${code}:`, error.message);
      }
    }

    return { message: `Se generaron ${successCount} fichas exitosamente de ${amount} solicitadas.`, vouchers };
  }

  findAll(user: any) {
    // @ts-ignore
    return this.prisma.hotspotVoucher.findMany({
      where: { managerId: user.userId },
      include: { router: true, property: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async remove(id: string, user: any) {
    // @ts-ignore
    const voucher = await this.prisma.hotspotVoucher.findUnique({ where: { id } });
    if (!voucher || voucher.managerId !== user.userId) {
      throw new NotFoundException('Ficha no encontrada o no autorizada.');
    }

    // Remove from Mikrotik if it was provisioned
    if (voucher.routerId) {
      try {
        await this.mikrotik.removeHotspotUser(voucher.routerId, voucher.code);
      } catch (e) {
        this.logger.warn(`No se pudo eliminar el usuario de Mikrotik para el voucher ${voucher.code}`);
      }
    }

    // @ts-ignore
    return this.prisma.hotspotVoucher.delete({ where: { id } });
  }
}
