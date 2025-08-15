import {  Logger, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './mail/mail.module';
import appConfig from './config/app.config';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal:true,
        load:[appConfig]
      }
    ),
    
    // Serve static files from 'public' and 'public/storage'
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),  // root path where static files reside
      serveRoot: '/public',                       // URL prefix to serve static assets
    }),
    
    BullModule.forRoot({
      connection:{
        host: appConfig().redis.host,
        port: +(appConfig().redis.port || 6379), 
        password: appConfig().redis.password
      }
    }),

    RedisModule.forRoot({
      type:"single",
      options:{
        host: appConfig().redis.host,
        password: appConfig().redis.password,
        port: +(appConfig().redis.port || 6379),
      }
    })
    ,
    AuthModule,
    MailModule,
    UserProfileModule
  ],

  providers: [AppService,
    {
      provide: Logger,
      useValue: new Logger()
    }
  ],
})
export class AppModule {}
