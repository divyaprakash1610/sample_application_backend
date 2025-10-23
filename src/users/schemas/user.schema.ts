import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // adds createdAt & updatedAt automatically
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string; // only for email/password signups

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  googleId?: string; // for Google auth

  // ✅ Additional profile fields
  @Prop()
  fname?: string;
  @Prop()
  lname?: string;

  @Prop()
  employeeId?: string;

  @Prop()
  mobileNo?: string;

  @Prop()
  designation?: string; // e.g., Operator, Supervisor, Admin

  @Prop()
  profilePhotoPath?: string; // local or cloud storage URL

   // ✅ Google OAuth tokens (encrypted before saving)
  @Prop()
  accessToken?: string;


}

export const UserSchema = SchemaFactory.createForClass(User);
