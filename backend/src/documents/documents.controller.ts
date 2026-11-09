import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { UpdateDocumentDto } from './dto/update-document.dto';
@ApiTags('documents') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documents: DocumentsService) {}
  @Post('upload') @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) { return this.documents.upload(file, req.user.sub); }
  @Get() list(@Req() req: any) { return this.documents.list(req.user.sub); }
  @Get(':id') get(@Param('id') id: string, @Req() req: any) { return this.documents.get(id, req.user.sub); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() req: any) { return this.documents.updateCategory(id, req.user.sub, dto.category); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.documents.remove(id, req.user.sub); }
}
