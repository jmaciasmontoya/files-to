import { SetMetadata } from '@nestjs/common';

export const AuthType = (type: 'jwt' | 'api-key') => SetMetadata('authType', type);
