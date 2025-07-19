import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; 
import { OtpModule } from 'src/otp/otp.module';
import { GoogleStrategy } from './strategies/google.strategies';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategies';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    OtpModule,
    MailModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ], 
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService and JwtModule for use in other modules
})
export class AuthModule {}
