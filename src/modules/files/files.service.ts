import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileConfig } from '../../config/file.config';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async uploadFile(file: Express.Multer.File, uploadedBy?: string): Promise<string> {
    const uuid = uuidv4();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const config = FileConfig.getConfig();
    const uploadDir = path.join(config.uploadPath, String(year), month);
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuid}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    
    // Guardar archivo físico
    fs.writeFileSync(filePath, file.buffer);
    
    // Guardar metadatos en BD
    const fileEntity = new File();
    fileEntity.id = uuid;
    fileEntity.original_name = file.originalname;
    fileEntity.file_path = filePath;
    fileEntity.mime_type = file.mimetype;
    fileEntity.size = file.size;
    fileEntity.uploaded_by = uploadedBy;
    
    await this.fileRepository.save(fileEntity);
    
    return uuid;
  }

  async getFile(uuid: string): Promise<{ file: Buffer; mimeType: string; originalName: string }> {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: uuid }
    });
    
    if (!fileRecord) {
      throw new NotFoundException('Archivo no encontrado');
    }
    
    if (!fs.existsSync(fileRecord.file_path)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }
    
    const file = fs.readFileSync(fileRecord.file_path);
    
    return {
      file,
      mimeType: fileRecord.mime_type,
      originalName: fileRecord.original_name,
    };
  }

  async deleteFile(uuid: string): Promise<void> {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: uuid }
    });
    
    if (!fileRecord) {
      throw new NotFoundException('Archivo no encontrado');
    }
    
    // Eliminar archivo físico
    if (fs.existsSync(fileRecord.file_path)) {
      fs.unlinkSync(fileRecord.file_path);
    }
    
    // Eliminar registro de BD
    await this.fileRepository.remove(fileRecord);
  }

  async getFileMetadata(uuid: string): Promise<File> {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: uuid }
    });
    
    if (!fileRecord) {
      throw new NotFoundException('Archivo no encontrado');
    }
    
    return fileRecord;
  }
}
