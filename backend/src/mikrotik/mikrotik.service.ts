import { Injectable, Logger } from '@nestjs/common';
import { CreateMikrotikDto } from './dto/create-mikrotik.dto';
import { UpdateMikrotikDto } from './dto/update-mikrotik.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RouterOSAPI } from 'routeros-client';

@Injectable()
export class MikrotikService {
  private readonly logger = new Logger(MikrotikService.name);

  constructor(private prisma: PrismaService) {}

  create(createMikrotikDto: CreateMikrotikDto) {
    return this.prisma.mikrotikRouter.create({
      data: createMikrotikDto,
    });
  }

  findAll() {
    return this.prisma.mikrotikRouter.findMany({
      include: { property: true } as any
    });
  }

  findOne(id: string) {
    return this.prisma.mikrotikRouter.findUnique({ where: { id } });
  }

  update(id: string, updateMikrotikDto: UpdateMikrotikDto) {
    return this.prisma.mikrotikRouter.update({
      where: { id },
      data: updateMikrotikDto,
    });
  }

  remove(id: string) {
    return this.prisma.mikrotikRouter.delete({ where: { id } });
  }

  async generateInstallScript(id: string) {
    const router = await this.findOne(id);
    if (!router) throw new Error('Router not found');

    const scriptLines = [
`# ==========================================
# RentControl Mikrotik Install Script
# Router: ${router.name}
# ==========================================

# 1. Hablitar Servicio API
/ip service set api port=${router.apiPort || 8728} disabled=no`
    ];

    if (router.vpnUser && router.vpnPassword && router.vpnHost) {
      scriptLines.push(`
# 1.5. (VPN) Restringir API local y crear Túnel SSTP a la Nube (Estilo WispHub)
/interface sstp-client remove [find where user="${router.vpnUser}"]
/interface sstp-client add comment="RentControl VPN" connect-to=${router.vpnHost} name="RentControlVPN" user="${router.vpnUser}" password="${router.vpnPassword}" profile="default" disabled=no
/system scheduler add comment="Reiniciar VPN" interval=1d name="Reconectar-VPN" on-event="/interface sstp-client disable RentControlVPN; delay 2; /interface sstp-client enable RentControlVPN;" start-date=jan/01/2000 start-time=05:00:00
`);
    }

    scriptLines.push(`
# 2. Crear Grupo de Permisos RentControl
/user group add name=rentcontrol policy=api,read,write,policy,test

# 3. Crear Usuario API
/user add name=${router.username} password="${router.password}" group=rentcontrol comment="RentControl API User"

# 4. Asignar Identidad al Router
/system identity set name="${router.name}"

# ==========================================
# IMPORTANTE: PPPOE SERVER (Manual Step)
# ==========================================
# Si usas PPPoE, asegúrate de crear el servidor PPPoE apuntando 
# a la interfaz LAN/Bridge correspondiente y asignar un IP Pool:
# /ip pool add name=pppoe-pool ranges=10.0.0.2-10.0.0.254
# /ppp profile set default local-address=10.0.0.1 remote-address=pppoe-pool
# /interface pppoe-server server add disabled=no interface=bridge-lan service-name=rentcontrol-pppoe
`);

    const script = scriptLines.join('\n').trim();

    return { script };
  }

  async testConnection(id: string) {
    try {
      const result = await this.executeCommand(id, '/system/identity/print');
      return { success: true, message: 'Conexión exitosa', data: result };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error de conexión' };
    }
  }

  /**
   * Helper function to execute a command on a Mikrotik router
   */
  async executeCommand(routerId: string, command: string, params?: object) {
    const router = await this.findOne(routerId);
    if (!router) throw new Error('Router not found');

    const targetIp = router.vpnIp || router.ipAddress;
    
    // Solo registrar si es un comando que muta datos o si no es el print de identidad normal (healthcheck)
    if (!command.includes('/system/identity/print')) {
        this.logger.log(`Connecting to Mikrotik API at ${targetIp}:${router.apiPort || 8728} issuing: ${command}`);
    }

    const api = new RouterOSAPI({
      host: targetIp,
      user: router.username,
      password: router.password,
      port: router.apiPort || 8728,
    });

    try {
      await api.connect();
      const result = params ? await api.write(command, [params as any]) : await api.write(command);
      api.close();
      return result;
    } catch (error) {
      this.logger.error(`Mikrotik Connection Error [${router.ipAddress}]:`, error);
      try { api.close(); } catch(e) {}
      throw error;
    }
  }

  /**
   * Suspends internet access for a specific IP by adding it to an address-list mapping to a drop rule
   */
  async suspendIp(routerId: string, ipAddress: string, listName: string = 'suspended-customers') {
    this.logger.log(`Suspending IP ${ipAddress} on router ${routerId}`);
    return this.executeCommand(routerId, '/ip/firewall/address-list/add', {
      address: ipAddress,
      list: listName,
      comment: 'Suspended automatically via RentControl API'
    });
  }

  /**
   * Restores internet access by removing the IP from the suspended address-list
   */
  async restoreIp(routerId: string, ipAddress: string, listName: string = 'suspended-customers') {
    this.logger.log(`Restoring IP ${ipAddress} on router ${routerId}`);
    try {
        const findResult = await this.executeCommand(routerId, '/ip/firewall/address-list/print', {
            '?address': ipAddress,
            '?list': listName
        });
        
        if (findResult && findResult.length > 0) {
            const listId = findResult[0]['.id'];
            return this.executeCommand(routerId, '/ip/firewall/address-list/remove', {
                '.id': listId
            });
        }
        return { message: 'IP not found in suspended list' };
    } catch(err) {
        this.logger.error('Error during IP restoration:', err);
        throw err;
    }
  }

  /**
   * Generates a Simple Queue to limit bandwidth based on the Tenant's assigned profile
   */
  async createSimpleQueue(routerId: string, name: string, targetIp: string, downloadMbps: number, uploadMbps: number) {
    const maxLimit = `${uploadMbps}M/${downloadMbps}M`;
    this.logger.log(`Provisioning Simple Queue for ${targetIp} on router ${routerId} [${maxLimit}]`);
    
    return this.executeCommand(routerId, '/queue/simple/add', {
      name: name,
      target: targetIp,
      'max-limit': maxLimit,
      comment: 'RentControl Auto-Provisioned'
    });
  }

  /**
   * Completely removes a Simple Queue from the Mikrotik using the target IP
   */
  async removeSimpleQueue(routerId: string, targetIp: string) {
    this.logger.log(`Removing Simple Queue for ${targetIp} on router ${routerId}`);
    try {
        const findResult = await this.executeCommand(routerId, '/queue/simple/print', {
            '?target': `${targetIp}/32` // IP is usually /32 in queues
        });
        
        // Sometimes it could be just the IP string depending on ROS version, try both
        const backupResult = await this.executeCommand(routerId, '/queue/simple/print', {
            '?target': targetIp
        });

        const queue = (findResult && findResult.length > 0) ? findResult[0] : ((backupResult && backupResult.length > 0) ? backupResult[0] : null);

        if (queue) {
            const listId = queue['.id'];
            return this.executeCommand(routerId, '/queue/simple/remove', {
                '.id': listId
            });
        }
        return { message: 'Queue not found for this IP' };
    } catch(err) {
        this.logger.error('Error during Queue removal:', err);
        throw err;
    }
  }

  // ==========================================
  // PPPoE Methods
  // ==========================================

  /**
   * Generates or updates a PPP Profile for bandwidth management
   */
  async syncPppProfile(routerId: string, name: string, downloadMbps: number, uploadMbps: number) {
    const rateLimit = `${uploadMbps}M/${downloadMbps}M`;
    this.logger.log(`Syncing PPP Profile '${name}' with limits ${rateLimit} on router ${routerId}`);
    
    try {
      // Check if profile exists
      const existing = await this.executeCommand(routerId, '/ppp/profile/print', { '?name': name });
      if (existing && existing.length > 0) {
        // Update
        return await this.executeCommand(routerId, '/ppp/profile/set', {
          '.id': existing[0]['.id'],
          'rate-limit': rateLimit
        });
      } else {
        // Create
        return await this.executeCommand(routerId, '/ppp/profile/add', {
          name: name,
          'rate-limit': rateLimit,
          comment: 'RentControl Auto-Provisioned'
        });
      }
    } catch (e: any) {
      this.logger.error('Error syncing PPP Profile:', e);
      throw e;
    }
  }

  /**
   * Creates a PPP Secret (User/Password) assigned to a Profile
   */
  async createPppSecret(routerId: string, user: string, pass: string, profileName: string) {
    this.logger.log(`Creating PPP Secret for user '${user}' on router ${routerId}`);
    return this.executeCommand(routerId, '/ppp/secret/add', {
      name: user,
      password: pass,
      profile: profileName,
      service: 'pppoe',
      comment: 'RentControl PPPoE'
    });
  }

  /**
   * Updates the Profile of a PPP Secret and drops active connections to force reconnection
   */
  async updatePppSecretProfile(routerId: string, user: string, newProfileName: string) {
    this.logger.log(`Updating PPP Secret '${user}' to profile '${newProfileName}' on router ${routerId}`);
    try {
      // 1. Update the secret
      const existing = await this.executeCommand(routerId, '/ppp/secret/print', { '?name': user });
      if (existing && existing.length > 0) {
        await this.executeCommand(routerId, '/ppp/secret/set', { '.id': existing[0]['.id'], profile: newProfileName });
      }

      // 2. Kill active connections to force applying new limits
      const active = await this.executeCommand(routerId, '/ppp/active/print', { '?name': user });
      if (active && active.length > 0) {
        for (const conn of active) {
          await this.executeCommand(routerId, '/ppp/active/remove', { '.id': conn['.id'] });
        }
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Error updating PPP Secret Profile:', e);
      throw e;
    }
  }

  /**
   * Disables a PPP Secret (Suspension) and drops active connections
   */
  async suspendPppSecret(routerId: string, user: string) {
    this.logger.log(`Suspending PPP Secret '${user}' on router ${routerId}`);
    try {
      // 1. Disable the secret
      const existing = await this.executeCommand(routerId, '/ppp/secret/print', { '?name': user });
      if (existing && existing.length > 0) {
        await this.executeCommand(routerId, '/ppp/secret/disable', { '.id': existing[0]['.id'] });
      }

      // 2. Kill active connections
      const active = await this.executeCommand(routerId, '/ppp/active/print', { '?name': user });
      if (active && active.length > 0) {
        for (const conn of active) {
          await this.executeCommand(routerId, '/ppp/active/remove', { '.id': conn['.id'] });
        }
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Error suspending PPP Secret:', e);
      throw e;
    }
  }

  /**
   * Enables a PPP Secret (Restore)
   */
  async restorePppSecret(routerId: string, user: string) {
    this.logger.log(`Restoring PPP Secret '${user}' on router ${routerId}`);
    try {
      const existing = await this.executeCommand(routerId, '/ppp/secret/print', { '?name': user });
      if (existing && existing.length > 0) {
        await this.executeCommand(routerId, '/ppp/secret/enable', { '.id': existing[0]['.id'] });
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Error restoring PPP Secret:', e);
      throw e;
    }
  }

  /**
   * Completely Removes a PPP Secret and drops active connections
   */
  async removePppSecret(routerId: string, user: string) {
    this.logger.log(`Removing PPP Secret '${user}' on router ${routerId}`);
    try {
      // 1. Remove the secret
      const existing = await this.executeCommand(routerId, '/ppp/secret/print', { '?name': user });
      if (existing && existing.length > 0) {
        await this.executeCommand(routerId, '/ppp/secret/remove', { '.id': existing[0]['.id'] });
      }

      // 2. Kill active connections
      const active = await this.executeCommand(routerId, '/ppp/active/print', { '?name': user });
      if (active && active.length > 0) {
        for (const conn of active) {
          await this.executeCommand(routerId, '/ppp/active/remove', { '.id': conn['.id'] });
        }
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Error removing PPP Secret:', e);
      throw e;
    }
  }

  // ==========================================
  // Hotspot (Vouchers) Methods
  // ==========================================

  /**
   * Creates a new Hotspot User for a voucher
   */
  async createHotspotUser(routerId: string, user: string, pass: string, durationHours: number, profileName: string = 'default') {
    this.logger.log(`Creating Hotspot User '${user}' on router ${routerId} for ${durationHours}h`);
    return this.executeCommand(routerId, '/ip/hotspot/user/add', {
      name: user,
      password: pass,
      profile: profileName,
      'limit-uptime': `${durationHours}h`, // RouterOS accepts 24h, 1d, etc.
      comment: 'RentControl Hotspot Voucher'
    });
  }

  /**
   * Removes a Hotspot User completely
   */
  async removeHotspotUser(routerId: string, user: string) {
    this.logger.log(`Removing Hotspot User '${user}' on router ${routerId}`);
    try {
      const existing = await this.executeCommand(routerId, '/ip/hotspot/user/print', { '?name': user });
      if (existing && existing.length > 0) {
        await this.executeCommand(routerId, '/ip/hotspot/user/remove', { '.id': existing[0]['.id'] });
      }

      // Also kill any active hotspot session for this user
      const active = await this.executeCommand(routerId, '/ip/hotspot/active/print', { '?user': user });
      if (active && active.length > 0) {
        for (const conn of active) {
          await this.executeCommand(routerId, '/ip/hotspot/active/remove', { '.id': conn['.id'] });
        }
      }
      return { success: true };
    } catch (e: any) {
      this.logger.error('Error removing Hotspot User:', e);
      throw e;
    }
  }
}
