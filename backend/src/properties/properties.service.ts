import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto, user: any) {
    if (user.role === 'OWNER') {
      createPropertyDto.ownerId = user.userId;
    }

    if (createPropertyDto.ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: createPropertyDto.ownerId }
      });
      
      if (!owner) {
        throw new NotFoundException('Propietario no encontrado');
      }

      // Check Manager Authorization
      if (user.role === 'MANAGER' && owner.managerId !== user.userId) {
        throw new UnauthorizedException('No tienes permiso para gestionar propiedades de este dueño.');
      }

      if (owner.role === 'OWNER') {
        const currentProperties = await this.prisma.property.count({
          where: { ownerId: owner.id }
        });

        let maxProps = (owner as any).maxProperties ?? 2;
        
        if (owner.managementPlanId) {
          const plan = await this.prisma.managementPlan.findUnique({
            where: { id: owner.managementPlanId }
          });
          if (plan && (plan as any).maxProperties !== undefined) {
             maxProps = (plan as any).maxProperties;
          }
        }

        if (currentProperties >= maxProps) {
          throw new BadRequestException(`Has alcanzado tu límite de ${maxProps} propiedades. Mejora tu plan actual o comunícate con tu Gestor para obtener más capacidad.`);
        }
      }
    }

    return this.prisma.property.create({
      data: createPropertyDto,
    });
  }

  findAll(user: any) {
    let whereClause: any = {};
    if (user.role === 'OWNER') {
      whereClause.ownerId = user.userId;
    } else if (user.role === 'MANAGER') {
      whereClause.owner = { managerId: user.userId };
    }

    return this.prisma.property.findMany({
      where: whereClause,
      include: {
        units: true,
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    let whereClause: any = { id };
    if (user.role === 'OWNER') {
      whereClause.ownerId = user.userId;
    } else if (user.role === 'MANAGER') {
      whereClause.owner = { managerId: user.userId };
    }

    const property = await this.prisma.property.findFirst({
      where: whereClause,
      include: { 
        units: {
          include: {
            leases: {
              where: { status: 'ACTIVE' },
              select: { id: true, rentAmount: true, tenant: { select: { name: true } } }
            }
          }
        },
        owner: { select: { id: true, name: true } },
      },
    });

    if (!property) throw new NotFoundException('Propiedad no encontrada o no autorizada');
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user); // Valida acceso
    return this.prisma.property.delete({
      where: { id },
    });
  }
}
