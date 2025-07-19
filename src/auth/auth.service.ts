import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { OtpService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private otpService: OtpService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.usersService.create({
      email: signupDto.email,
      password: hashedPassword,
    });

    const otp = await this.otpService.generateOtp(user.email);
    await this.mailService.sendOtpEmail(user.email, otp);

    console.log(`OTP for ${user.email}: ${otp}`);

    return { message: 'Signup successful, OTP sent to email.', userId: user._id };
  }

  generateJwt(user: any) {
    const payload = { sub: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateGoogleUser(email: string, googleId: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        googleId,
        isVerified: true,
      });
    }
    return user;
  }

  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.usersService.updatePassword(userId, hashedPassword);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    if (!user.isVerified) return null;
    if (!user.password) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }
}
