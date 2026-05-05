import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { ToastService } from './toast.service';
import type { User as AppUser } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _firebaseUser: WritableSignal<FirebaseAuthUser | null> = signal<FirebaseAuthUser | null>(null);
  private _appUser: WritableSignal<AppUser | null> = signal<AppUser | null>(null);
  private _loading: WritableSignal<boolean> = signal<boolean>(true);
  private _error: WritableSignal<string | null> = signal<string | null>(null);

  public currentUser: Signal<AppUser | null> = computed(() => this._appUser());
  public isLoggedIn: Signal<boolean> = computed(() => !!this._appUser());
  public loading: Signal<boolean> = computed(() => this._loading());
  public uid: Signal<string | null> = computed(() => (this._firebaseUser() ? this._firebaseUser()!.uid : null));
  public error: Signal<string | null> = computed(() => this._error());

  constructor(private toast: ToastService) {
    this._loading.set(true);

    onAuthStateChanged(auth, async (firebaseUser) => {
      this._firebaseUser.set(firebaseUser ?? null);

      if (firebaseUser) {
        try {
          const uid = firebaseUser.uid;
          const ref = doc(db, 'users', uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data() as AppUser;
            this._appUser.set(data);
          } else {
            const defaultUser: AppUser = {
              uid,
              name: firebaseUser.displayName || uid,
              email: firebaseUser.email || '',
              avatarUrl: (firebaseUser.photoURL as string) || null,
              preferences: {
                diet: [],
                dailyCalorieGoal: 2000,
                householdSize: 1,
                measurementSystem: 'metric',
                theme: 'light',
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(ref, { ...defaultUser, createdAt: serverTimestamp() });
            this._appUser.set(defaultUser);
          }
        } catch (err) {
          const msg = (err as Error).message || 'Ismeretlen hiba az auth betöltésekor';
          this._error.set(msg);
          this.toast.error(msg);
        }
      } else {
        this._appUser.set(null);
      }

      this._loading.set(false);
    });

    // Test helper: when running under Cypress, expose a function to set
    // the authenticated user directly from the browser test harness. This is
    // only active in test runs and does not affect normal runtime.
    try {
      const w = window as any
      if (w && w.Cypress) {
        // if a pre-provided test user exists on window, apply it now
        if (w.__CYPRESS_TEST_USER) {
          const u = w.__CYPRESS_TEST_USER
          this._firebaseUser.set({ uid: u.uid, email: u.email, displayName: u.name } as any)
          this._appUser.set({ uid: u.uid, name: u.name, email: u.email, avatarUrl: null, preferences: { diet: [], dailyCalorieGoal: 2000, householdSize: 1, measurementSystem: 'metric', theme: 'light' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
          this._loading.set(false)
        }

        // expose a setter that tests can call: window.__cypress_setAuthUser({uid,name,email})
        w.__cypress_setAuthUser = (u: { uid: string; name?: string; email?: string } | null) => {
          if (!u) {
            this._firebaseUser.set(null)
            this._appUser.set(null)
            return
          }

          this._firebaseUser.set({ uid: u.uid, email: u.email || '', displayName: u.name || u.uid } as any)
          this._appUser.set({ uid: u.uid, name: u.name || u.uid, email: u.email || '', avatarUrl: null, preferences: { diet: [], dailyCalorieGoal: 2000, householdSize: 1, measurementSystem: 'metric', theme: 'light' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        }
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  public async register(name: string, email: string, password: string): Promise<void> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;
      const uid = firebaseUser.uid;

      const appUser: AppUser = {
        uid,
        name,
        email,
        avatarUrl: (firebaseUser.photoURL as string) || null,
        preferences: {
          diet: [],
          dailyCalorieGoal: 2000,
          householdSize: 1,
          measurementSystem: 'metric',
          theme: 'light',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), { ...appUser, createdAt: serverTimestamp() });
      this.toast.success('Regisztráció sikeres.');
    } catch (err) {
      const msg = (err as Error).message || 'Hiba történt regisztráció közben.';
      this._error.set(msg);
      this.toast.error(msg);
      throw err;
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      this.toast.success('Bejelentkezés sikeres.');
    } catch (_err) {
      const msg = 'Hibás email vagy jelszó';
      this._error.set(msg);
      this.toast.error(msg);
      throw new Error(msg);
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.toast.success('Kijelentkezés sikeres.');
    } catch (err) {
      const msg = (err as Error).message || 'Hiba a kijelentkezéskor.';
      this._error.set(msg);
      this.toast.error(msg);
      throw err;
    }
  }

  public async deleteAccount(): Promise<void> {
    const firebaseUser = this._firebaseUser();
    if (!firebaseUser) {
      const msg = 'Nincs bejelentkezett felhasználó.';
      this._error.set(msg);
      this.toast.error(msg);
      throw new Error(msg);
    }

    try {
      // Delete from Firebase Auth
      await deleteUser(firebaseUser);

      // Delete Firestore profile
      await deleteDoc(doc(db, 'users', firebaseUser.uid));

      this.toast.success('Fiók törölve.');
    } catch (err) {
      const msg = (err as Error).message || 'Hiba a fiók törlése közben.';
      this._error.set(msg);
      this.toast.error(msg);
      throw err;
    }
  }

  // Update the stored app user with a partial patch
  public updateAppUser(patch: Partial<AppUser>) {
    this._appUser.update((u) => {
      if (!u) return u;
      const next: AppUser = { ...u } as AppUser;
      if (patch.name !== undefined) next.name = patch.name;
      if (patch.email !== undefined) next.email = patch.email;
      if (patch.avatarUrl !== undefined) next.avatarUrl = patch.avatarUrl;
      if (patch.preferences) {
        next.preferences = { ...next.preferences, ...patch.preferences } as AppUser['preferences'];
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }
}
