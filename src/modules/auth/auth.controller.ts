import { Controller, Post, Body, UseGuards, Req, Res, Logger, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // get user
  @Get('logged-In-User-Details')
  @UseGuards(JwtAuthGuard)
  async getLoggedInUserDetails(@Req() req:Request){
    const userId = req.user.userId
    const response = await this.authService.getLoggedInUserDetails(userId)
    return response
  }
  //----------------------------------------- Register
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

  //-------------------------------------------Login
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.user.id;
      const email = req.user.email;
      Logger.log(`Login Is Starting... userId:${userId}, email: ${email}`)
      const response = await this.authService.login(userId, email)
      Logger.log(`Get Response Successfully ${response}`)
  
      // store to the secure cookies
      res.cookie('refresh_token', response.authorization.refresh_Token,{
        httpOnly:true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
      res.json(response)

    } catch (error) {
        return {
          success: false,
          message: error.message,
        };
    }
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @Req() req:Request,
    @Body() body:{ refresh_token : string 
    })
    {
        const userId = req.user.userId
        const response = await this.authService.refreshToken(userId, body.refresh_token);
        return response
    }

}
