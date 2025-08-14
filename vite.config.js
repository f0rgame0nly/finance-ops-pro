import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // يضمن أن الروابط الداخلية تشتغل
  server: {
    allowedHosts: ['.csb.app'] // يسمح بالرابط الخاص بكودساندبوكس
  }
})
