import { Injectable, signal, WritableSignal, Signal, computed } from '@angular/core';
import { User } from '../models/index';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private _user: WritableSignal<User> = signal<User>({
    uid: 'user_demo',
    name: 'Minta Felhasználó',
    email: 'minta@email.hu',
    avatarUrl: null,
    preferences: {
      diet: [],
      dailyCalorieGoal: 2000,
      householdSize: 4,
      measurementSystem: 'metric',
      theme: 'light',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // toast visible signal
  private _toastVisible: WritableSignal<boolean> = signal<boolean>(false);

  // Expose read-only signals
  readonly user: Signal<User> = this._user.asReadonly();
  readonly diets = computed(() => this._user()?.preferences?.diet ?? []);
  readonly calorie = computed(() => this._user()?.preferences?.dailyCalorieGoal ?? 0);
  readonly household = computed(() => this._user()?.preferences?.householdSize ?? 1);
  readonly theme = computed(() => this._user()?.preferences?.theme ?? 'light');
  readonly units = computed(() => this._user()?.preferences?.measurementSystem ?? 'metric');
  readonly toastVisible: Signal<boolean> = this._toastVisible;

  // deep-merge update for user; merges top-level and preferences deeply
  updateUser(patch: Partial<User>) {
    this._user.update(u => {
      const next: User = { ...u };
      if (patch.name !== undefined) next.name = patch.name;
      if (patch.email !== undefined) next.email = patch.email;
      if (patch.avatarUrl !== undefined) next.avatarUrl = patch.avatarUrl;
      if (patch.preferences) {
        next.preferences = { ...next.preferences, ...patch.preferences };
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }

  // Accept replacing diets array
  updateDiets(diets: string[]) {
    this._user.update(u => ({ ...u, preferences: { ...u.preferences, diet: diets }, updatedAt: new Date().toISOString() }));
  }

  setCalorie(value: number) {
    this._user.update(u => ({ ...u, preferences: { ...u.preferences, dailyCalorieGoal: value }, updatedAt: new Date().toISOString() }));
  }

  setHousehold(value: number) {
    this._user.update(u => ({ ...u, preferences: { ...u.preferences, householdSize: value }, updatedAt: new Date().toISOString() }));
  }

  setTheme(value: 'light' | 'dark' | 'system') {
    this._user.update(u => ({ ...u, preferences: { ...u.preferences, theme: value }, updatedAt: new Date().toISOString() }));
    // Apply theme attribute for immediate effect
    document.documentElement.setAttribute('data-theme', value === 'dark' ? 'dark' : 'light');
  }

  setUnits(value: 'metric' | 'imperial') {
    this._user.update(u => ({ ...u, preferences: { ...u.preferences, measurementSystem: value }, updatedAt: new Date().toISOString() }));
  }

  // Save action (demo): show toast briefly
  saveProfile() {
    this._toastVisible.set(true);
    setTimeout(() => this._toastVisible.set(false), 2000);
  }

  // Replace entire profile (useful for form submits)
  replaceProfile(profile: { user?: Partial<User>; diets?: string[]; calorie?: number; household?: number; theme?: 'light'|'dark'|'system'; units?: 'metric'|'imperial' }) {
    if (profile.user) this.updateUser(profile.user);
    if (profile.diets) this.updateDiets(profile.diets);
    if (typeof profile.calorie === 'number') this.setCalorie(profile.calorie);
    if (typeof profile.household === 'number') this.setHousehold(profile.household);
    if (profile.theme) this.setTheme(profile.theme);
    if (profile.units) this.setUnits(profile.units);
  }
}

export default ProfileService;
