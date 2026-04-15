import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { inject } from '@angular/core';
import { TokenService } from '../core/services/token.service';
//auth

interface User {
  name: string;
  role: string;
  avatar?: string;
}

//app
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AppState = {
  user: null, // Cambia esto a un objeto para probar el estado logeado
  isAuthenticated: false,
  loading: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, tokenService = inject(TokenService)) => ({
    
    // Método para cargar la sesión desde el TokenService (al abrir la app)
    initializeAuth() {
      if (tokenService.isLoggedIn()) {
        patchState(store, {
          isAuthenticated: true,
          user: {
            name: tokenService.getDisplayName(),
            role: tokenService.getRoles()[0] || 'USER'
          }
        });
      }
    },

    // Actualizar tras login exitoso
    setAuth() {
      patchState(store, {
        isAuthenticated: true,
        user: {
          name: tokenService.getDisplayName(),
          role: tokenService.getRoles()[0] || 'USER'
        }
      });
    },

    logout() {
      tokenService.clearTokens(); // Limpiamos localStorage
      patchState(store, { isAuthenticated: false, user: null });
      window.location.href = '/'; // Redirección dura para limpiar todo
    }
  }))
);
