import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-app');

  @ViewChild('menuToggle') menuToggle!: ElementRef<HTMLInputElement>;

  closeMenu() {
    if (this.menuToggle) {
      this.menuToggle.nativeElement.checked = false;
    }
  }
}
