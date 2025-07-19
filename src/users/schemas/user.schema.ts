import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type UserDocument = User & Document;
@Schema()
export class User {
    @Prop({required:true,unique: true})
    email:string;

    @Prop({required:false})
    password?:string;

    // @Prop({default:Date.now})
    // createdAt:Date;

    // @Prop({default:Date.now})
    // updatedAt:Date;
    @Prop({ default: false })
    isVerified: boolean;

    @Prop()
    googleId?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);