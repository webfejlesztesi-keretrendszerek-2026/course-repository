import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form: FormGroup;
  loading!: Signal<boolean>;
  error!: Signal<string | null>;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    // initialize signals AFTER auth is injected
    this.loading = this.auth.loading;
    this.error = this.auth.error;

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    try {
      await this.auth.login(email, password);
      await this.router.navigate(['/recipes']);
    } catch (err) {
      // AuthService sets error signal and shows toast; nothing extra here
    }
  }
}
