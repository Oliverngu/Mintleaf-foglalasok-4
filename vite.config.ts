import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify('legacy-demo-no-api'),
        'process.env.GEMINI_API_KEY': JSON.stringify('legacy-demo-no-api')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'firebase/app': path.resolve(__dirname, 'src/legacy-demo/app.ts'),
          'firebase/firestore': path.resolve(__dirname, 'src/legacy-demo/firestore.ts'),
          'firebase/auth': path.resolve(__dirname, 'src/legacy-demo/auth.ts'),
          'firebase/storage': path.resolve(__dirname, 'src/legacy-demo/storage.ts'),
          '@google/genai': path.resolve(__dirname, 'src/legacy-demo/genai.ts'),
        }
      }
    };
});
