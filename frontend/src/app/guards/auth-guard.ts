import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Protege rutas que requieren sesion iniciada. Si no hay token, redirige a /login.
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem('auth_token')) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
