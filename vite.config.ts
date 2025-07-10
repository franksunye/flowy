import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Flowy',
      formats: ['es', 'umd', 'cjs'],
      fileName: format => {
        switch (format) {
          case 'es':
            return 'flowy.esm.js';
          case 'umd':
            return 'flowy.js';
          case 'cjs':
            return 'flowy.cjs.js';
          default:
            return 'flowy.js';
        }
      },
    },
    rollupOptions: {
      external: ['react', 'vue'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/renderer': resolve(__dirname, 'src/renderer'),
      '@/utils': resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
