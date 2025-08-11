import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() data:CreateAuthDto){
    const response = await this.authService.createUser(data);
    return response
  }

  @Post('resend-email-verification')
  async resendEmail(@Body() data:{email:string}){
    const response = await this.authService.resendEmailVerification(data.email)
    return response
  }

  @Post('verify-otp')
  async VerifyOtp(@Body() data:{email, otp}){
    const response= await this.authService.VerifyOtp(data)
    return response
  }


}
