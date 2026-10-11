import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [preact()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // Vercel sets VERCEL=1 during its builds.
    __ON_VERCEL__: JSON.stringify(Boolean(process.env.VERCEL)),
  },
  build: { target: 'es2022', cssCodeSplit: false, reportCompressedSize: true },
})
