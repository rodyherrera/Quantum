/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
   plugins: [/*basicSsl()*/, react()],
   server: {
      host: '0.0.0.0',
      port: 5000,
      //https: true
   },
   resolve: {
      alias: {
         '@': '/src/',
         '@pages': '/src/pages/',
         '@assets': '/src/assets/',
         '@components': '/src/components/',
         '@styles': '/src/assets/stylesheets/',
         '@utilities': '/src/utilities/',
         '@services': '/src/services/',
         '@hooks': '/src/hooks/',
         '@images': '/src/assets/images/'
      }
   },
});