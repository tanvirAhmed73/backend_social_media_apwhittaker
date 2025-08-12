import { Global, Logger, Module, Options } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './mail/mail.module';
import appConfig from './config/app.config';
import { BullModule } from '@nestjs/bullmq';
import { LocalStrategy } from './modules/auth/strategy/local.strategy';
import { RedisModule } from '@nestjs-modules/ioredis';
import { single } from 'rxjs';
import { UserProfileModule } from './modules/user-profile/user-profile.module';


@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal:true,
        load:[appConfig]
      }
    ),
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
