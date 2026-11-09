import { IsOptional, IsString, MaxLength } from 'class-validator';
export class UpdateDocumentDto {
  @IsOptional() @IsString() @MaxLength(80) category?: string;
}
