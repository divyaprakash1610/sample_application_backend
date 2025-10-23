import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OtpService } from '../otp/otp.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from 'src/mail/mail.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  private googleClient: OAuth2Client;

  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService, 
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    console.log('Received signup request:', signupDto);
    return this.authService.signup(signupDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const valid = await this.otpService.verifyOtp(body.email, body.otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');

    await this.usersService.verifyEmail(body.email);
    return { message: 'OTP verified successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }

    const otp = await this.otpService.generateOtp(email);
    await this.mailService.sendOtpEmail(email, otp);

    return { message: 'OTP sent to email for password reset' };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.usersService.updatePassword(user['_id'], newPassword);
    return { message: 'Password updated successfully' };
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpService.generateOtp(email);
    await this.mailService.sendOtpEmail(email, otp);

    return { message: 'OTP resent to your email' };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User email not verified');
    }

    if (!user.password) {
      throw new UnauthorizedException('User password not set');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.authService.generateJwt(user);
    return {
      message: 'Login successful',
      token,
      user,
    };
  }

  // Web Google OAuth (via browser redirects)
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Redirects to Google OAuth screen
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const userData = req.user;

    let user = await this.usersService.findByEmail(userData.email);
    if (!user) {
      user = await this.usersService.create({
        email: userData.email,
        googleId: userData.googleId,
        isVerified: true,
      });
    }

    const token = this.authService.generateJwt(user);
    return {
      message: 'Google login success',
      user: req.user,
      token,
    };
  }

@Post('complete-profile')
async completeProfile(@Body() profileData: {
  firstName?: string;
  lastName?: string;
  email: string;
  employeeId?: string;
  mobileNo?: string;
  designation?: string;
  profilePhotoPath?: string;
}) {
  const updatedUser = await this.usersService.updateProfile(profileData.email, profileData);
  return { message: 'Profile updated successfully', user: updatedUser };
}

  // New: Mobile Google Sign-In with ID Token verification
  @Post('google-mobile')
async googleMobileAuth(@Body('idToken') idToken: string, @Body('accessToken') accessToken: string) {
  console.log('Received ID Token:', idToken);
  console.log('Received Access Token:', accessToken);
  if (!idToken || !accessToken) {
    throw new BadRequestException('ID token and Access token are required');
  }

  if (!idToken) {
    throw new BadRequestException('ID token must be provided');
  }

  let payload;
  try {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    payload = ticket.getPayload();
    console.log('Google Payload:', payload);
  } catch (error) {
    console.error('Failed to verify ID token:', error);
    throw new UnauthorizedException('Invalid Google ID token');
  }

  const email = payload?.email;
  const googleId = payload?.sub;

  if (!email || !googleId) {
    throw new BadRequestException('Missing email or Google ID from payload');
  }

  let isNewUser = false;
  let user = await this.usersService.findByEmail(email) as UserDocument;
  if (!user) {
    isNewUser = true;
    user = await this.usersService.create({
      email,
      googleId,
      isVerified: true,
    });
  }

  console.log('Is new user?:', isNewUser);
   await this.usersService.updateTokens(String(user._id), accessToken,);

  // Prepare the response object
  const response = {
    message: 'Google login success',
    token: this.authService.generateJwt(user),
    user,
    accessToken,
    isNewUser,
  };

  // ✅ Print it to backend console
  console.log('Google Mobile Auth Response:', JSON.stringify(response, null, 2));

  // Send it to the frontend
  return response;
}
}
