import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // so you don't have to import it everywhere
    }),
    MongooseModule.forRoot('mongodb+srv://user01:samplepass01@cluster0.ipyzfuq.mongodb.net/sample_app_db?retryWrites=true&w=majority&appName=Cluster0'),
    UsersModule,
    AuthModule  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
