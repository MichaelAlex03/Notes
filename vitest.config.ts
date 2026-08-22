import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      JWT_SECRET: 'test-jwt-secret-that-is-long-enough-32b!!',
      REFRESH_TOKEN_SECRETT: 'test-refresh-secret-long-enough-32b!!',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
