import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class ChatDto {
  @IsString() @MaxLength(4000) question: string;
  @IsOptional() @IsInt() @Min(1) @Max(12) topK?: number;
}
