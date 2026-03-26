import { Injectable } from '@nestjs/common';
import { CreateNetworkProfileDto } from './dto/create-network-profile.dto';
import { UpdateNetworkProfileDto } from './dto/update-network-profile.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkProfilesService {
  constructor(private prisma: PrismaService) {}

  create(createNetworkProfileDto: CreateNetworkProfileDto) {
    return this.prisma.networkProfile.create({
      data: createNetworkProfileDto,
    });
  }

  findAll() {
    return this.prisma.networkProfile.findMany();
  }

  findOne(id: string) {
    return this.prisma.networkProfile.findUnique({
      where: { id }
    });
  }

  update(id: string, updateNetworkProfileDto: UpdateNetworkProfileDto) {
    return this.prisma.networkProfile.update({
      where: { id },
      data: updateNetworkProfileDto,
    });
  }

  remove(id: string) {
    return this.prisma.networkProfile.delete({
      where: { id }
    });
  }
}
