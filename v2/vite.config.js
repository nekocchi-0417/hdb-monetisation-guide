import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production builds are served on GitHub Pages alongside V1 at
// https://<user>.github.io/hdb-monetisation-guide/v2/ — but local dev stays at
// root so the preview/dev server serves from '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hdb-monetisation-guide/v2/' : '/',
  plugins: [react()],
}))
