import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
@Schema({ timestamps: true })
export class DocumentRecord {
  @Prop({ type: Types.ObjectId, required: true, index: true }) userId: Types.ObjectId;
  @Prop({ required: true }) originalName: string;
  @Prop({ required: true }) mimeType: string;
  @Prop({ required: true }) size: number;
  @Prop({ required: true }) storagePath: string;
  @Prop({ default: 'Unsorted' }) category: string;
  @Prop({ default: 'queued', enum: ['queued','processing','indexed','failed'] }) status: string;
  @Prop({ default: 0 }) chunkCount: number;
  @Prop({ default: '' }) extractedText: string;
  @Prop({ default: '' }) errorMessage: string;
}
export type DocumentRecordDocument = HydratedDocument<DocumentRecord>;
export const DocumentRecordSchema = SchemaFactory.createForClass(DocumentRecord);
