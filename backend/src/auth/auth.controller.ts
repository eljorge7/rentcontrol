import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards, Patch, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  async login(@Body() req: any, @Res({ passthrough: true }) res: Response) {
    if (!req.email || !req.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const loginResult = await this.authService.login(user);
    res.cookie('access_token', loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });
    return loginResult;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    const { name, currentPassword, newPassword } = body;
    
    let updateData: any = { name };

    if (newPassword && currentPassword) {
      const user = await this.authService.validateUser(req.user.email, currentPassword);
      if (!user) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await this.usersService.update(userId, updateData);
    
    return { 
      success: true, 
      message: 'Perfil actualizado',
      user: {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    }; 
  }
}
