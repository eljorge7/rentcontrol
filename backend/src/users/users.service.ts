import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getSubscriptionStatus(userId: string, role: string, email: string): Promise<string> {
    let status = 'ACTIVE';
    if (role === 'OWNER' || role === 'MANAGER') {
      const sub = await this.prisma.userSubscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (sub) status = sub.status;
    } else if (role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({ where: { email } });
      if (tenant && tenant.ownerId) {
        const sub = await this.prisma.userSubscription.findFirst({
          where: { userId: tenant.ownerId },
          orderBy: { createdAt: 'desc' }
        });
        if (sub) status = sub.status;
      }
    }
    return status;
  }
}
