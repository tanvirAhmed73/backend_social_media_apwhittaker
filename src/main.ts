import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import appConfig from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    // logger
    logger : ['error', 'log', 'warn']
  });
  // cors
  app.enableCors()
  // validationpipe
  app.useGlobalPipes(new ValidationPipe(
    {
      transform:true
    }
  ))
  // Helmet
  app.use(helmet())

  // global
  app.setGlobalPrefix('api')
  
  
  // swagger
   const config = new DocumentBuilder()
    .setTitle(`${appConfig().app.name}`)
    .setDescription(`${appConfig().app.description}`)
    .setVersion('1.0')
    .addTag(`${appConfig().app.name}`)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);



  const port = process.env.PORT ?? 4000
  await app.listen(port);
  Logger.log(`Server is running on port ${port}`)
}
bootstrap();
