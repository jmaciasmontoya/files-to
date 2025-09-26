import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { IPWhitelistGuard } from '../../common/guards/ip-whitelist.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { FileValidationInterceptor } from '../../common/interceptors/file-validation.interceptor';
import { AuthType } from '../../common/decorators/auth.decorator';
import { UploadResponseDto } from './dto/upload-response.dto';

@Controller('files')
@UseGuards(IPWhitelistGuard, JwtAuthGuard, ApiKeyGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @AuthType('jwt') // Cambiar a 'api-key' si se quiere usar API Key
  @UseInterceptors(
    FileInterceptor('file'),
    FileValidationInterceptor,
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
  @AuthType('jwt') // Cambiar a 'api-key' si se quiere usar API Key
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
  @AuthType('jwt') // Cambiar a 'api-key' si se quiere usar API Key
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
  @AuthType('jwt') // Cambiar a 'api-key' si se quiere usar API Key
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
