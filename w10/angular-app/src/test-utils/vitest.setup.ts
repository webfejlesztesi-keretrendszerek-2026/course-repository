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
