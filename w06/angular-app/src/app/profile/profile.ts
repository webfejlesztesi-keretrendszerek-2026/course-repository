import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  user = {
    name: 'Minta Felhasználó',
    email: 'minta@email.hu',
    password: '',
  };

  diets: any = {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
  };

  calorie = 2000;
  household = 4;
  theme: 'light' | 'dark' | 'system' = 'light';
  units: 'metric' | 'imperial' = 'metric';

  toastVisible = false;

  saveProfile() {
    // Demo save: show confirmation toast
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2000);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme === 'dark' ? 'dark' : 'light');
  }

  logout() {
    // placeholder
    alert('Kijelentkezés (demo)');
  }

  deleteAccount() {
    if (confirm('Biztosan törlöd a fiókodat? Ez visszafordíthatatlan.')) {
      alert('Fiók törölve (demo)');
    }
  }
}
