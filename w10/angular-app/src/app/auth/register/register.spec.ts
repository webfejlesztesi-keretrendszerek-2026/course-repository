import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

import { Register } from './register';
import { AuthService } from '../../services/auth.service';

describe('Register validators', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loading: signal(false),
            error: signal(null),
            register: vi.fn().mockResolvedValue(undefined),
          },
        },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    await fixture.whenStable();
  });

  // passwordComplexityValidator
  it('passwordComplexityValidator: empty value -> null', () => {
    // Arrange
    const control: any = { value: '' };
    // Act
    const res = component.passwordComplexityValidator(control);
    // Assert
    expect(res).toBeNull();
  });

  it('passwordComplexityValidator: only lowercase+numbers -> { complexity: true }', () => {
    // Arrange
    const control: any = { value: 'abc12345' };
    // Act
    const res = component.passwordComplexityValidator(control);
    // Assert
    expect(res).toEqual({ complexity: true });
  });

  it('passwordComplexityValidator: only letters, no number -> { complexity: true }', () => {
    // Arrange
    const control: any = { value: 'abcdefgH' };
    // Act
    const res = component.passwordComplexityValidator(control);
    // Assert
    expect(res).toEqual({ complexity: true });
  });

  it('passwordComplexityValidator: upper+number -> null', () => {
    // Arrange
    const control: any = { value: 'Abc12345' };
    // Act
    const res = component.passwordComplexityValidator(control);
    // Assert
    expect(res).toBeNull();
  });

  // passwordsMatchValidator
  it('passwordsMatchValidator: matching passwords -> null', () => {
    // Arrange
    const group = fb.group({ password: ['x'], confirmPassword: ['x'] });
    // Act
    const res = component.passwordsMatchValidator(group as any);
    // Assert
    expect(res).toBeNull();
  });

  it('passwordsMatchValidator: non-matching passwords -> { passwordsMismatch: true }', () => {
    // Arrange
    const group = fb.group({ password: ['x1'], confirmPassword: ['x2'] });
    // Act
    const res = component.passwordsMatchValidator(group as any);
    // Assert
    expect(res).toEqual({ passwordsMismatch: true });
  });

  // passwordStrength (use the component form and patchValue)
  it("passwordStrength: empty password -> level 'weak'", () => {
    // Arrange
    component.form.patchValue({ password: '' });
    // Act
    const r = component.passwordStrength();
    // Assert
    expect(r).toEqual({ label: 'Gyenge', level: 'weak' });
  });

  it("passwordStrength: medium (lower+number) -> level 'medium'", () => {
    // Arrange
    component.form.patchValue({ password: 'abc12345' });
    // Act
    const r = component.passwordStrength();
    // Assert
    expect(r).toEqual({ label: 'Közepes', level: 'medium' });
  });

  it("passwordStrength: strong (lower+upper+number+min8) -> level 'strong'", () => {
    // Arrange
    component.form.patchValue({ password: 'Abcdef12' });
    // Act
    const r = component.passwordStrength();
    // Assert
    expect(r).toEqual({ label: 'Erős', level: 'strong' });
  });
});
