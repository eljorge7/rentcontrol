export class CreateMikrotikDto {
  name: string;
  ipAddress: string;
  apiPort: number;
  username: string;
  password: string;
  propertyId?: string;
  
  vpnIp?: string;
  vpnUser?: string;
  vpnPassword?: string;
  vpnHost?: string;
}
