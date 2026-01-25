import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/log' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const logPath = path.resolve(__dirname, '../customer.log');
                fs.appendFileSync(logPath, body + '\n');
                res.statusCode = 200;
                res.end('OK');
              } catch (err) {
                console.error('Failed to write to log file:', err);
                res.statusCode = 500;
                res.end('Error');
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    host: true, // Listen on all addresses including LAN
    port: 5173,
  },
})
