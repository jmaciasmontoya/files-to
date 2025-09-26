import * as fs from 'fs';
import * as path from 'path';

interface AppConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}

export class FileConfig {
  private static config: AppConfig;

  static getConfig(): AppConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config;
  }

  private static loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config', 'app.config.json');
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(configFile);
      } else {
        this.createDefaultConfig();
      }
    } catch (error) {
      console.warn('Error loading config, using defaults:', error.message);
      this.createDefaultConfig();
    }
  }

  private static createDefaultConfig() {
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ],
      uploadPath: './uploads'
    };

    // Crear directorio de config si no existe
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Crear archivo de configuración por defecto
    const configPath = path.join(configDir, 'app.config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  static getAllowedIPs(): string[] {
    try {
      const ipsPath = path.join(process.cwd(), 'config', 'allowed-ips.txt');
      if (fs.existsSync(ipsPath)) {
        const ipsContent = fs.readFileSync(ipsPath, 'utf-8');
        return ipsContent
          .split('\n')
          .map(ip => ip.trim())
          .filter(ip => ip && !ip.startsWith('#'));
      } else {
        // Crear archivo por defecto
        const defaultIPs = ['127.0.0.1', '::1', '0.0.0.0'];
        fs.writeFileSync(ipsPath, defaultIPs.join('\n') + '\n# Agregar IPs permitidas, una por línea\n');
        return defaultIPs;
      }
    } catch (error) {
      console.warn('Error loading IPs, allowing all:', error.message);
      return [];
    }
  }
}
