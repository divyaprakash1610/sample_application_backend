import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['https://your-frontend.onrender.com'],
    credentials: true,
  }); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
dotenv.config();
