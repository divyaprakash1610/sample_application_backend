// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ProjectDocument = Project & Document;
@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  createdBy: string; // userId

  @Prop()
  excelFilePath: string; // local/cloud path

  @Prop({ type: Object })
  metadata: Record<string, any>; // optional: extra info like description, version, etc.
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
