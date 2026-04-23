import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Functional guard for guest routes: redirect logged-in users to /recipes
export const guestGuard: CanActivateFn = (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise((resolve) => {
    const check = () => {
      const loading = auth.loading();
      if (loading) {
        setTimeout(check, 50);
        return;
      }

      if (auth.isLoggedIn()) {
        resolve(router.createUrlTree(['/recipes']));
      } else {
        resolve(true);
      }
    };

    check();
  });
};
