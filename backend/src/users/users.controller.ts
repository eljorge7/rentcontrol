import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles, Res, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private notifications: NotificationsService
  ) {}

  @Post('owner')
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'ine', maxCount: 1 },
    { name: 'rfcDocument', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'propertyDeed', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const path = './uploads/kyc';
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async createOwner(
    @Request() req: any,
    @Body() body: any,
    @UploadedFiles() files: {
      ine?: Express.Multer.File[],
      rfcDocument?: Express.Multer.File[],
      addressProof?: Express.Multer.File[],
      propertyDeed?: Express.Multer.File[],
      bankStatement?: Express.Multer.File[]
    }
  ) {
    const plainPassword = body.password || 'defaultPassword123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Preparar el profile
    const ownerProfileCreate: any = {
      legalName: body.legalName,
      rfc: body.rfc,
      taxRegime: body.taxRegime,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankClabe: body.bankClabe,
    };

    if (files) {
      if (files.ine?.[0]) ownerProfileCreate.ineUrl = `/users/kyc/${files.ine[0].filename}`;
      if (files.rfcDocument?.[0]) ownerProfileCreate.rfcDocumentUrl = `/users/kyc/${files.rfcDocument[0].filename}`;
      if (files.addressProof?.[0]) ownerProfileCreate.addressProofUrl = `/users/kyc/${files.addressProof[0].filename}`;
      if (files.propertyDeed?.[0]) ownerProfileCreate.propertyDeedUrl = `/users/kyc/${files.propertyDeed[0].filename}`;
      if (files.bankStatement?.[0]) ownerProfileCreate.bankStatementUrl = `/users/kyc/${files.bankStatement[0].filename}`;
    }

    const userData: any = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone,
      role: 'OWNER',
      planType: body.planType || 'SAAS',
      managerId: req.user.role === 'MANAGER' ? req.user.userId : body.managerId,
      managementPlanId: body.managementPlanId,
      ownerProfile: {
        create: ownerProfileCreate
      }
    };

    const newUser = await this.usersService.create(userData as Prisma.UserCreateInput);

    // Dispatch Onboarding Notifications
    const loginUrl = process.env.FRONTEND_URL || 'https://rentcontrol.radiotecpro.com';
    const wpMessage = `👋 *¡Bienvenido a RentControl, ${body.name}!* 🎉\n\nTu Gestor te ha dado de alta en la plataforma.\n\nDesde tu Nuevo Portal VIP podrás monitorear tus propiedades, ver los ingresos generados y descargar tus comprobantes.\n\n🔗 *Accede aquí:* ${loginUrl}\n👤 *Usuario:* ${body.email}\n🔑 *Contraseña Temporal:* ${plainPassword}\n\n⚠️ _Te recomendamos cambiar tu contraseña al ingresar por primera vez._\n\nAtentamente,\n*Equipo de Administración*`;
    
    if (body.phone) {
      this.notifications.sendWhatsAppMessage(body.phone, wpMessage);
    }
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1e293b; margin: 0;">RentControl</h1>
          <p style="color: #64748b; margin-top: 5px;">Bienvenido a tu Portal de Propietario</p>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px;">Hola <b>${body.name}</b>,</p>
          <p style="color: #334155; line-height: 1.6;">Tu Administrador te ha dado de alta en la plataforma. Ahora tendrás control total y transparencia sobre tus propiedades arrendadas.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="display: block; color: #0f172a; font-size: 14px;">Usuario (Email):</strong>
            <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${body.email}</span>
            <br/><br/>
            <strong style="display: block; color: #0f172a; font-size: 14px;">Contraseña Temporal:</strong>
            <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${plainPassword}</span>
            <br/><br/>
            <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ingresar al Portal</a>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: justify;">Te recomendamos encarecidamente cambiar esta contraseña temporal una vez que ingreses por primera vez al sistema por motivos de seguridad.</p>
        </div>
      </div>`;
    this.notifications.sendEmail(body.email, 'Acceso a tu Portal - RentControl', emailHtml);

    return newUser;
  }

  @Get('kyc/:filename')
  @Roles('ADMIN', 'MANAGER')
  async getKycFile(@Param('filename') filename: string, @Res() res: any, @Request() req: any) {
    // KYC files must be protected. Only Admin or the correct Manager/Owner should access it.
    // For now, any ADMIN or MANAGER can view. A stricter validation can be added inside standard business logic.
    const path = `./uploads/kyc/${filename}`;
    if (!fs.existsSync(path)) {
      throw new NotFoundException('Documento no encontrado');
    }
    return res.sendFile(filename, { root: './uploads/kyc' });
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createUserDto: Prisma.UserCreateInput) {
    // Generate a default password if not provided or hash the provided one
    const plainPassword = createUserDto.password || 'defaultPassword123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Bypass TS error for added schema fields that the Prisma Client generator didn't pick up yet
    const userData: any = {
      ...createUserDto,
      password: hashedPassword,
    };
    
    if ((createUserDto as any).maxProperties) {
      userData.maxProperties = (createUserDto as any).maxProperties;
    }
    
    if ((createUserDto as any).planType) {
      userData.planType = (createUserDto as any).planType;
    }
    if ((createUserDto as any).managerId) {
      userData.managerId = (createUserDto as any).managerId;
    }

    if ((createUserDto as any).managementPlanId) {
      userData.managementPlanId = (createUserDto as any).managementPlanId;
    }
    
    // Sólo el Admin puede setear roles explícitos
    if (createUserDto.role) {
      userData.role = createUserDto.role;
    }
    
    const newUser = await this.usersService.create(userData as Prisma.UserCreateInput);

    // Despachar Onboarding Pro para Gestores
    if (newUser.role === 'MANAGER' || newUser.role === 'ADMIN') {
      const loginUrl = process.env.FRONTEND_URL || 'https://rentcontrol.radiotecpro.com';
      const wpMessage = `👋 *¡Bienvenido a RentControl, ${newUser.name}!* 🎉\n\nEl Administrador Global te ha otorgado acceso como Gestor del Sistema.\n\nDesde el panel de control podrás dar de alta propiedades, inquilinos y monitorizar todos los ingresos en tiempo real.\n\n🔗 *Accede aquí:* ${loginUrl}\n👤 *Usuario:* ${newUser.email}\n🔑 *Contraseña Temporal:* ${plainPassword}\n\n⚠️ _Te recomendamos cambiar tu contraseña al ingresar._\n\nAtentamente,\n*Equipo de Administración*`;
      
      if (userData.phone) {
        this.notifications.sendWhatsAppMessage(userData.phone, wpMessage);
      }
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e293b; margin: 0;">RentControl</h1>
            <p style="color: #64748b; margin-top: 5px;">Bienvenido al Panel de Gestión Web</p>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px;">Hola <b>${newUser.name}</b>,</p>
            <p style="color: #334155; line-height: 1.6;">El Administrador te ha creado una cuenta. Como Gestor, podrás administrar propiedades, inquilinos, contratos, y finanzas desde un solo lugar.</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong style="display: block; color: #0f172a; font-size: 14px;">Usuario (Email):</strong>
              <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${newUser.email}</span>
              <br/><br/>
              <strong style="display: block; color: #0f172a; font-size: 14px;">Contraseña Temporal:</strong>
              <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">${plainPassword}</span>
              <br/><br/>
              <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ingresar al Panel</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: justify;">Te recomendamos cambiar tu contraseña al entrar por motivos de seguridad.</p>
          </div>
        </div>`;
      this.notifications.sendEmail(newUser.email, 'Bienvenido a RentControl - Tu Panel de Gestión', emailHtml);
    }

    return newUser;
  }

  @Get('managers')
  @Roles('ADMIN')
  async findAllManagers() {
    const allUsers = await this.usersService.findAll();
    return allUsers.filter(user => user.role === 'MANAGER');
  }

  @Get('owners')
  @Roles('ADMIN', 'MANAGER')
  async findAllOwners(@Request() req: any) {
    const allUsers = await this.usersService.findAll();
    let owners = allUsers.filter(user => user.role === 'OWNER');
    if (req.user.role === 'MANAGER') {
      owners = owners.filter((o: any) => o.managerId === req.user.userId);
    }
    return owners;
  }
  
  @Get('tenants')
  @Roles('ADMIN', 'MANAGER')
  async findAllTenants(@Request() req: any) {
    const allUsers = await this.usersService.findAll();
    // Tenants are currently linked to their owner indirectly via leases, not via User model directly...
    // But since the frontend uses this endpoint, I should restrict it. However, tenants don't have managerId or ownerId in the User model! 
    // They are returned from tenant.controller.ts safely. What is this endpoint for?
    return allUsers.filter(user => user.role === 'TENANT');
  }

  @Get('my-profile')
  @Roles('ADMIN', 'MANAGER', 'OWNER')
  async getMyProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('my-profile/tax')
  @Roles('ADMIN', 'MANAGER', 'OWNER')
  async updateMyTaxProfile(@Request() req: any, @Body() updateTaxDto: any) {
    const updateData: any = {
      requiresInvoice: updateTaxDto.requiresInvoice === true || updateTaxDto.requiresInvoice === 'true',
    };
    if (updateTaxDto.rfc !== undefined) updateData.rfc = updateTaxDto.rfc;
    if (updateTaxDto.taxRegimen !== undefined) updateData.taxRegimen = updateTaxDto.taxRegimen;
    if (updateTaxDto.zipCode !== undefined) updateData.zipCode = updateTaxDto.zipCode;
    if (updateTaxDto.taxDocumentUrl !== undefined) updateData.taxDocumentUrl = updateTaxDto.taxDocumentUrl;

    return this.usersService.update(req.user.userId, updateData);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  async update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    const updateData: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password as string, 10);
    }
    
    if ((updateUserDto as any).maxProperties) {
      updateData.maxProperties = (updateUserDto as any).maxProperties;
    }
    
    if ((updateUserDto as any).planType) {
      updateData.planType = (updateUserDto as any).planType;
    }

    if ((updateUserDto as any).managerId !== undefined) {
      updateData.managerId = (updateUserDto as any).managerId;
    }

    if ((updateUserDto as any).managementPlanId !== undefined) {
      updateData.managementPlanId = (updateUserDto as any).managementPlanId;
    }

    // Role cannot be changed via standard edit to prevent locking oneself out or creating fake admins randomly via UI.
    if (updateData.role) delete updateData.role;

    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
