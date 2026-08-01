import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to FastAPI during local development only
    proxy: {
      '/parse': 'http://localhost:8000',
      '/calculate': 'http://localhost:8000',
      '/finish': 'http://localhost:8000',
    },
  },
  define: {
    // VITE_API_URL is set in Vercel environment variables
    // In local dev it is empty string, so Vite proxy handles it
    __API_URL__: JSON.stringify(process.env.VITE_API_URL ?? ''),
  },
})
