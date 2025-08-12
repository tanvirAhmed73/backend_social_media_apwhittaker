import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { emit } from 'process';
import { UcodeRepository } from 'src/common/ucode/repository/ucode.repository';

import { UserRepository } from 'src/common/user/repository/user.repository';
import { MailService } from 'src/mail/mail.service';

const prisma = new PrismaClient()
@Injectable()
export class AuthService {
  constructor(
    private mailservice:MailService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis:Redis
  ){}

  async createUser(data) {
    const {email} = data

    try {
      // check that user exist or not
      const isExist = await UserRepository.exist({
        field: 'email',
        value: email
      })
      if(isExist){
        throw new HttpException('Email Already Exist', HttpStatus.BAD_REQUEST)
      }
      // if user not exist save it to the database
      const savedData = await UserRepository.createUser(data)

      // create otp 
      const otp = await UcodeRepository.createOtp({id:savedData.id, email})
      // send otp to the email
      await this.mailservice.sendOtpToEmail({otp, email})
      // return
      return{
        status: 200,
        success: true,
        message: 'Otp Send To Your Email Successfully!'
      }
    }
      catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }

  async resendEmailVerification(email){
    try {
      const isExist = await UserRepository.exist({
        field : "email",
        value: email
      })
      if(!isExist){
        throw new HttpException('Email Not Found', HttpStatus.BAD_REQUEST)
      }

      const otp = await UcodeRepository.createOtp({id:null, email})

      if(!otp){
        throw new HttpException('Failed To Send Otp', HttpStatus.INTERNAL_SERVER_ERROR)
      }

      await this.mailservice.sendOtpToEmail({otp, email})

      return{
        status: 200,
        success: true,
        message: 'Otp Resend To Your Email Successfully!'
      }
    } catch (error) {
      if(error instanceof HttpException){
        return error
      } 
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async VerifyOtp(data){
    const {otp, email} = data
    try {
      Logger.log('verify token in progress')
      const isExist = await UserRepository.exist({
        field: "email",
        value : email
      })

      if(!isExist){
        Logger.log('Email Not Exist')
        throw new HttpException("Email Not Found", HttpStatus.BAD_GATEWAY)
      }

      Logger.log('Email Exist And ValidateToken In process')
      await UcodeRepository.validateToken({email, otp})

      return {
                status: 200,
                success: true,
                message: 'Email Verified Successfully!'
            }

    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async validateUser(email, password){
    try {
      const validatePasswordAndEMail = await UserRepository.validatePassword(email, password)
      return validatePasswordAndEMail;
      
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async login(userId, email,){
    try {
      const isActiveAccount = await UserRepository.isAccountActive(userId);

      if(!isActiveAccount){
        Logger.error(`Account is not Active`)
        throw new HttpException('First Verify Your Email Address!', HttpStatus.FORBIDDEN)
      }
      Logger.log('Account is Active')
      const accessToken = this.jwtService.sign({email, sub: userId}, { expiresIn:'1h' })
      const refreshToken = this.jwtService.sign({email, sub:userId}, { expiresIn:'7d' })
      Logger.log(`Token Created Successfully.  AccessToken:${accessToken}, RefreshToken:${refreshToken}, userId: ${userId}`)
      
      // store refreshToken
      const redisSved= await this.redis.set(
        `refresh_token:${userId}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7
      )
      Logger.log(`Refresh token save successfully in the redis ${redisSved}`)
      return {
        status: 200,
        success: true,
        message: 'Logged In Successfully',
        authorization:{
          type: 'bearer',
          access_Token: accessToken,
          refresh_Token: refreshToken
        }

      }
      
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async refreshToken(userId, refresh_token){
    try {
      const storedToken = await  this.redis.get(`refresh_token:${userId}`)
      if(!storedToken || storedToken != refresh_token){
        throw new HttpException("User Not Valid", HttpStatus.BAD_REQUEST)
      }
      const userDetails = await prisma.user.findFirst({
        where:{
          id:userId
        }
      })
      if(!userId || !userDetails){
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
      }

      const payload = { email : userDetails.email, sub: userDetails.id}

      const access_Token = this.jwtService.sign(payload, { expiresIn: '1h' })

      return {
        status:200,
        success: true,
        authorization: {
          type: 'bearer',
          access_token: access_Token,
        },
      };

    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
