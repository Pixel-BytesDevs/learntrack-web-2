import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // No adjuntar token al endpoint de obtención de tokens
  if (
    req.url.includes('/oauth2/token') ||
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};
