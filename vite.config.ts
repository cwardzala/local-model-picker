import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [preact()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: { target: 'es2022', cssCodeSplit: false, reportCompressedSize: true },
})
