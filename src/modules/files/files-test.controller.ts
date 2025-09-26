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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { EnhancedFileValidationInterceptor } from '../../common/interceptors/enhanced-file-validation.interceptor';
import { UploadResponseDto } from './dto/upload-response.dto';
import { multerConfig } from '../../config/multer.config';

@Controller('files-test')
export class FilesTestController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file'),
    EnhancedFileValidationInterceptor,
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    try {
      const uuid = await this.filesService.uploadFile(file);
      return {
        success: true,
        uuid,
        message: 'Archivo subido exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':uuid')
  async getFile(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const { file, mimeType, originalName } = await this.filesService.getFile(uuid);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.send(file);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get(':uuid/info')
  async getFileInfo(@Param('uuid') uuid: string) {
    try {
      const fileInfo = await this.filesService.getFileMetadata(uuid);
      return {
        success: true,
        data: fileInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':uuid')
  async deleteFile(@Param('uuid') uuid: string) {
    try {
      await this.filesService.deleteFile(uuid);
      return {
        success: true,
        message: 'Archivo eliminado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
