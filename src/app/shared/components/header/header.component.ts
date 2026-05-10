import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzDropDownModule,
    NzIconModule,
    NzAvatarModule,
    NzBadgeModule,
  ],
  template: `
    <header
      class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[1000] transition-all duration-300"
    >
      <div
        class="container mx-auto px-4 sm:px-6 h-[4.5rem] sm:h-20 flex items-center justify-between gap-2 min-w-0"
      >
        <div
          class="flex items-center gap-2.5 cursor-pointer group"
          routerLink="/"
        >
          <div
            class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform"
          >
            <img
              src="learntrack-logo-medium.png"
              alt="L"
              class="h-7 w-auto brightness-200"
            />
          </div>
          <span class="text-xl sm:text-2xl font-black tracking-tighter text-slate-800 truncate">
            Learn<span class="text-blue-600">Track</span>
          </span>
        </div>

        <nav class="hidden md:flex items-center gap-8">
          <div class="flex items-center gap-6">
            <a
              routerLink="/"
              routerLinkActive="text-blue-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-500 hover:text-blue-600 font-semibold transition-colors relative group"
            >
              Inicio
              <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"
              ></span>
            </a>

            @if (store.isAuthenticated()) {
              <a
                [routerLink]="dashboardLink"
                class="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 transition-all hover:gap-3"
              >
                <span nz-icon nzType="appstore" nzTheme="outline"></span>
                Mi Panel
              </a>
            }

            <a
              href="#"
              class="text-slate-500 hover:text-blue-600 font-semibold transition-colors"
              >Explorar</a
            >
            <a
              href="#"
              class="text-slate-500 hover:text-blue-600 font-semibold transition-colors"
              >Metodología</a
            >
          </div>

          <div class="h-8 w-[1px] bg-slate-200"></div>

          @if (!store.isAuthenticated()) {
            <div class="flex items-center gap-3">
              <button
                nz-button
                nzType="primary"
                routerLink="/login"
                class="bg-blue-600 hover:bg-blue-700 border-none font-bold rounded-xl px-6 h-11 shadow-md shadow-blue-100"
              >
                Iniciar sesión
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-5">
              <nz-badge
                [nzDot]="true"
                class="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
              >
                <span nz-icon nzType="bell" class="text-xl"></span>
              </nz-badge>

              <div
                class="flex items-center gap-3 pl-2 border-l border-slate-100 cursor-pointer group"
                nz-dropdown
                [nzDropdownMenu]="userMenu"
                nzPlacement="bottomRight"
                nzTrigger="click"
              >
                <div class="text-right hidden lg:block">
                  <p
                    class="text-sm font-bold text-slate-800 leading-none group-hover:text-blue-600 transition-colors"
                  >
                    {{ store.user()?.name }}
                  </p>
                  <p
                    class="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1"
                  >
                    {{ store.user()?.role }}
                  </p>
                </div>
                <div class="relative">
                  <nz-avatar
                    [nzSize]="44"
                    [nzIcon]="'user'"
                    [nzSrc]="store.user()?.avatar || ''"
                    class="shadow-inner border-2 border-white ring-2 ring-slate-50"
                  ></nz-avatar>
                  <div
                    class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          }
        </nav>

        <div class="md:hidden flex items-center gap-3">
          @if (store.isAuthenticated()) {
            <nz-avatar
              nzSize="default"
              [nzIcon]="'user'"
              class="border border-slate-200"
            ></nz-avatar>
          }
          <button
            nz-dropdown
            [nzDropdownMenu]="mobileMenu"
            nzTrigger="click"
            nz-button
            nzType="text"
            class="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50"
          >
            <span
              nz-icon
              nzType="menu-unfold"
              class="text-2xl text-slate-700"
            ></span>
          </button>
        </div>
      </div>
    </header>

    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div
        class="bg-white rounded-2xl shadow-2xl border border-slate-100 mt-2 p-2 min-w-[220px]"
      >
        <ul nz-menu class="border-none shadow-none">
          <li nz-menu-item [routerLink]="dashboardLink" class="rounded-xl py-3">
            <span
              nz-icon
              nzType="appstore"
              nzTheme="outline"
              class="mr-3 text-lg text-blue-500"
            ></span>
            <span class="font-semibold text-slate-700">Mi Panel Educativo</span>
          </li>
          <li nz-menu-item routerLink="/perfil" class="rounded-xl py-3">
            <span
              nz-icon
              nzType="user"
              nzTheme="outline"
              class="mr-3 text-lg text-slate-400"
            ></span>
            <span class="font-semibold text-slate-700">Mi Perfil</span>
          </li>
          <li nz-menu-divider class="my-2"></li>
          <li
            nz-menu-item
            (click)="store.logout()"
            class="rounded-xl py-3 group"
          >
            <span
              nz-icon
              nzType="logout"
              nzTheme="outline"
              class="mr-3 text-lg text-red-400 group-hover:text-red-500"
            ></span>
            <span class="font-bold text-red-500">Cerrar Sesión</span>
          </li>
        </ul>
      </div>
    </nz-dropdown-menu>

    <nz-dropdown-menu #mobileMenu="nzDropdownMenu">
      <ul nz-menu class="min-w-[220px] max-w-[min(100vw-2rem,320px)] rounded-xl p-2">
        <li nz-menu-item routerLink="/" class="font-bold">Inicio</li>

        @if (store.isAuthenticated() && store.user()?.role !== 'ROLE_USER') {
          <li
            nz-menu-item
            [routerLink]="dashboardLink"
            class="text-blue-600 font-bold"
          >
            <span nz-icon nzType="appstore" class="mr-2"></span> Mi Panel
          </li>
        }

        @if (store.isAuthenticated() && store.user()?.role === 'ROLE_USER') {
          <li nz-menu-divider></li>
          <li
            nz-menu-item
            routerLink="/alumno/dashboard"
            class="font-semibold text-blue-600"
          >
            <span nz-icon nzType="appstore" class="mr-2"></span>
            Vista Principal
          </li>
          <li
            nz-menu-item
            routerLink="/alumno/recomendaciones"
            class="font-semibold"
          >
            <span nz-icon nzType="star" class="mr-2 text-slate-500"></span>
            Mis Recomendaciones
          </li>
          <li
            nz-menu-item
            routerLink="/alumno/progreso"
            class="font-semibold"
          >
            <span nz-icon nzType="rise" class="mr-2 text-slate-500"></span>
            Mi Progreso
          </li>
        }

        <li nz-menu-divider></li>
        @if (!store.isAuthenticated()) {
          <li nz-menu-item routerLink="/login" class="text-blue-600 font-bold">
            Iniciar sesión
          </li>
        } @else {
          <li nz-menu-item routerLink="/perfil">Mi Perfil</li>
          <li nz-menu-item routerLink="/configuracion">Ajustes</li>
          <li
            nz-menu-item
            (click)="store.logout()"
            class="text-red-500 font-bold"
          >
            Cerrar Sesión
          </li>
        }
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [
    `
      :host ::ng-deep {
        .ant-dropdown-menu {
          padding: 0 !important;
          background: transparent !important;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  readonly store = inject(AppStore);

  /**
   * Determina dinámicamente el enlace al panel principal según el rol.
   * Si el usuario aún no realiza su test, el Guard se encargará de redirigir
   * desde /alumno/dashboard hacia /alumno/test-inicial.
   */
  get dashboardLink(): string {
    const role = this.store.user()?.role;
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_PROFESOR') return '/profesor/dashboard';
    if (role === 'ROLE_USER') return '/alumno/dashboard';
    return '/';
  }
}
