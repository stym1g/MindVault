import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindvault'),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule, DocumentsModule, AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
