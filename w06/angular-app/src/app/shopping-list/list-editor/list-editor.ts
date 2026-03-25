import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ALL_UNITS, PURCHASABLE_UNITS } from '../../models/units';

@Component({
  selector: 'app-list-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-editor.html',
  styleUrl: './list-editor.scss',
})
export class ListEditor {
  units = PURCHASABLE_UNITS;

  @Output() add = new EventEmitter<{ name: string; amount: number; unit?: string }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, this.positiveNumberValidator()]],
      unit: ['', Validators.required],
    });
  }

  private positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const v = control.value;
      if (v === null || v === undefined || v === '') return null; // required handles emptiness
      const num = Number(v);
      if (Number.isNaN(num)) return { notNumber: true };
      if (num <= 0) return { nonPositive: true };
      return null;
    };
  }

  emitAdd() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const amountNum = Number(value.amount);
    this.add.emit({ name: value.name.trim(), amount: amountNum, unit: value.unit });
    this.form.reset();
  }
}
