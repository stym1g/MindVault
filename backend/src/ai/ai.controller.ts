import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
@ApiTags('AI') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}
  @Post('search') search(@Body() dto: ChatDto, @Req() req: any) { return this.ai.search(dto.question, req.user.sub, dto.topK); }
  @Post('chat') chat(@Body() dto: ChatDto, @Req() req: any) { return this.ai.chat(dto.question, req.user.sub, dto.topK); }
}
