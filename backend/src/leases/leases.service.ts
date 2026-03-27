import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';

@Injectable()
export class LeasesService {
  constructor(
    private prisma: PrismaService,
    private mikrotikService: MikrotikService
  ) {}

  async create(createLeaseDto: CreateLeaseDto) {
    // Verificar si el local ya está ocupado
    const unit = await this.prisma.unit.findUnique({
      where: { id: createLeaseDto.unitId },
    });

    if (!unit) {
      throw new NotFoundException('Unidad/Local no encontrado');
    }

    if (unit.isOccupied) {
      throw new BadRequestException('El Local ya está ocupado por otro contrato activo.');
    }

    // Separamos el depositAmount del objeto a insertar, porque no existe en la tabla Lease.
    const { depositAmount, ...leaseData } = createLeaseDto;

    // Cuando creamos un contrato, marcamos el local como ocupado (opcional/buena práctica)
    const lease = await this.prisma.lease.create({
      data: {
        ...leaseData,
        startDate: new Date(createLeaseDto.startDate),
        endDate: createLeaseDto.endDate ? new Date(createLeaseDto.endDate) : null,
      },
    });

    await this.prisma.unit.update({
      where: { id: createLeaseDto.unitId },
      data: { isOccupied: true },
    });

    // Generar cargo de Renta (Mes 1)
    await this.prisma.charge.create({
      data: {
        leaseId: lease.id,
        amount: leaseData.rentAmount,
        type: 'RENT',
        description: 'Cargo Inicial - Primer mes de Renta',
        dueDate: new Date(),
        status: 'PENDING'
      }
    });

    // Generar cargo de Depósito, si hubo un monto especificado mayor a 0
    if (depositAmount && depositAmount > 0) {
      await this.prisma.charge.create({
        data: {
          leaseId: lease.id,
          amount: Number(depositAmount),
          type: 'OTHER',
          description: 'Depósito en Garantía Inicial',
          dueDate: new Date(),
          status: 'PENDING'
        }
      });
    }

    return lease;
  }

  findAll() {
    return this.prisma.lease.findMany({
      include: {
        unit: { include: { property: true } },
        tenant: true,
        services: { include: { profile: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.lease.findUnique({
      where: { id },
      include: {
        unit: { include: { property: true } },
        tenant: true,
        charges: true,
        services: { include: { profile: true } },
      },
    });
  }

  update(id: string, updateLeaseDto: UpdateLeaseDto) {
    return this.prisma.lease.update({
      where: { id },
      data: {
        ...updateLeaseDto,
        startDate: updateLeaseDto.startDate ? new Date(updateLeaseDto.startDate) : undefined,
        endDate: updateLeaseDto.endDate ? new Date(updateLeaseDto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    const lease = await this.prisma.lease.findUnique({ where: { id } });
    
    if (!lease) {
      throw new NotFoundException('Contrato no encontrado');
    }

    await this.prisma.lease.delete({
      where: { id },
    });

    // Liberar la unidad
    await this.prisma.unit.update({
      where: { id: lease.unitId },
      data: { isOccupied: false },
    });

    return { success: true };
  }

  async terminate(id: string) {
    const lease = await this.prisma.lease.findUnique({ where: { id } });
    
    if (!lease) {
      throw new NotFoundException('Contrato no encontrado');
    }

    if (lease.status === 'TERMINATED') {
      throw new BadRequestException('El contrato ya se encuentra finalizado');
    }

    // Actualizar el estado del contrato y la fecha de finalización
    const terminatedLease = await this.prisma.lease.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        endDate: new Date(), // Fecha actual como fin
      },
    });

    // Cancelar cargos pendientes vinculados a este contrato
    await this.prisma.charge.updateMany({
      where: { leaseId: id, status: 'PENDING' },
      data: { status: 'CANCELLED' }
    });

    // Liberar la unidad
    await this.prisma.unit.update({
      where: { id: lease.unitId },
      data: { isOccupied: false },
    });

    return terminatedLease;
  }

  async addService(leaseId: string, data: { networkProfileId: string, ipAddress?: string, macAddress?: string, pppoeUser?: string, pppoePassword?: string }) {
    const lease: any = await this.prisma.lease.findUnique({ 
      where: { id: leaseId },
      include: { unit: { include: { property: { include: { routers: true } as any } } }, tenant: true, services: true }
    });
    
    if (!lease) throw new NotFoundException('Contrato no encontrado');

    // Validación 1: Evitar que el contrato tenga más de 1 servicio de internet (activo o suspendido)
    if (lease.services && lease.services.length > 0) {
      throw new BadRequestException('El contrato ya tiene un servicio de internet asignado. Elimínelo primero antes de agregar uno nuevo.');
    }

    const service: any = await this.prisma.leaseService.create({
      data: {
        leaseId,
        networkProfileId: data.networkProfileId,
        ipAddress: data.ipAddress || null,
        macAddress: data.macAddress || null,
        pppoeUser: data.pppoeUser,
        pppoePassword: data.pppoePassword,
        status: 'ACTIVE'
      } as any,
      include: { profile: true } as any
    });

    // Inyectar regla real en el Router Mikrotik asociado a la propiedad
    const routers = (lease as any).unit.property.routers;
    if (routers && routers.length > 0) {
      const router = routers.find((r: any) => r.isActive) || routers[0];
      const profile = service.profile;
      
      try {
        if (data.pppoeUser) {
          await this.mikrotikService.createPppSecret(
            router.id,
            data.pppoeUser,
            data.pppoePassword || '',
            profile.name
          );
        } else if (data.ipAddress) {
          await this.mikrotikService.createSimpleQueue(
            router.id,
            `${lease.tenant.name.replace(/\s+/g,'_')}-${profile.name.replace(/\s+/g,'_')}`,
            data.ipAddress,
            profile.downloadSpeed,
            profile.uploadSpeed
          );
        }
      } catch (e: any) {
        console.error("No se pudo aprovisionar el Mikrotik automáticamente:", e.message);
        // Podríamos en un futuro actualizar el status del servicio a 'FAILED_PROVISION'
      }
    }

    return service;
  }

  async updateServiceStatus(serviceId: string, status: string) {
    const service: any = await this.prisma.leaseService.findUnique({
      where: { id: serviceId },
      include: { lease: { include: { unit: { include: { property: { include: { routers: true } as any } } } } } }
    });

    if (!service) throw new NotFoundException('Servicio no encontrado');

    const updated = await this.prisma.leaseService.update({
      where: { id: serviceId },
      data: { status }
    });

    // Mikrotik Sync
    const routers = (service as any).lease.unit.property.routers;
    if (routers && routers.length > 0 && service.pppoeUser) {
      const activeRouter = routers.find((r: any) => r.isActive) || routers[0];
      try {
        if (status === 'SUSPENDED') {
          await this.mikrotikService.suspendPppSecret(activeRouter.id, service.pppoeUser);
        } else if (status === 'ACTIVE') {
          await this.mikrotikService.restorePppSecret(activeRouter.id, service.pppoeUser);
        }
      } catch (e: any) {
        console.error("Error sincronizando estado de servicio con Mikrotik PPPoE:", e.message);
      }
    }

    return updated;
  }

  async updateServiceProfile(serviceId: string, networkProfileId: string) {
    const service: any = await this.prisma.leaseService.findUnique({
      where: { id: serviceId },
      include: { lease: { include: { unit: { include: { property: { include: { routers: true } as any } } } } } }
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    const newProfile = await this.prisma.networkProfile.findUnique({ where: { id: networkProfileId } });
    if (!newProfile) throw new NotFoundException('Perfil no encontrado');

    const updated = await this.prisma.leaseService.update({
      where: { id: serviceId },
      data: { networkProfileId }
    });

    // Mikrotik Sync
    const routers = (service as any).lease.unit.property.routers;
    if (routers && routers.length > 0 && service.pppoeUser) {
      const activeRouter = routers.find((r: any) => r.isActive) || routers[0];
      try {
        await this.mikrotikService.updatePppSecretProfile(activeRouter.id, service.pppoeUser, newProfile.name);
      } catch (e: any) {
        console.error("Error sincronizando actualización de perfil PPPoE con Mikrotik:", e.message);
      }
    }

    return updated;
  }

  async removeService(serviceId: string) {
    const service: any = await this.prisma.leaseService.findUnique({
      where: { id: serviceId },
      include: { lease: { include: { unit: { include: { property: { include: { routers: true } as any } } } } } }
    });

    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Desvincular de Base de datos
    await this.prisma.leaseService.delete({ where: { id: serviceId } });

    // Mikrotik Sync: Eliminar PPP Secret
    const routers = (service as any).lease.unit.property.routers;
    if (routers && routers.length > 0 && service.pppoeUser) {
      const activeRouter = routers.find((r: any) => r.isActive) || routers[0];
      try {
        await this.mikrotikService.removePppSecret(activeRouter.id, service.pppoeUser);
      } catch (e: any) {
        console.error("Error removiendo servicio PPPoE en Mikrotik manualmente:", e.message);
      }
    }

    return { success: true };
  }

  async updateSignatures(id: string, tenantSignatureBase64?: string, managerSignatureBase64?: string) {
    const updateData: any = {};
    const fs = require('fs');
    const path = require('path');
    const dir = './uploads/signatures';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    if (tenantSignatureBase64) {
      const base64Data = tenantSignatureBase64.replace(/^data:image\/png;base64,/, "");
      const filename = `lease_${id}_tenant_${Date.now()}.png`;
      fs.writeFileSync(path.join(dir, filename), base64Data, 'base64');
      updateData.tenantSignatureUrl = `/uploads/signatures/${filename}`;
    }

    if (managerSignatureBase64) {
      const base64Data = managerSignatureBase64.replace(/^data:image\/png;base64,/, "");
      const filename = `lease_${id}_manager_${Date.now()}.png`;
      fs.writeFileSync(path.join(dir, filename), base64Data, 'base64');
      updateData.managerSignatureUrl = `/uploads/signatures/${filename}`;
    }

    if (Object.keys(updateData).length > 0) {
      return this.prisma.lease.update({
        where: { id },
        data: updateData
      });
    }
    return this.prisma.lease.findUnique({ where: { id } });
  }
}
