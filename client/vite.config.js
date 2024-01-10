import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
   plugins: [react()],
   server: {
      host: '0.0.0.0',
      port: 5000
   },
   resolve: {
      alias: {
         '@': '/src/',
         '@pages': '/src/pages/',
         '@components': '/src/components/',
         '@styles': '/src/assets/stylesheets/',
         '@utilities': '/src/utilities/',
         '@services': '/src/services/',
         '@hooks': '/src/hooks/',
      }
   },
});