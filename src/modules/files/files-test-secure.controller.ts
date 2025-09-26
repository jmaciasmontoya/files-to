import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { FilesService } from './files.service';
import { SecurityEnhancedFileValidationInterceptor } from '../../common/interceptors/security-enhanced-file-validation.interceptor';
import { UploadResponseDto } from './dto/upload-response.dto';
import { multerConfig } from '../../config/multer.config';

@Controller('files-test-secure')
@UseGuards(ThrottlerGuard)
export class FilesTestSecureController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Throttle({ default: { limit: 3, ttl: 1000 } }) // 3 requests por segundo
  @UseInterceptors(
    FileInterceptor('file'),
    SecurityEnhancedFileValidationInterceptor,
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    try {
      const uuid = await this.filesService.uploadFile(file);
      return { success: true, uuid, message: 'Archivo subido exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  @Get(':uuid')
  @Throttle({ default: { limit: 10, ttl: 1000 } }) // 10 requests por segundo
  async downloadFile(@Param('uuid') uuid: string, @Res() res: Response) {
    const fileData = await this.filesService.getFile(uuid);
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
    res.send(fileData.file);
  }

  @Get(':uuid/info')
  @Throttle({ default: { limit: 20, ttl: 1000 } }) // 20 requests por segundo
  async getFileInfo(@Param('uuid') uuid: string) {
    const fileInfo = await this.filesService.getFileMetadata(uuid);
    return { success: true, data: fileInfo };
  }

  @Delete(':uuid')
  @Throttle({ default: { limit: 5, ttl: 1000 } }) // 5 requests por segundo
  async deleteFile(@Param('uuid') uuid: string) {
    await this.filesService.deleteFile(uuid);
    return { success: true, message: 'Archivo eliminado exitosamente' };
  }
}
