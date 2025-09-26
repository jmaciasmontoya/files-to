export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  apiKey: {
    enabled: process.env.API_KEY_AUTH === 'true',
    keys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['default-api-key'],
  },
};
