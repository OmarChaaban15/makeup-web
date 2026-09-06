import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

// Protege rutas que requieren sesion iniciada. Si no hay token, redirige a
// /login guardando la ruta de destino para volver despues de entrar.
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: estado.url }
  });
};
