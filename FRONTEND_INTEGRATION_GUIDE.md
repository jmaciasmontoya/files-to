# 🚀 Guía de Integración Frontend - Sistema de Gestión de Archivos

## 📋 **Información General**

**Backend URL:** `http://localhost:3000`  
**Tecnología:** NestJS + PostgreSQL  
**Autenticación:** JWT  
**Validación:** Robusta con detección de contenido real  
**Seguridad:** Rate Limiting, Headers de Seguridad, Sanitización, Monitoreo

---

## 🔐 **Autenticación**

### **Endpoints de Autenticación**

#### **1. Generar Token de Prueba (Solo para desarrollo)**
```javascript
// POST /auth/test-token
const response = await fetch('http://localhost:3000/auth/test-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
const token = data.access_token;
```

#### **2. Login Real (Para producción)**
```javascript
// POST /auth/login
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'tu_usuario',
    password: 'tu_contraseña'
  })
});

const data = await response.json();
const token = data.access_token;
```

---

## 🛡️ **Características de Seguridad**

### **Rate Limiting**
El sistema implementa rate limiting multi-nivel para prevenir ataques DDoS:
- **Uploads:** 3 requests por segundo
- **Downloads:** 10 requests por segundo  
- **Info:** 20 requests por segundo
- **Delete:** 5 requests por segundo

### **Headers de Seguridad**
El backend incluye headers de seguridad automáticos:
- **X-Content-Type-Options:** nosniff
- **X-Frame-Options:** DENY
- **X-XSS-Protection:** 1; mode=block
- **Content-Security-Policy:** Configurado
- **Strict-Transport-Security:** Configurado

### **Sanitización de Archivos**
- Nombres de archivo se sanitizan automáticamente
- Caracteres peligrosos se eliminan o reemplazan
- Protección contra path traversal

### **Monitoreo de Seguridad**
- Logging estructurado de eventos de seguridad
- Tracking de IPs en tiempo real
- Bloqueo automático de IPs sospechosas

---

## 📁 **Endpoints de Archivos**

### **Base URL:** `http://localhost:3000/files`

### **1. Subir Archivo**

#### **Endpoint:** `POST /files/upload`
#### **Autenticación:** Requerida (JWT)

```javascript
const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    const data = await response.json();
    return data; // { success: true, uuid: "...", message: "..." }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

#### **Respuesta Exitosa:**
```json
{
  "success": true,
  "uuid": "e4c06ddc-4a5b-4683-a9b1-94c539b20190",
  "message": "Archivo subido exitosamente"
}
```

#### **Respuesta de Error:**
```json
{
  "message": "El archivo es demasiado grande. Tamaño máximo: 10MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

### **2. Descargar Archivo**

#### **Endpoint:** `GET /files/:uuid`
#### **Autenticación:** Requerida (JWT)

```javascript
const downloadFile = async (uuid, token) => {
  try {
    const response = await fetch(`http://localhost:3000/files/${uuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al descargar archivo');
    }

    // El archivo se descarga directamente
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

### **3. Obtener Información del Archivo**

#### **Endpoint:** `GET /files/:uuid/info`
#### **Autenticación:** Requerida (JWT)

```javascript
const getFileInfo = async (uuid, token) => {
  try {
    const response = await fetch(`http://localhost:3000/files/${uuid}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener información');
    }

    const data = await response.json();
    return data; // { success: true, data: { ... } }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

#### **Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "e4c06ddc-4a5b-4683-a9b1-94c539b20190",
    "original_name": "documento.pdf",
    "file_path": "uploads/2025/09/e4c06ddc-4a5b-4683-a9b1-94c539b20190.pdf",
    "mime_type": "application/pdf",
    "size": "1024",
    "uploaded_at": "2025-09-26T20:33:14.316Z",
    "uploaded_by": null
  }
}
```

### **4. Eliminar Archivo**

#### **Endpoint:** `DELETE /files/:uuid`
#### **Autenticación:** Requerida (JWT)

```javascript
const deleteFile = async (uuid, token) => {
  try {
    const response = await fetch(`http://localhost:3000/files/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar archivo');
    }

    const data = await response.json();
    return data; // { success: true, message: "..." }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

---

## 🧪 **Endpoints de Prueba (Sin Autenticación)**

### **Base URL:** `http://localhost:3000/files-test`

**⚠️ IMPORTANTE:** Estos endpoints son solo para pruebas y desarrollo. NO usar en producción.

```javascript
// Subir archivo sin autenticación (solo para pruebas)
const uploadFileTest = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/files-test/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

---

## 🛡️ **Endpoints de Prueba Seguros (Con Rate Limiting)**

### **Base URL:** `http://localhost:3000/files-test-secure`

**⚠️ IMPORTANTE:** Estos endpoints incluyen rate limiting y son ideales para pruebas de seguridad.

```javascript
// Subir archivo con rate limiting (para pruebas de seguridad)
const uploadFileSecure = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/files-test-secure/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Demasiadas solicitudes.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

### **Endpoints Disponibles:**
- `POST /files-test-secure/upload` - Subir con rate limiting (3 req/s)
- `GET /files-test-secure/:uuid` - Descargar (10 req/s)
- `GET /files-test-secure/:uuid/info` - Info (20 req/s)
- `DELETE /files-test-secure/:uuid` - Eliminar (5 req/s)

---

## 📊 **Monitoreo de Seguridad (Requiere JWT)**

### **Base URL:** `http://localhost:3000/security`

**⚠️ IMPORTANTE:** Estos endpoints requieren autenticación JWT y son para administradores.

### **1. Obtener Estadísticas Generales**

#### **Endpoint:** `GET /security/stats`

```javascript
const getSecurityStats = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/security/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener estadísticas');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

#### **Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalIPs": 5,
    "blockedIPs": 1,
    "suspiciousIPs": 2,
    "stats": [
      {
        "ip": "192.168.1.100",
        "requestCount": 15,
        "maliciousAttempts": 0,
        "blocked": false,
        "lastRequest": "2025-09-26T20:33:14.316Z"
      }
    ]
  }
}
```

### **2. Obtener Estadísticas de IP Específica**

#### **Endpoint:** `GET /security/stats/:ip`

```javascript
const getIPStats = async (ip, token) => {
  try {
    const response = await fetch(`http://localhost:3000/security/stats/${ip}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener estadísticas de IP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

### **3. Bloquear IP**

#### **Endpoint:** `POST /security/block/:ip`

```javascript
const blockIP = async (ip, durationMinutes = 30, token) => {
  try {
    const response = await fetch(`http://localhost:3000/security/block/${ip}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        duration: durationMinutes
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al bloquear IP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

### **4. Desbloquear IP**

#### **Endpoint:** `POST /security/unblock/:ip`

```javascript
const unblockIP = async (ip, token) => {
  try {
    const response = await fetch(`http://localhost:3000/security/unblock/${ip}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al desbloquear IP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
```

---

## 🛡️ **Validaciones y Seguridad**

### **Tipos de Archivo Permitidos**
- `application/pdf` - Documentos PDF
- `image/jpeg` - Imágenes JPEG
- `image/jpg` - Imágenes JPG
- `image/png` - Imágenes PNG
- `image/gif` - Imágenes GIF
- `image/webp` - Imágenes WebP

### **Límites**
- **Tamaño máximo:** 10MB por archivo
- **Validación robusta:** El sistema valida el contenido real del archivo, no solo la extensión

### **Errores Comunes**

#### **Archivo muy grande:**
```json
{
  "message": "El archivo es demasiado grande. Tamaño máximo: 10MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### **Tipo de archivo no permitido:**
```json
{
  "message": "Tipo de archivo no permitido. Tipos permitidos: application/pdf, image/jpeg, image/jpg, image/png, image/gif, image/webp",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### **Archivo malicioso detectado:**
```json
{
  "message": "Archivo no válido: El archivo parece ser text/x-shellscript pero se reportó como application/pdf. Esto puede indicar un intento de subir un archivo malicioso.",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### **Token inválido:**
```json
{
  "message": "Token JWT inválido",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### **Rate limit excedido:**
```json
{
  "message": "Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.",
  "error": "Too Many Requests",
  "statusCode": 429
}
```

#### **IP bloqueada:**
```json
{
  "message": "Acceso denegado. IP bloqueada temporalmente.",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### **Nombre de archivo inseguro:**
```json
{
  "message": "Nombre de archivo no válido o inseguro",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 💻 **Ejemplos de Implementación**

### **React/JavaScript**

```jsx
import React, { useState } from 'react';

const FileUploader = () => {
  const [token, setToken] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener token de prueba
  const getTestToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/test-token', {
        method: 'POST'
      });
      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
  };

  // Subir archivo con manejo de rate limiting
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !token) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 429) {
          alert('Rate limit excedido. Espera un momento antes de intentar de nuevo.');
          return;
        }
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return;
      }

      const data = await response.json();
      setUploadedFiles(prev => [...prev, {
        uuid: data.uuid,
        name: file.name,
        size: file.size,
        type: file.type
      }]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir archivo');
    } finally {
      setLoading(false);
    }
  };

  // Descargar archivo
  const downloadFile = async (uuid, filename) => {
    try {
      const response = await fetch(`http://localhost:3000/files/${uuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar archivo');
    }
  };

  // Eliminar archivo
  const deleteFile = async (uuid) => {
    try {
      const response = await fetch(`http://localhost:3000/files/${uuid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar archivo');
      }

      setUploadedFiles(prev => prev.filter(file => file.uuid !== uuid));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar archivo');
    }
  };

  return (
    <div>
      <h2>Subir Archivos</h2>
      
      {!token && (
        <button onClick={getTestToken}>
          Obtener Token de Prueba
        </button>
      )}

      {token && (
        <>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            disabled={loading}
          />
          
          {loading && <p>Subiendo archivo...</p>}

          <h3>Archivos Subidos:</h3>
          <ul>
            {uploadedFiles.map(file => (
              <li key={file.uuid}>
                {file.name} ({file.size} bytes)
                <button onClick={() => downloadFile(file.uuid, file.name)}>
                  Descargar
                </button>
                <button onClick={() => deleteFile(file.uuid)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default FileUploader;
```

### **Vue.js**

```vue
<template>
  <div>
    <h2>Subir Archivos</h2>
    
    <button v-if="!token" @click="getTestToken">
      Obtener Token de Prueba
    </button>

    <div v-if="token">
      <input
        type="file"
        @change="handleFileUpload"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        :disabled="loading"
      />
      
      <p v-if="loading">Subiendo archivo...</p>

      <h3>Archivos Subidos:</h3>
      <ul>
        <li v-for="file in uploadedFiles" :key="file.uuid">
          {{ file.name }} ({{ file.size }} bytes)
          <button @click="downloadFile(file.uuid, file.name)">
            Descargar
          </button>
          <button @click="deleteFile(file.uuid)">
            Eliminar
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: '',
      uploadedFiles: [],
      loading: false
    };
  },
  methods: {
    async getTestToken() {
      try {
        const response = await fetch('http://localhost:3000/auth/test-token', {
          method: 'POST'
        });
        const data = await response.json();
        this.token = data.access_token;
      } catch (error) {
        console.error('Error obteniendo token:', error);
      }
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file || !this.token) return;

      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3000/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Error: ${error.message}`);
          return;
        }

        const data = await response.json();
        this.uploadedFiles.push({
          uuid: data.uuid,
          name: file.name,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error('Error:', error);
        alert('Error al subir archivo');
      } finally {
        this.loading = false;
      }
    },

    async downloadFile(uuid, filename) {
      try {
        const response = await fetch(`http://localhost:3000/files/${uuid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al descargar archivo');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al descargar archivo');
      }
    },

    async deleteFile(uuid) {
      try {
        const response = await fetch(`http://localhost:3000/files/${uuid}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar archivo');
        }

        this.uploadedFiles = this.uploadedFiles.filter(file => file.uuid !== uuid);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar archivo');
      }
    }
  }
};
</script>
```

### **Angular**

```typescript
// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTestToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/test-token`, {});
  }

  uploadFile(file: File, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/files/upload`, formData, { headers });
  }

  downloadFile(uuid: string, token: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/files/${uuid}`, { 
      headers, 
      responseType: 'blob' 
    });
  }

  getFileInfo(uuid: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/files/${uuid}/info`, { headers });
  }

  deleteFile(uuid: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}/files/${uuid}`, { headers });
  }
}
```

```typescript
// file-upload.component.ts
import { Component } from '@angular/core';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-file-upload',
  template: `
    <div>
      <h2>Subir Archivos</h2>
      
      <button *ngIf="!token" (click)="getTestToken()">
        Obtener Token de Prueba
      </button>

      <div *ngIf="token">
        <input
          type="file"
          (change)="handleFileUpload($event)"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          [disabled]="loading"
        />
        
        <p *ngIf="loading">Subiendo archivo...</p>

        <h3>Archivos Subidos:</h3>
        <ul>
          <li *ngFor="let file of uploadedFiles">
            {{ file.name }} ({{ file.size }} bytes)
            <button (click)="downloadFile(file.uuid, file.name)">
              Descargar
            </button>
            <button (click)="deleteFile(file.uuid)">
              Eliminar
            </button>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class FileUploadComponent {
  token = '';
  uploadedFiles: any[] = [];
  loading = false;

  constructor(private fileUploadService: FileUploadService) {}

  getTestToken() {
    this.fileUploadService.getTestToken().subscribe({
      next: (data) => {
        this.token = data.access_token;
      },
      error: (error) => {
        console.error('Error obteniendo token:', error);
      }
    });
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file || !this.token) return;

    this.loading = true;
    this.fileUploadService.uploadFile(file, this.token).subscribe({
      next: (data) => {
        this.uploadedFiles.push({
          uuid: data.uuid,
          name: file.name,
          size: file.size,
          type: file.type
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert(`Error: ${error.error?.message || 'Error al subir archivo'}`);
        this.loading = false;
      }
    });
  }

  downloadFile(uuid: string, filename: string) {
    this.fileUploadService.downloadFile(uuid, this.token).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al descargar archivo');
      }
    });
  }

  deleteFile(uuid: string) {
    this.fileUploadService.deleteFile(uuid, this.token).subscribe({
      next: () => {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.uuid !== uuid);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al eliminar archivo');
      }
    });
  }
}
```

---

## 📊 **Ejemplo de Monitoreo de Seguridad (React)**

```jsx
import React, { useState, useEffect } from 'react';

const SecurityMonitor = () => {
  const [token, setToken] = useState('');
  const [securityStats, setSecurityStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener token de prueba
  const getTestToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/test-token', {
        method: 'POST'
      });
      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
  };

  // Obtener estadísticas de seguridad
  const getSecurityStats = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/security/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      setSecurityStats(data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener estadísticas de seguridad');
    } finally {
      setLoading(false);
    }
  };

  // Bloquear IP
  const blockIP = async (ip, duration = 30) => {
    try {
      const response = await fetch(`http://localhost:3000/security/block/${ip}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      });

      if (!response.ok) {
        throw new Error('Error al bloquear IP');
      }

      alert(`IP ${ip} bloqueada por ${duration} minutos`);
      getSecurityStats(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error:', error);
      alert('Error al bloquear IP');
    }
  };

  // Desbloquear IP
  const unblockIP = async (ip) => {
    try {
      const response = await fetch(`http://localhost:3000/security/unblock/${ip}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al desbloquear IP');
      }

      alert(`IP ${ip} desbloqueada`);
      getSecurityStats(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desbloquear IP');
    }
  };

  useEffect(() => {
    if (token) {
      getSecurityStats();
    }
  }, [token]);

  return (
    <div>
      <h2>Monitoreo de Seguridad</h2>
      
      {!token && (
        <button onClick={getTestToken}>
          Obtener Token de Prueba
        </button>
      )}

      {token && (
        <>
          <button onClick={getSecurityStats} disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar Estadísticas'}
          </button>

          {securityStats && (
            <div>
              <h3>Estadísticas Generales</h3>
              <p>Total IPs: {securityStats.totalIPs}</p>
              <p>IPs Bloqueadas: {securityStats.blockedIPs}</p>
              <p>IPs Sospechosas: {securityStats.suspiciousIPs}</p>

              <h3>Detalles por IP</h3>
              <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th>IP</th>
                    <th>Requests</th>
                    <th>Intentos Maliciosos</th>
                    <th>Bloqueada</th>
                    <th>Última Actividad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {securityStats.stats.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat.ip}</td>
                      <td>{stat.requestCount}</td>
                      <td>{stat.maliciousAttempts}</td>
                      <td>{stat.blocked ? 'Sí' : 'No'}</td>
                      <td>{new Date(stat.lastRequest).toLocaleString()}</td>
                      <td>
                        {stat.blocked ? (
                          <button onClick={() => unblockIP(stat.ip)}>
                            Desbloquear
                          </button>
                        ) : (
                          <button onClick={() => blockIP(stat.ip)}>
                            Bloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SecurityMonitor;
```

---

## 🔧 **Configuración de CORS**

Si tienes problemas de CORS, asegúrate de que el backend esté configurado correctamente:

```typescript
// En el backend (main.ts)
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
});
```

### **Headers de Seguridad Automáticos**
El backend incluye automáticamente los siguientes headers de seguridad:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: default-src 'self'`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 📝 **Notas Importantes**

1. **Autenticación:** Siempre incluye el token JWT en el header `Authorization: Bearer <token>`
2. **Validación:** El sistema valida el contenido real del archivo, no solo la extensión
3. **Límites:** Máximo 10MB por archivo
4. **Tipos permitidos:** Solo PDF e imágenes (JPEG, PNG, GIF, WebP)
5. **Seguridad:** El sistema detecta y rechaza archivos maliciosos automáticamente
6. **Endpoints de prueba:** Usa `/files-test/*` solo para desarrollo, nunca en producción
7. **Rate Limiting:** El sistema implementa límites de velocidad para prevenir ataques DDoS
8. **Sanitización:** Los nombres de archivo se sanitizan automáticamente
9. **Monitoreo:** Usa `/security/*` para monitorear y gestionar la seguridad del sistema
10. **Headers de Seguridad:** El backend incluye headers de seguridad automáticamente

---

## 🚀 **Próximos Pasos**

1. Implementa la autenticación real en tu frontend
2. Agrega manejo de errores más robusto (incluyendo rate limiting)
3. Implementa progreso de subida para archivos grandes
4. Agrega validación de archivos en el frontend antes de enviar
5. Implementa cache de tokens para mejor UX
6. Integra el monitoreo de seguridad en tu panel de administración
7. Implementa retry automático para errores de rate limiting
8. Agrega notificaciones de seguridad en tiempo real

---

**¡Tu sistema de gestión de archivos está listo para integrar con cualquier frontend!** 🎉
