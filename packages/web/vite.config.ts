import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import typia from '@typia/unplugin/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    typia({ tsconfig: './tsconfig.app.json', cache: true }), 
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0'
  },
  build: {
    // The public landing builds apart from the dashboard, which is what a self-hosted Quantum serves.
    outDir: mode === 'landing' ? 'dist-landing' : 'dist'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/tests/*.test.{ts,tsx}'],
    setupFiles: ['./src/shared/tests/setup.ts']
  }
}))
