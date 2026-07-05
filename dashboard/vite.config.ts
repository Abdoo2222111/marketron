import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@reports': path.resolve(__dirname, './src/reports'),
      '@exports': path.resolve(__dirname, './src/exports'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@templates': path.resolve(__dirname, './src/templates'),
      '@scripts': path.resolve(__dirname, './src/scripts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
