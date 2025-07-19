import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async generateOtp(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    await this.otpModel.create({ email, code, expiresAt });
    return code;
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const otpDoc = await this.otpModel.findOne({ email, code });
    return !!otpDoc;
  }
}
