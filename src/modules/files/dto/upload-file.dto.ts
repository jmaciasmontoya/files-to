import { IsString, IsOptional, IsNumber, Min, Max, Matches } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'El nombre del archivo solo puede contener letras, números, puntos, guiones y guiones bajos'
  })
  filename: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100 * 1024 * 1024) // 100MB máximo
  size?: number;
}
