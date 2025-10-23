import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true })
  projectName: string;  // Reference to project

  @Prop({ required: true })
  partName: string;     // Reference to part

  @Prop({ required: true })
  stepName: string;   // Name/identifier of the step

  @Prop({ required: true })
  createdBy: string; 

  @Prop({ 
    required: true,
    default: 'PENDING' 
  })
  status: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Optional extra info about the step
}

export const LogSchema = SchemaFactory.createForClass(Log);
