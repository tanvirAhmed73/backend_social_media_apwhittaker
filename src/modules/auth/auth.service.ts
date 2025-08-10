import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      // if user not exist save it to the database
      const savedData = await UserRepository.createUser(data)

      // create otp 
      const otp = await UcodeRepository.createOtp(savedData)
      // send otp to the email
      await this.mailservice.sendOtpToEmail({otp, email})
      // return
      return{
        status: 200,
        success: true,
        message: 'Verification send to your email successfully!'
      }
    }
      catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }
}
