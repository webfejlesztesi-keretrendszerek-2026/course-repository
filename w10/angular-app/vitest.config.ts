import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/test-utils/vitest.setup.ts'),
    deps: {
      inline: ['@firebase/firestore', 'firebase/firestore', '@firebase/logger']
    },
    testTimeout: 10000,
  },
  optimizeDeps: {
    exclude: ['@firebase/firestore', 'firebase/firestore']
  },
  resolve: {
    alias: [
      { find: /^@firebase\/firestore(.*)/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: /^firebase\/firestore(.*)/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.node.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.node.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      // Also map likely absolute/relative node_modules paths that the bundler
      // may emit during build so they are replaced with our mock during tests.
      { find: path.resolve(__dirname, 'node_modules/@firebase/firestore/dist/index.node.mjs'), replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: path.resolve(__dirname, 'node_modules/@firebase/firestore/dist/index.esm.js'), replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: path.resolve(__dirname, 'node_modules/firebase/firestore/dist/index.node.mjs'), replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.esm.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.esm2017.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.esm.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.cjs.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/lite', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: /^@firebase\/firestore\/dist\/.*$/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: /^firebase\/firestore\/dist\/.*$/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.node.cjs.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.node.cjs.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.node.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.node.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
    ],
  },
});
