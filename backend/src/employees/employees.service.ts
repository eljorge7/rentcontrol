import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: any) {
    const { name, email, password, role, ...profileData } = createEmployeeDto;
    
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: password || 'defaultpass123',
        role: role || 'EMPLOYEE',
        employeeProfile: {
          create: profileData
        }
      },
      include: {
        employeeProfile: true
      }
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { employeeProfile: true }
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id },
      include: { employeeProfile: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, updateEmployeeDto: any) {
    const { name, email, isActive, ...profileData } = updateEmployeeDto;
    
    return this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        isActive,
        employeeProfile: {
          update: profileData
        }
      },
      include: { employeeProfile: true }
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }
}
