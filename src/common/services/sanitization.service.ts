import { Injectable } from '@nestjs/common';
import sanitize from 'sanitize-filename';

@Injectable()
export class SanitizationService {
  /**
   * Sanitiza el nombre de un archivo
   */
  sanitizeFilename(filename: string): string {
    if (!filename) {
      return 'unnamed-file';
    }

    // Obtener extensión
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

    // Sanitizar nombre base
    const sanitizedName = sanitize(name, { replacement: '_' });
    
    // Limitar longitud (máximo 100 caracteres para el nombre)
    const maxNameLength = 100;
    const finalName = sanitizedName.length > maxNameLength 
      ? sanitizedName.substring(0, maxNameLength) 
      : sanitizedName;

    // Si el nombre está vacío después de sanitizar, usar nombre por defecto
    const finalFilename = finalName || 'file';
    
    return finalFilename + extension;
  }

  /**
   * Valida si un nombre de archivo es seguro
   */
  isSafeFilename(filename: string): boolean {
    if (!filename || filename.length === 0) {
      return false;
    }

    // Verificar longitud máxima
    if (filename.length > 255) {
      return false;
    }

    // Verificar caracteres peligrosos
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      return false;
    }

    // Verificar nombres reservados de Windows
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    const nameWithoutExt = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      return false;
    }

    return true;
  }

  /**
   * Genera un nombre de archivo único si hay conflicto
   */
  generateUniqueFilename(originalFilename: string, existingFiles: string[]): string {
    const sanitized = this.sanitizeFilename(originalFilename);
    
    if (!existingFiles.includes(sanitized)) {
      return sanitized;
    }

    // Generar nombre único
    const lastDotIndex = sanitized.lastIndexOf('.');
    const name = lastDotIndex > 0 ? sanitized.substring(0, lastDotIndex) : sanitized;
    const extension = lastDotIndex > 0 ? sanitized.substring(lastDotIndex) : '';
    
    let counter = 1;
    let newFilename: string;
    
    do {
      newFilename = `${name}_${counter}${extension}`;
      counter++;
    } while (existingFiles.includes(newFilename) && counter < 1000);

    return newFilename;
  }

  /**
   * Sanitiza metadatos de archivo
   */
  sanitizeFileMetadata(metadata: any): any {
    const sanitized = { ...metadata };

    if (sanitized.originalname) {
      sanitized.originalname = this.sanitizeFilename(sanitized.originalname);
    }

    if (sanitized.filename) {
      sanitized.filename = this.sanitizeFilename(sanitized.filename);
    }

    // Limpiar otros campos sensibles
    delete sanitized.path;
    delete sanitized.destination;
    delete sanitized.buffer;

    return sanitized;
  }
}
