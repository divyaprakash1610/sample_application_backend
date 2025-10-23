// machine-error.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MachineErrorDocument = MachineError & Document;

@Schema({ timestamps: true })
export class MachineError extends Document {
  @Prop({ required: true })
  projectName: string; // Reference to the project

  @Prop({ required: true })
  partName: string; // Reference to the part

  @Prop({ required: true })
  machineName: string;

  @Prop({ required: true })
  errorMessage: string;

  @Prop({ required: true })
  loggedAt: Date; // Time when error occurred

  @Prop({ default: null })
  recoveredAt: Date; // Time when error was resolved

  @Prop({ default: null })
  recoveryDuration: number; // In hours (recoveredAt - loggedAt)

  @Prop({ required: true })
  loggedBy: string; // Employee who logged the error
}

export const MachineErrorSchema = SchemaFactory.createForClass(MachineError);
