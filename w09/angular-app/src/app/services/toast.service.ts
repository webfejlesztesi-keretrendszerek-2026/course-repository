import { Injectable, signal, WritableSignal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  public toast: WritableSignal<ToastState | null> = signal(null);

  private showTimer?: ReturnType<typeof setTimeout>;
  private removeTimer?: ReturnType<typeof setTimeout>;

  private clearTimers() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    if (this.removeTimer) {
      clearTimeout(this.removeTimer);
      this.removeTimer = undefined;
    }
  }

  private scheduleHide() {
    this.clearTimers();
    // After 4s start exit animation, then remove after animation completes
    this.showTimer = setTimeout(() => {
      const current = this.toast();
      if (current) {
        this.toast.set({ ...current, visible: false });
        this.removeTimer = setTimeout(() => this.toast.set(null), 260);
      }
      this.showTimer = undefined;
    }, 4000);
  }

  private show(message: string, type: ToastType) {
    this.clearTimers();
    this.toast.set({ message, type, visible: true });
    this.scheduleHide();
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  close() {
    this.clearTimers();
    // Play exit animation then clear
    const current = this.toast();
    if (current) {
      this.toast.set({ ...current, visible: false });
      this.removeTimer = setTimeout(() => this.toast.set(null), 260);
    }
  }
}
