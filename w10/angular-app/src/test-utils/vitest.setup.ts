import { vi } from 'vitest';

// Basic in-memory mock for Firebase modules used by the app during tests.
vi.mock('firebase/app', () => ({
  initializeApp: (cfg: any) => ({ _mockApp: true, cfg }),
}));

let _idCounter = 0;
vi.mock('firebase/firestore', () => {
  const docs: any[] = [];

  return {
    getFirestore: () => ({}),
    collection: (..._args: any[]) => ({}),
    query: (..._args: any[]) => ({}),
    orderBy: (..._args: any[]) => ({}),
    where: (..._args: any[]) => ({}),
    getDocs: async (_q: any) => ({ docs: [] }),
    addDoc: async (_col: any, data: any) => {
      const id = `mock-${++_idCounter}`;
      const doc = { id, data: () => data };
      docs.push(doc);
      return { id };
    },
    serverTimestamp: () => new Date().toISOString(),
    doc: (..._args: any[]) => ({ _mockDoc: true }),
    getDoc: async (_ref: any) => ({ exists: () => false, id: null, data: () => null }),
    updateDoc: async () => {},
    deleteDoc: async () => {},
    onSnapshot: (_q: any, _next?: any, _err?: any) => {
      // return unsubscribe
      return () => {};
    },
  };
});

vi.mock('firebase/auth', () => ({
  getAuth: () => ({ _mockAuth: true }),
}));

// Provide a no-op console.warn to reduce noisy logs during tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (String(args[0]).includes('DEPRECATED: DI is instantiating')) return;
  originalWarn(...args);
};

// Some codepaths import the internal package name '@firebase/firestore' — mock it too.
vi.mock('@firebase/firestore', () => {
  let _idCounter = 0;
  const docs: any[] = [];
  return {
    getFirestore: () => ({}),
    collection: (..._args: any[]) => ({}),
    query: (..._args: any[]) => ({}),
    orderBy: (..._args: any[]) => ({}),
    where: (..._args: any[]) => ({}),
    getDocs: async (_q: any) => ({ docs: [] }),
    addDoc: async (_col: any, data: any) => {
      const id = `mock-${++_idCounter}`;
      const doc = { id, data: () => data };
      docs.push(doc);
      return { id };
    },
    serverTimestamp: () => new Date().toISOString(),
    doc: (..._args: any[]) => ({ _mockDoc: true }),
    getDoc: async (_ref: any) => ({ exists: () => false, id: null, data: () => null }),
    updateDoc: async () => {},
    deleteDoc: async () => {},
    onSnapshot: (_q: any, _next?: any, _err?: any) => {
      return () => {};
    },
  };
});

// Additional mocks for prebundled / dist entry points that Vite or Angular compiler
// might import directly during testing. These prevent the real SDK internals
// from executing and triggering internal assertion errors.
const simpleFsMock = () => ({
  getFirestore: () => ({}),
  collection: () => ({}),
  query: () => ({}),
  orderBy: () => ({}),
  where: () => ({}),
  getDocs: async () => ({ docs: [] }),
  addDoc: async () => ({}),
  serverTimestamp: () => ({}),
  doc: () => ({}),
  getDoc: async () => ({ exists: () => false, data: () => null }),
  updateDoc: async () => {},
  deleteDoc: async () => {},
  onSnapshot: (_q: any, _next?: any) => () => {},
})

try {
  vi.mock('@firebase/firestore/dist/index.node.mjs', simpleFsMock)
} catch {}

try {
  vi.mock('firebase/firestore/dist/index.node.mjs', simpleFsMock)
} catch {}

try {
  vi.mock('firebase/firestore/dist/esm/index.esm.js', simpleFsMock)
} catch {}

try {
  vi.mock('@firebase/firestore/dist/index.esm2017.js', simpleFsMock)
} catch {}
 
try {
  vi.mock('@firebase/firestore/dist/index.esm.js', simpleFsMock)
} catch {}

try {
  vi.mock('@firebase/firestore/dist/index.mjs', simpleFsMock)
} catch {}

try {
  vi.mock('@firebase/firestore/dist/index.cjs.js', simpleFsMock)
} catch {}

try {
  vi.mock('@firebase/firestore/lite', simpleFsMock)
} catch {}

// Suppress noisy Firestore internal assertion unhandled rejections during tests
const firestoreFilter = (err: any) => {
  try {
    const s = String(err && (err.stack || err.message || err));
    return s.includes('FIRESTORE') || s.includes('INTERNAL ASSERTION');
  } catch {
    return false;
  }
}

process.on('unhandledRejection', (reason) => {
  if (firestoreFilter(reason)) return;
  // rethrow to allow test runner to report non-Firestore issues
  throw reason as any;
});

process.on('uncaughtException', (err) => {
  if (firestoreFilter(err)) return;
  throw err;
});

// Also handle browser/jsdom unhandled rejection/error events
if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', (ev: any) => {
    if (firestoreFilter(ev && ev.reason)) ev.preventDefault();
  });
  globalThis.addEventListener('error', (ev: any) => {
    if (firestoreFilter(ev && ev.error)) ev.preventDefault();
  });
}

// Filter console.error messages that come from Firestore internals to reduce noise
const originalError = console.error;
console.error = (...args: any[]) => {
  try {
    if (args.some((a) => String(a).includes('FIRESTORE') || String(a).includes('INTERNAL ASSERTION'))) return;
  } catch {}
  originalError(...args);
};
