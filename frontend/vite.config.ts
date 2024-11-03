import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sass from 'sass'


export default defineConfig({
  plugins: [react()],
  // base: '/~ahai22/editor/',
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  define: {
    global: 'window', // Define global as window
  },
});
