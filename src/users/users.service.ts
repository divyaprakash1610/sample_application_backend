import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(user);
  }

async updatePassword(userId: string, newPassword: string): Promise<User | null> {
  const hashed = await bcrypt.hash(newPassword, 10);
  return this.userModel.findByIdAndUpdate(userId, { password: hashed }, { new: true });
}
async updateProfile(email: string, updateData: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate({ email }, updateData, { new: true }).exec();
  }

  
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async verifyEmail(email: string): Promise<void> {
  await this.userModel.updateOne({ email }, { isVerified: true });
}

}
