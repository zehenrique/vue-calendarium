import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' with { type: 'json' }

// Library build: what gets published to npm (`npm run build:lib`, run automatically before `npm publish`).
// The dev app / live demo is built separately by vite.config.js.

// Dependencies and peer dependencies stay external so the app's bundler resolves (and dedupes) them.
const externalPackages = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)]

// Two entry files:
// - lib/vue-calendarium.js: the code, without importing CSS, so Node can import it (server-side
//   rendering, scripts). package.json points the "node" condition at it.
// - lib/index.js: imports the styles, then the code, so apps built with a bundler get the styles
//   without an extra import. package.json points everything else at it.
const styledEntry = {
  name: 'styled-entry',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'index.js',
      source: [
        '// The calendar with its styles, for bundlers (the "node" condition uses vue-calendarium.js)',
        "import './vue-calendarium.css';",
        "export * from './vue-calendarium.js';",
        "export { default } from './vue-calendarium.js';",
        ''
      ].join('\n')
    })
  }
}

export default defineConfig({
  plugins: [vue(), styledEntry],
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
      external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`))
    }
  }
})
