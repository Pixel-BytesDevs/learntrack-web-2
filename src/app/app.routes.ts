import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import {
  aulaGuard,
  authGuard,
  initialTestGuard,
  publicGuard,
  roleGuard,
} from './core/guards/auth.guards';
import { DashboardLayoutComponent } from './shared/layouts/dashboard-layout/dashboard-layout.component';
import { ProgresoLayoutComponent } from './features/alumno/progreso/progreso-layout.component';

export const routes: Routes = [
  // RUTAS PÚBLICAS (Home)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },

  // RUTAS DE AUTENTICACIÓN
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/layouts/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
    ],
  },

  // RUTA DEL TEST (Corregida para manejar la secuencia del diagnóstico)
  {
    path: 'alumno/test-inicial',
    canActivate: [authGuard, roleGuard, initialTestGuard],
    data: { roles: ['ROLE_USER'] },
    // Este componente ahora debe tener un <router-outlet>
    loadComponent: () =>
      import('./features/alumno/test-inicial/test-layout/test-layout.component').then(
        (m) => m.TestLayoutComponent,
      ),
    children: [
      {
        path: '', // La vista inicial del diagnóstico
        loadComponent: () =>
          import('./features/alumno/test-inicial/vista-inicial/vista-inicial.component').then(
            (m) => m.VistaInicialComponent,
          ),
      },
      {
        path: 'vark',
        loadComponent: () =>
          import('./features/alumno/test-inicial/test-vark/test-vark.component').then(
            (m) => m.TestVarkComponent,
          ),
      },
      {
        path: 'nivel',
        loadComponent: () =>
          import('./features/alumno/test-inicial/test-nivel/test-nivel.component').then(
            (m) => m.TestNivelComponent,
          ),
      },
      {
        path: 'results',
        loadComponent: () =>
          import('./features/alumno/test-inicial/resultados/resultados.component').then(
            (m) => m.ResultadosComponent,
          ),
      },
    ],
  },

  // RUTAS PRIVADAS CON SIDEBAR (Dashboard Layout)
  {
    path: '',
    component: DashboardLayoutComponent, // Este es el nuevo Layout
    canActivate: [authGuard],
    children: [
      // Alumno
      {
        path: 'alumno/dashboard',
        canActivate: [roleGuard, aulaGuard],
        data: { roles: ['ROLE_USER'] },
        loadComponent: () =>
          import('./features/alumno/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'alumno/progreso',
        canActivate: [roleGuard, aulaGuard],
        data: { roles: ['ROLE_USER'] },
        component: ProgresoLayoutComponent,
        children: [
          {
            path: 'general',
            loadComponent: () =>
              import('./features/alumno/progreso/vista-general/vista-general.component').then(
                (m) => m.VistaGeneralComponent,
              ),
          },
          {
            path: 'grafo',
            loadComponent: () =>
              import('./features/alumno/progreso/vista-grafo/vista-grafo.component').then(
                (m) => m.VistaGrafoComponent,
              ),
          },
          { path: '', redirectTo: 'general', pathMatch: 'full' },
        ],
      },
      {
        path: 'alumno/recomendaciones',
        canActivate: [roleGuard, aulaGuard],
        data: { roles: ['ROLE_USER'] },
        loadComponent: () =>
          import('./features/alumno/recomendaciones/recomendaciones-layout.component').then(
            (m) => m.RecomendacionesLayoutComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/alumno/recomendaciones/oa-recomendada/oa-recomendada.component').then(
                (m) => m.OaRecomendadaComponent,
              ),
          },
          {
            path: 'visor-oa',
            loadComponent: () =>
              import('./features/alumno/recomendaciones/visor-oa/visor-oa.component').then(
                (m) => m.VisorOaComponent
              )

          }
        ],
      },
      // Profesor (Placeholder para futuro)
      // {
      //   path: 'profesor/dashboard',
      //   canActivate: [roleGuard],
      //   data: { roles: ['ROLE_PROFESOR'] },
      //   loadComponent: () => import('./features/profesor/dashboard/dashboard.component').then(m => m.DashboardComponent),
      // },
      // Perfil Común
      // {
      //   path: 'perfil',
      //   loadComponent: () => import('./features/shared/perfil/perfil.component').then(m => m.PerfilComponent),
      // }
    ],
  },

  { path: '**', redirectTo: '' },
];
