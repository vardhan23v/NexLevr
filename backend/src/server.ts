import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createApp } from './app';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not defined');
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

const app = createApp({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

app.set('trust proxy', 1);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
