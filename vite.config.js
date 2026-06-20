import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('VITE CONFIG LOADED', process.cwd());

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  cacheDir: false,
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    rollupOptions: {
      cache: false,
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames(chunkInfo) {
          if (chunkInfo.names && chunkInfo.names.some(n => n.endsWith('.css'))) {
            return 'bundle.css';
          }
          return '[name][extname]';
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
