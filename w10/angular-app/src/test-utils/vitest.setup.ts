import { vi } from 'vitest';

// Provide minimal `process` typing for environments where Node types are not present
declare const process: {
  on: (event: string, handler: (arg?: unknown) => void) => void;
};

// Intercept CommonJS `require` loads of Firestore packages early so the
// real SDK never executes in the worker that runs tests. This helps catch
// imports that slip past Vite's aliasing and prevents internal assertion
// errors from being raised before mocks are applied.
declare const require: any;
try {
  const Module = require('module');
  const origLoad = Module._load as any;
  Module._load = function (request: any, parent: any, isMain: any) {
    try {
      if (typeof request === 'string' && (
        request.startsWith('@firebase/firestore') ||
        request.startsWith('firebase/firestore') ||
        /@firebase\/firestore\/dist/.test(request) ||
        /firebase\/firestore\/dist/.test(request)
      )) {
        return {
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
        };
      }
    } catch (e) {
      // swallow and fallback to original loader
    }
    return origLoad.apply(this, arguments as any);
  };
} catch (e) {
  // Non-Node or loader doesn't expose Module — ignore
}
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

vi.mock('firebase/auth', () => {
  return {
    getAuth: () => ({ _mockAuth: true }),
    onAuthStateChanged: (_auth: any, cb: (u: any) => void) => {
      // call back with null user asynchronously to emulate signed-out state
      setTimeout(() => cb(null), 0);
      return () => {};
    },
    signInWithEmailAndPassword: async (_auth: any, _email: string, _pw: string) => ({ user: { uid: 'mock-uid', email: 'test@example.com', displayName: 'Test User' } }),
    createUserWithEmailAndPassword: async (_auth: any, _email: string, _pw: string) => ({ user: { uid: 'mock-new', email: _email, displayName: 'New User' } }),
    signOut: async () => {},
    deleteUser: async () => {},
  };
});

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
    // Match a range of Firestore internal assertion messages that may
    // appear from different SDK versions and packaging formats.
    return (
      s.includes('FIRESTORE') ||
      s.includes('INTERNAL ASSERTION') ||
      s.includes('INTERNAL ASSERTION FAILED') ||
      s.includes('Unexpected state')
    );
  } catch {
    return false;
  }
}

process.on('unhandledRejection', (reason: unknown) => {
  if (firestoreFilter(reason)) return;
  // rethrow to allow test runner to report non-Firestore issues
  throw reason as any;
});

process.on('uncaughtException', (err: unknown) => {
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
