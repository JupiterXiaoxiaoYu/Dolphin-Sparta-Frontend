import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: path.resolve(__dirname, 'src/utils/crypto-polyfill.ts')
    }
  },
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true
    }
  }
}); 