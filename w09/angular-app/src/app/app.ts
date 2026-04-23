import { Component, signal, ViewChild, ElementRef, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-app');

  @ViewChild('menuToggle') menuToggle!: ElementRef<HTMLInputElement>;

  protected authService = inject(AuthService);
  protected router = inject(Router);

  closeMenu() {
    if (this.menuToggle) {
      this.menuToggle.nativeElement.checked = false;
    }
  }

  async handleLogout() {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (_) {
      // logout handles errors via service toast
    }
  }
}
