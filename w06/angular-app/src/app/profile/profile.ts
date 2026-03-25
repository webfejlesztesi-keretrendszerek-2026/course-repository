import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit() {
    // initialize form from service signals
    const u = this.profileService.user();
    const d = this.profileService.diets();
    this.form = this.fb.group({
      name: [u.name, Validators.required],
      email: [u.email, [Validators.required, Validators.email]],
      password: [''],
      vegetarian: [d.vegetarian],
      vegan: [d.vegan],
      glutenFree: [d.glutenFree],
      lactoseFree: [d.lactoseFree],
      calorie: [this.profileService.calorie(), [Validators.required, Validators.min(1200), Validators.max(3500)]],
      household: [this.profileService.household(), [Validators.required, Validators.min(1), Validators.max(8)]],
      theme: [this.profileService.theme()],
      units: [this.profileService.units()],
    });
  }

  saveProfile() {
    const v = this.form.value;
    // Coerce possible nulls from form into proper types expected by the service
    const userName: string = v.name ?? '';
    const userEmail: string = v.email ?? '';
    const userPassword: string | undefined = v.password ?? undefined;
    const theme = (v.theme ?? undefined) as 'light' | 'dark' | 'system' | undefined;
    const units = (v.units ?? undefined) as 'metric' | 'imperial' | undefined;

    this.profileService.replaceProfile({
      user: { name: userName, email: userEmail, password: userPassword },
      diets: {
        vegetarian: !!v.vegetarian,
        vegan: !!v.vegan,
        glutenFree: !!v.glutenFree,
        lactoseFree: !!v.lactoseFree,
      },
      calorie: Number(v.calorie),
      household: Number(v.household),
      theme,
      units,
    });

    this.profileService.saveProfile();
  }

  toggleTheme() {
    const current = this.profileService.theme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.profileService.setTheme(next);
    // keep form in sync
    this.form.patchValue({ theme: next });
  }

  logout() {
    alert('Kijelentkezés (demo)');
  }

  deleteAccount() {
    if (confirm('Biztosan törlöd a fiókodat? Ez visszafordíthatatlan.')) {
      alert('Fiók törölve (demo)');
    }
  }

  // helper for template to read toast signal
  get toastVisible() {
    return this.profileService.toastVisible();
  }
}
