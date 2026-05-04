import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form: FormGroup;
  submitting = false;
  loading!: import('@angular/core').Signal<boolean>;
  error!: import('@angular/core').Signal<string | null>;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loading = this.auth.loading;
    this.error = this.auth.error;

    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);

    if (hasNumber && hasUpper) return null;
    return { complexity: true };
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    if (pw === cpw) return null;
    return { passwordsMismatch: true };
  }

  passwordStrength(): { label: string; level: 'weak' | 'medium' | 'strong' } {
    const v = this.password?.value || '';
    const hasLower = /[a-z]/.test(v);
    const hasNumber = /[0-9]/.test(v);
    const hasUpper = /[A-Z]/.test(v);
    const lengthOk = v.length >= 8;

    if (hasLower && hasUpper && hasNumber && lengthOk) return { label: 'Erős', level: 'strong' };
    if ((hasLower && hasNumber) || (hasUpper && hasNumber)) return { label: 'Közepes', level: 'medium' };
    return { label: 'Gyenge', level: 'weak' };
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    const { name, email, password } = this.form.value;

    try {
      await this.auth.register(name, email, password);
      // AuthService already shows a toast on success
      await this.router.navigate(['/recipes']);
    } catch (err) {
      // AuthService sets error and toast. Nothing extra here.
    } finally {
      this.submitting = false;
    }
  }
}
