import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartErrorDocument = PartError & Document;

@Schema({ timestamps: true })
export class PartError extends Document {
  @Prop({ required: true })
  projectName: string;  // Reference to project

  @Prop({ required: true })
  partName: string;     // Reference to part

  @Prop({ required: true })
  stepName: string;     // Reference to step
  
  @Prop({ required: true })
  errorMessage: string;

  @Prop({ required: true })
  loggedAt: Date;     // Time error occurred

  @Prop({ required: true })
  loggedBy: string;   // Who logged the error

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Optional extra details
}

export const PartErrorSchema = SchemaFactory.createForClass(PartError);

// Index for fast Excel queries
PartErrorSchema.index({ projectId: 1, partId: 1, loggedAt: -1 });
