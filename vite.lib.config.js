import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' with { type: 'json' }

// Library build: what gets published to npm (`npm run build:lib`, run automatically before `npm publish`).
// The dev app / live demo is built separately by vite.config.js.

// Dependencies and peer dependencies stay external so the app's bundler resolves (and dedupes) them.
const externalPackages = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)]

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'vue-calendarium',
      cssFileName: 'vue-calendarium'
    },
    rolldownOptions: {
      external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
      output: {
        // Import the component styles from the JS entry, so apps get them without an extra import
        banner: "import './vue-calendarium.css';"
      }
    }
  }
})
