// Expose helper functions for Cypress to sign in via the Firebase SDK
// This file is safe to import in production; it only attaches helpers when
// `window.Cypress` is truthy.
import { signInWithEmailAndPassword, signInWithCustomToken, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../app/firebase.config';

declare global {
  interface Window {
    Cypress?: any;
    firebaseSignInWithEmailAndPassword?: (email: string, password: string) => Promise<any>;
    firebaseSignInWithCustomToken?: (token: string) => Promise<any>;
  }
}

if (typeof window !== 'undefined' && (window as any).Cypress) {
  ;(window as any).firebaseSignInWithEmailAndPassword = async (email: string, password: string) => {
    // Ensure persistence is set to local to emulate real browser behavior
    try {
      await setPersistence(auth, browserLocalPersistence)
    } catch (e) {
      // ignore persistence errors in test env
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  ;(window as any).firebaseSignInWithCustomToken = async (token: string) => {
    try {
      await setPersistence(auth, browserLocalPersistence)
    } catch (e) {
      // ignore
    }
    return signInWithCustomToken(auth, token)
  }
}

export {}
