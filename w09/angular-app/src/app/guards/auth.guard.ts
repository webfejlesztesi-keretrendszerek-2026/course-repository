import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Functional guard that waits for auth initialization before deciding
export const authGuard: CanActivateFn = (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise((resolve) => {
    const check = () => {
      const loading = auth.loading();
      if (loading) {
        // still initializing - poll until ready
        setTimeout(check, 50);
        return;
      }

      if (auth.isLoggedIn()) {
        resolve(true);
      } else {
        resolve(router.createUrlTree(['/login']));
      }
    };

    check();
  });
};
