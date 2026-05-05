import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfrastructureService {
  private readonly logger = new Logger(InfrastructureService.name);
  private lastCpuTimes: { idle: number, total: number } | null = null;

  constructor(private prisma: PrismaService) {}

  async getSystemHealth() {
      // 1. Hardware Metrics
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePerc = (usedMem / totalMem) * 100;
      
      const cpus = os.cpus();
      const coreCount = cpus.length;
      
      let idle = 0;
      let total = 0;
      cpus.forEach(core => {
          // Strong typing mapping to avoid TS7053
          const times = core.times as Record<string, number>;
          for (const type in times) {
              total += times[type];
          }
          idle += core.times.idle;
      });

      let cpuUsagePerc = 0;
      if (this.lastCpuTimes) {
          const idleDiff = idle - this.lastCpuTimes.idle;
          const totalDiff = total - this.lastCpuTimes.total;
          cpuUsagePerc = 100 - Math.round(100 * idleDiff / totalDiff);
      }
      this.lastCpuTimes = { idle, total };

      const processMem = process.memoryUsage();
      const nodeUptimeSec = process.uptime();
      const osUptimeSec = os.uptime();

      // 2. RentControl Internal DB Ping
      const startDb = Date.now();
      let dbStatus = 'ONLINE';
      let dbLatency = 0;
      try {
          await this.prisma.$queryRaw`SELECT 1`;
          dbLatency = Date.now() - startDb;
      } catch(e) {
          dbStatus = 'OFFLINESQL';
      }

      // 3. Ping External Microservices using global.fetch (Native Node)
      // FacturaPro runs on 3004
      let facStatus = 'OFFLINE';
      let facLatency = 0;
      const startFac = Date.now();
      try {
          const res = await fetch('http://localhost:3004/api/health', { signal: AbortSignal.timeout(2000) });
          facStatus = 'ONLINE'; // As long as it responds, even if 404
      } catch(e) { }
      finally {
          facLatency = Date.now() - startFac;
      }

      // OmniChat runs on 3003
      let omniStatus = 'OFFLINE';
      let omniLatency = 0;
      const startOmni = Date.now();
      try {
          const res = await fetch('http://localhost:3003/api/health', { signal: AbortSignal.timeout(2000) });
          omniStatus = 'ONLINE';
      } catch(e) { }
      finally {
          omniLatency = Date.now() - startOmni;
      }

      return {
          timestamp: new Date().toISOString(),
          hardware: {
              cpuUsagePerc: Math.max(0, cpuUsagePerc),
              coreCount,
              memUsagePerc: Math.round(memUsagePerc),
              totalMemGB: (totalMem / 1024 / 1024 / 1024).toFixed(2),
              usedMemGB: (usedMem / 1024 / 1024 / 1024).toFixed(2),
              osUptimeSec,
              nodeUptimeSec,
              processMemMB: (processMem.rss / 1024 / 1024).toFixed(2)
          },
          services: {
              rentControl: {
                  status: dbStatus,
                  latencyMs: dbLatency,
                  label: "RentControl (Máster)"
              },
              omniChat: {
                  status: omniStatus,
                  latencyMs: omniLatency,
                  label: "OmniChat (IA)"
              },
              facturaPro: {
                  status: facStatus,
                  latencyMs: facLatency,
                  label: "FacturaPro (ERP)"
              }
          }
      };
  }
}
