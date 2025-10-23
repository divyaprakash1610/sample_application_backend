// part.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Part extends Document {
  @Prop({ required: true })
  projectName: string;   // The project this part belongs to

  @Prop({ required: true })
  name: string;        // The name of the part

  @Prop({ required: true })
  createdBy: string;   // userId of who created the part

  @Prop({ type: Object })
  metadata: Record<string, any>; // Extra details like tolerances, etc.
}
export const PartSchema = SchemaFactory.createForClass(Part);
