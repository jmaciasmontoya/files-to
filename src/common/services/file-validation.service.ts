import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface FileValidationResult {
  isValid: boolean;
  actualType: string;
  detectedMimeType: string;
  error?: string;
  details?: any;
}

@Injectable()
export class FileValidationService {
  
  /**
   * Valida el contenido real de un archivo usando múltiples herramientas
   */
  async validateFileContent(filePath: string, expectedMimeType: string): Promise<FileValidationResult> {
    try {
      // 1. Validación con 'file' command (más confiable)
      const fileResult = await this.validateWithFileCommand(filePath);
      
      // 2. Validación específica según el tipo esperado
      let specificValidation: FileValidationResult;
      
      if (expectedMimeType.startsWith('application/pdf')) {
        specificValidation = await this.validatePDF(filePath);
      } else if (expectedMimeType.startsWith('image/')) {
        specificValidation = await this.validateImage(filePath);
      } else {
        specificValidation = { isValid: false, actualType: 'unknown', detectedMimeType: 'unknown', error: 'Tipo no soportado' };
      }
      
      // 3. Combinar resultados - ambos deben ser válidos
      const isValid = fileResult.isValid && specificValidation.isValid;
      
      return {
        isValid,
        actualType: fileResult.actualType,
        detectedMimeType: fileResult.detectedMimeType,
        error: isValid ? undefined : `Archivo no válido. Detectado: ${fileResult.actualType}, Esperado: ${expectedMimeType}`,
        details: {
          fileCommand: fileResult,
          specificValidation: specificValidation
        }
      };
      
    } catch (error) {
      return {
        isValid: false,
        actualType: 'error',
        detectedMimeType: 'unknown',
        error: `Error en validación: ${error.message}`
      };
    }
  }
  
  /**
   * Valida usando el comando 'file' del sistema
   */
  private async validateWithFileCommand(filePath: string): Promise<FileValidationResult> {
    try {
      const { stdout } = await execAsync(`file -b --mime-type "${filePath}"`);
      const detectedMimeType = stdout.trim();
      
      // Mapear tipos detectados a tipos esperados
      const typeMapping = {
        'application/pdf': ['application/pdf'],
        'image/jpeg': ['image/jpeg', 'image/jpg'],
        'image/png': ['image/png'],
        'image/gif': ['image/gif'],
        'image/webp': ['image/webp']
      };
      
      let isValid = false;
      let actualType = detectedMimeType;
      
      // Verificar si el tipo detectado coincide con algún tipo permitido
      for (const [allowedType, detectedTypes] of Object.entries(typeMapping)) {
        if (detectedTypes.includes(detectedMimeType)) {
          isValid = true;
          actualType = allowedType;
          break;
        }
      }
      
      return {
        isValid,
        actualType,
        detectedMimeType
      };
      
    } catch (error) {
      return {
        isValid: false,
        actualType: 'unknown',
        detectedMimeType: 'unknown',
        error: `Error ejecutando file command: ${error.message}`
      };
    }
  }
  
  /**
   * Valida específicamente archivos PDF usando pdfinfo
   */
  private async validatePDF(filePath: string): Promise<FileValidationResult> {
    try {
      const { stdout, stderr } = await execAsync(`pdfinfo "${filePath}"`);
      
      if (stderr && stderr.includes('Error')) {
        return {
          isValid: false,
          actualType: 'not-pdf',
          detectedMimeType: 'unknown',
          error: 'Archivo no es un PDF válido'
        };
      }
      
      // Si pdfinfo no da error, es un PDF válido
      return {
        isValid: true,
        actualType: 'application/pdf',
        detectedMimeType: 'application/pdf'
      };
      
    } catch (error) {
      return {
        isValid: false,
        actualType: 'not-pdf',
        detectedMimeType: 'unknown',
        error: `PDF inválido: ${error.message}`
      };
    }
  }
  
  /**
   * Valida específicamente archivos de imagen usando ImageMagick
   */
  private async validateImage(filePath: string): Promise<FileValidationResult> {
    try {
      const { stdout, stderr } = await execAsync(`identify "${filePath}"`);
      
      if (stderr && stderr.includes('error')) {
        return {
          isValid: false,
          actualType: 'not-image',
          detectedMimeType: 'unknown',
          error: 'Archivo no es una imagen válida'
        };
      }
      
      // Extraer información de la imagen
      const imageInfo = stdout.trim();
      let detectedMimeType = 'image/unknown';
      
      if (imageInfo.includes('JPEG')) {
        detectedMimeType = 'image/jpeg';
      } else if (imageInfo.includes('PNG')) {
        detectedMimeType = 'image/png';
      } else if (imageInfo.includes('GIF')) {
        detectedMimeType = 'image/gif';
      } else if (imageInfo.includes('WebP')) {
        detectedMimeType = 'image/webp';
      }
      
      return {
        isValid: true,
        actualType: detectedMimeType,
        detectedMimeType
      };
      
    } catch (error) {
      return {
        isValid: false,
        actualType: 'not-image',
        detectedMimeType: 'unknown',
        error: `Imagen inválida: ${error.message}`
      };
    }
  }
  
  /**
   * Valida usando exiftool para metadatos adicionales
   */
  async validateWithExifTool(filePath: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`exiftool -json "${filePath}"`);
      return JSON.parse(stdout);
    } catch (error) {
      return null;
    }
  }
}
