import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/test-utils/vitest.setup.ts'),
    testTimeout: 10000,
  },
  resolve: {
    alias: [
      { find: /^@firebase\/firestore(.*)/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: /^firebase\/firestore(.*)/, replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.node.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.node.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.esm.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.esm2017.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: 'firebase/firestore/dist/index.esm.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.mjs', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/dist/index.cjs.js', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
      { find: '@firebase/firestore/lite', replacement: path.resolve(__dirname, 'src/test-utils/firestore-mock.ts') },
    ],
  },
});
