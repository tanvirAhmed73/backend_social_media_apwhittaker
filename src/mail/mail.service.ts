import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import appConfig from 'src/config/app.config';

@Injectable()
export class MailService {
    constructor(
        @InjectQueue('email-queue') private readonly queue : Queue
    ){}

    async sendOtpToEmail({otp, email}){
        const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`
        const to = email
        const subject = "Email Verification"
        try {
            await this.queue.add('sendOtpToEmail',{
                to: to,
                from: from,
                subject: subject,
                template: 'email-verification',
                context:{
                    otp: otp
                }
            })
            
        } catch (error) {
            if(error instanceof HttpException){
                throw error
            }
            throw new HttpException("Internal Server Error",HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }
}
