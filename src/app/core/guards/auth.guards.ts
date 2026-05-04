import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';

// Protege rutas que requieren sesión
export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

// Evita que usuarios autenticados vuelvan a la pantalla de login
export const publicGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) return true;

  const roles = tokenService.getRoles();
  if (roles.includes('ROLE_ADMIN')) {
    router.navigate(['/admin/dashboard']);
  } else if (roles.includes('ROLE_PROFESOR')) {
    router.navigate(['/profesor/dashboard']);
  } else if (roles.includes('ROLE_USER')) {
    router.navigate(
      tokenService.isFirstLogin() ? ['/alumno/test-inicial'] : ['/alumno/dashboard'],
    );
  } else {
    router.navigate(['/']);
  }
  return false;
};

export const roleGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRoles = tokenService.getRoles();

  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
  if (hasAccess) return true;

  // Redirección inteligente por rol
  if (userRoles.includes('ROLE_ADMIN')) {
    router.navigate(['/admin/dashboard']);
  } else if (userRoles.includes('ROLE_PROFESOR')) {
    router.navigate(['/profesor/dashboard']);
  } else if (userRoles.includes('ROLE_USER')) {
    router.navigate(['/alumno/dashboard']);
  } else {
    router.navigate(['/']);
  }

  return false;
};

// Solo permite entrar al Test si el usuario es nuevo
export const initialTestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Si ya NO es su primer login (ya hizo el test), lo mandamos al aula
  if (!tokenService.isFirstLogin()) {
    return true;
  }
  router.navigate(['/alumno/dashboard']);
  return false;
};

// Solo permite entrar al Aula/Dashboard si ya hizo el test
export const aulaGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Si es su primer login (no ha hecho el test), lo obligamos a ir al test
  if (tokenService.isFirstLogin()) {
    return true;
  }
  router.navigate(['/alumno/test-inicial']);
  return false;
};
