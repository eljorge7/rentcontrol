import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post('trigger-cron')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  triggerCron() {
    return this.chargesService.generateMonthlyCharges();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  create(@Request() req: any, @Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(createChargeDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'TENANT')
  findAll(@Request() req: any, @Query('leaseId') leaseId?: string) {
    return this.chargesService.findAll(req.user, leaseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'TENANT')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.chargesService.findOne(id, req.user);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'TENANT')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const path = './uploads/receipts';
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  reportPayment(@Request() req: any, @Param('id') id: string, @Body() reportData: any, @UploadedFile() file?: any) {
    if (file) {
      reportData.receiptUrl = `/charges/receipt/${file.filename}`;
    }
    return this.chargesService.reportPayment(id, reportData, req.user);
  }

  @Get('receipt/:filename')
  getReceipt(@Param('filename') filename: string, @Res() res: any) {
    return res.sendFile(filename, { root: './uploads/receipts' });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  update(@Request() req: any, @Param('id') id: string, @Body() updateChargeDto: UpdateChargeDto) {
    return this.chargesService.update(id, updateChargeDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.chargesService.remove(id, req.user);
  }
}
