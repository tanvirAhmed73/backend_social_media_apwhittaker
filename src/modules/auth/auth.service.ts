import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { UcodeRepository } from 'src/common/ucode/repository/ucode.repository';

import { UserRepository } from 'src/common/user/repository/user.repository';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private mailservice:MailService){}

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
}
