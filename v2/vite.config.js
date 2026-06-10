import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served on GitHub Pages alongside V1 at
// https://<user>.github.io/hdb-monetisation-guide/v2/
export default defineConfig({
  base: '/hdb-monetisation-guide/v2/',
  plugins: [react()],
})
