import { MailerService } from "@nestjs-modules/mailer";
import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Job } from "bullmq";


@Processor('email-queue')
export class MailProcessor extends WorkerHost{
    constructor(private mailerservice: MailerService){
        super()
    }

    @OnWorkerEvent('active')
    onActive(job : Job){
        Logger.log(
        `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @OnWorkerEvent('completed')
    onCompleted(job : Job){
        Logger.log(`Job ${job.id} with name ${job.name} completed`);

    }

    async process(job: Job, token?: string): Promise<any> {
        Logger.log(`Processing job ${job.id} with name ${job.name}`);
        try {
            switch(job.name){
                case 'sendOtpToEmail':
                    Logger.log('Sending OTP code to email');
                    await this.mailerservice.sendMail({
                    to: job.data.to,
                    from: job.data.from,
                    subject: job.data.subject,
                    template: job.data.template,
                    context: job.data.context,
                });
                break;
                
                default:
                Logger.log('Unknown job name');
                return;

            }
        } catch (error) {
            Logger.error('Error sending email:', error);
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}