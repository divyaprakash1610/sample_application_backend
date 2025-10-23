import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
// import { UploadModule } from './upload/upload.module';
import { ExcelController } from './excel/excel.controller';
import { ExcelService } from './excel/excel.service';
import { ExcelModule } from './excel/excel.module';
//import { GoogleDriveModule } from './google-drive/google-drive.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // so you don't have to import it everywhere
    }),
    MongooseModule.forRoot('mongodb+srv://saibernard97_db_user:QOHFWfW90jUCYeLy@cluster1.qrshtai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1'),
    UsersModule,
    AuthModule,
    ProjectsModule,
    ExcelModule,
    // GoogleDriveModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
