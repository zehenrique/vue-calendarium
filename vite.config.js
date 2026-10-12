import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // Relative asset paths so the built app also works on GitHub Pages (/vue-calendarium/)
  base: './',
  plugins: [vue()],
  build: {
    rolldownOptions: {
      // Website pages: the demo and the documentation (see site/)
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        docs: fileURLToPath(new URL('./docs.html', import.meta.url))
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
