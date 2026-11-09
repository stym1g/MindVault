import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProviderService } from './providers/ai-provider.service';
import { VectorStoreService } from './vector-store.service';
@Module({ imports: [ConfigModule], controllers: [AiController], providers: [AiService, AiProviderService, VectorStoreService], exports: [AiService, AiProviderService, VectorStoreService] })
export class AiModule {}
