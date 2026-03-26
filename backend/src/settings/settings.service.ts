import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    return (this.prisma as any).systemSetting.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async getValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await (this.prisma as any).systemSetting.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
  }

  async getMultiple(keys: string[]) {
    const settings = await (this.prisma as any).systemSetting.findMany({
      where: { key: { in: keys } }
    });
    const result: Record<string, string> = {};
    settings.forEach((s: any) => { result[s.key] = s.value; });
    return result;
  }

  async upsertBulk(settingsData: Record<string, string>) {
    const keys = Object.keys(settingsData);
    for (const key of keys) {
      const isSecret = key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASSWORD');
      
      await (this.prisma as any).systemSetting.upsert({
        where: { key },
        update: { value: settingsData[key] },
        create: {
          key,
          value: settingsData[key],
          isSecret,
          description: `Configuración de ${key}`
        }
      });
    }
    
    this.logger.log(`Settings updated: ${keys.join(', ')}`);
    return { message: 'Ajustes guardados correctamente', keysUpdated: keys.length };
  }
}
