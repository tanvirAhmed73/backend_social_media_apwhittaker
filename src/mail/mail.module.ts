import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './processor/mail.processor';
import appConfig from 'src/config/app.config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports:[
    MailerModule.forRoot({
      transport:{
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth:{
          user:"tanvirbdcallingnode.js@gmail.com",
          pass:"mkvpuhbckhwfaejn"
        },
      },
      defaults:{
        from:"tanvirbdcallingnode.js@gmail.com"
      },
      template:{
        dir: process.cwd() + '/dist/mail/template',
        adapter: new EjsAdapter()
      },
    }),
    BullModule.registerQueue({
      name:'email-queue',
    })
  ],
  providers: [MailService, MailProcessor],
  exports:[MailService]
})
export class MailModule {}
