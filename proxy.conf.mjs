import { existsSync } from 'node:fs';

// Dev only: the proxy reads API_URL and API_TOKEN from .env; variables already set in the shell win.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const apiUrl = process.env.API_URL?.trim() || 'http://localhost:5001';
const apiToken = process.env.API_TOKEN?.trim() ?? '';

export default {
  '/api': {
    target: apiUrl,
    pathRewrite: { '^/api': '' },
    headers: { Authorization: `Bearer ${apiToken}` },
    changeOrigin: true,
  },
};
