import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // initialize form from AuthService current user
    const u = this.authService.currentUser();
    if (!u) {
      // guard should prevent this, but redirect as a safeguard
      this.router.navigate(['/login']);
      return;
    }

    const d = Array.isArray(u.preferences?.diet) ? u.preferences.diet : [];
    this.form = this.fb.group({
      name: [u.name, Validators.required],
      email: [u.email, [Validators.required, Validators.email]],
      password: [''],
      vegetarian: [d.includes('vegetarian')],
      vegan: [d.includes('vegan')],
      glutenFree: [d.includes('glutenFree')],
      lactoseFree: [d.includes('lactoseFree')],
      calorie: [u.preferences?.dailyCalorieGoal ?? 2000, [Validators.required, Validators.min(1200), Validators.max(3500)]],
      household: [u.preferences?.householdSize ?? 1, [Validators.required, Validators.min(1), Validators.max(8)]],
      theme: [u.preferences?.theme ?? 'light'],
      units: [u.preferences?.measurementSystem ?? 'metric'],
    });
  }

  async saveProfile(): Promise<void> {
    const v = this.form.value;
    const user = this.authService.currentUser();
    if (!user) {
      this.toast.error('Nincs bejelentkezett felhasználó.');
      await this.router.navigate(['/login']);
      return;
    }

    const uid = user.uid;

    const updated = {
      name: v.name ?? user.name,
      email: v.email ?? user.email,
      preferences: {
        diet: [ ...(v.vegetarian ? ['vegetarian'] : []), ...(v.vegan ? ['vegan'] : []), ...(v.glutenFree ? ['glutenFree'] : []), ...(v.lactoseFree ? ['lactoseFree'] : []) ],
        dailyCalorieGoal: Number(v.calorie),
        householdSize: Number(v.household),
        measurementSystem: (v.units ?? user.preferences.measurementSystem),
        theme: (v.theme ?? user.preferences.theme),
      },
      updatedAt: new Date().toISOString(),
    } as any;

    try {
      await setDoc(doc(db, 'users', uid), { ...user, ...updated, updatedAt: serverTimestamp() }, { merge: true });
      // Update local profile service so UI and theme reflect changes
      this.profileService.replaceProfile({ user: { name: updated.name, email: updated.email }, diets: updated.preferences.diet, calorie: updated.preferences.dailyCalorieGoal, household: updated.preferences.householdSize, theme: updated.preferences.theme, units: updated.preferences.measurementSystem });
      // keep AuthService in sync so other parts of app reflect changes immediately
      this.authService.updateAppUser({ name: updated.name, email: updated.email, preferences: updated.preferences as any });
      this.toast.success('Profil mentve');
    } catch (err) {
      const msg = (err as Error).message || 'Hiba a profil mentésekor';
      this.toast.error(msg);
    }
  }

  toggleTheme() {
    const current = this.profileService.theme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.profileService.setTheme(next);
    // keep form in sync
    this.form.patchValue({ theme: next });
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login'])).catch(() => {});
  }

  deleteAccount() {
    if (confirm('Biztosan törlöd a fiókodat? Ez visszafordíthatatlan.')) {
      this.authService.deleteAccount().then(() => this.router.navigate(['/login'])).catch(() => {});
    }
  }

  // helper for template to read toast signal
  get toastVisible() {
    return this.profileService.toastVisible();
  }
}
