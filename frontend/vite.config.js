import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ink-dms',
  
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js'
    }
  
})
