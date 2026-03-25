import { Injectable, signal, WritableSignal, Signal } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
}

export interface DietFlags {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private _user: WritableSignal<UserProfile> = signal<UserProfile>({
    name: 'Minta Felhasználó',
    email: 'minta@email.hu',
    password: ''
  });

  private _diets: WritableSignal<DietFlags> = signal<DietFlags>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
  });

  private _calorie: WritableSignal<number> = signal<number>(2000);
  private _household: WritableSignal<number> = signal<number>(4);
  private _theme: WritableSignal<'light' | 'dark' | 'system'> = signal<'light' | 'dark' | 'system'>('light');
  private _units: WritableSignal<'metric' | 'imperial'> = signal<'metric' | 'imperial'>('metric');

  // toast visible signal
  private _toastVisible: WritableSignal<boolean> = signal<boolean>(false);

  // Expose read-only signals
  readonly user: Signal<UserProfile> = this._user;
  readonly diets: Signal<DietFlags> = this._diets;
  readonly calorie: Signal<number> = this._calorie;
  readonly household: Signal<number> = this._household;
  readonly theme: Signal<'light' | 'dark' | 'system'> = this._theme;
  readonly units: Signal<'metric' | 'imperial'> = this._units;
  readonly toastVisible: Signal<boolean> = this._toastVisible;

  updateUser(patch: Partial<UserProfile>) {
    this._user.update(u => ({ ...u, ...patch }));
  }

  updateDiets(patch: Partial<DietFlags>) {
    this._diets.update(d => ({ ...d, ...patch }));
  }

  setCalorie(value: number) {
    this._calorie.set(value);
  }

  setHousehold(value: number) {
    this._household.set(value);
  }

  setTheme(value: 'light' | 'dark' | 'system') {
    this._theme.set(value);
    // Apply theme attribute for immediate effect
    document.documentElement.setAttribute('data-theme', value === 'dark' ? 'dark' : 'light');
  }

  setUnits(value: 'metric' | 'imperial') {
    this._units.set(value);
  }

  // Save action (demo): show toast briefly
  saveProfile() {
    this._toastVisible.set(true);
    setTimeout(() => this._toastVisible.set(false), 2000);
  }

  // Replace entire profile (useful for form submits)
  replaceProfile(profile: { user?: Partial<UserProfile>; diets?: Partial<DietFlags>; calorie?: number; household?: number; theme?: 'light'|'dark'|'system'; units?: 'metric'|'imperial' }) {
    if (profile.user) this.updateUser(profile.user);
    if (profile.diets) this.updateDiets(profile.diets);
    if (typeof profile.calorie === 'number') this._calorie.set(profile.calorie);
    if (typeof profile.household === 'number') this._household.set(profile.household);
    if (profile.theme) this._theme.set(profile.theme);
    if (profile.units) this._units.set(profile.units);
  }
}

export default ProfileService;
