import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: '.',
    cssCodeSplit: false,
    rollupOptions: {
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
