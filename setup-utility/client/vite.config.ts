import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3300
 },
 resolve: {
    alias: {
      '@': '/src/',
      '@pages': '/src/pages',
      '@styles': '/src/assets/stylesheets',
      '@components': '/src/components',
      '@hooks': '/src/hooks'
    }
  }
})
