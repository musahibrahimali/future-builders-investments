import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import csurf from 'csurf';


const apiVersion = '1.0.1';

/*
 * ######################################################
 * ############### BOOTSTRAP THE APP ####################
 * ######################################################
 * */

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  const configService = app.get(ConfigService);
  const originUrl = configService.get<string>('ORIGIN_URL');

  /*
   * ######################################################
   * ##################### MIDDLEWARES ####################
   * ######################################################
   * */
  /* ENABLE CORS */
  app.enableCors({
    credentials: true,
    origin: originUrl,
    methods: 'HEAD, GET,POST,PUT,DELETE,PATCH',
  });
  // cookie parser
  app.use(cookieParser());

  /* APP VERSIONING */
  app.enableVersioning({
    type: VersioningType.URI,
  });

  /* USE HELMET TO ADD A SECURITY LAYER */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // app.use(
  //   csurf({
  //     cookie: {
  //       sameSite: true,
  //       secure:true,
  //     }
  //   }),
  // );

  /*
  * ###########################################################
  * #################### USE GLOBAL PIPES #####################
  * ###########################################################
  * */
  app.useGlobalPipes(new ValidationPipe());

  /*
   * ###########################################################
   * ##################### SWAGGER CONFIG ######################
   * ###########################################################
   * */
  const config = new DocumentBuilder()
    .setTitle(`Foundation Builders Investments API version ${{apiVersion}}`)
    .setDescription("This is the backend api interface for the Foundation Builders Investments web project")
    .setVersion(`${apiVersion}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /*
  * ###########################################################
  * ############## START THE SERVER FOR THE APP ###############
  * ###########################################################
  * */
  const port = configService.get<number>('PORT');
  await app
    .listen(port)
    .then(() => {
      console.log(`Server running on port http://localhost:${port}`);
      console.log(`Swagger running on port http://localhost:${port}/api`);
      console.log('Press CTRL-C to stop server');
    })
    .catch((err) => {
      console.log('There was an error starting server. ', err);
    });
}

/*
* ###########################################################
* #################### BOOTSTRAP THE APP ####################
* ###########################################################
* */
bootstrap().then(() => console.log());