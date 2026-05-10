import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { HeaderComponent } from '../../components/header/header.component';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    HeaderComponent,
  ],
  template: `
    <nz-layout class="h-screen overflow-hidden flex flex-col">
      
      <app-header class="flex-none"></app-header>

      <nz-layout class="flex-1 flex flex-row overflow-hidden">
        
        <nz-sider
          nzCollapsible
          [(nzCollapsed)]="isCollapsed"
          [nzWidth]="280"
          [nzTrigger]="null"
          class="bg-white border-r border-slate-100 shadow-sm pt-4 hidden md:block overflow-y-auto overflow-x-hidden relative"
        >
          <ul nz-menu nzMode="inline" class="border-none pb-24">
            @if (store.user()?.role === 'ROLE_ADMIN') {
              <li nz-menu-group nzTitle="Administración">
                <ul>
                  <li
                    nz-menu-item
                    routerLink="/admin/dashboard"
                    routerLinkActive="ant-menu-item-selected"
                  >
                    <span nz-icon nzType="user-add"></span>
                    <span>Crear usuarios</span>
                  </li>
                </ul>
              </li>
            }

            @if (store.user()?.role === 'ROLE_USER') {
              <li nz-menu-group nzTitle="Panel del Estudiante">
                <ul>
                  <li nz-menu-item routerLink="/alumno/dashboard" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="appstore"></span>
                    <span>Vista Principal</span>
                  </li>
                  <li nz-menu-item routerLink="/alumno/recomendaciones" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="star" nzTheme="outline"></span>
                    <span>Mis Recomendaciones</span>
                  </li>
                  <li nz-menu-item routerLink="/alumno/progreso" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="rise"></span>
                    <span>Mi Progreso</span>
                  </li>
                </ul>
              </li>
            }

            @if (store.user()?.role === 'ROLE_PROFESOR') {
              <li nz-menu-group nzTitle="Gestión Docente">
                <ul>
                  <li nz-menu-item routerLink="/profesor/grafo" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="deployment-unit"></span>
                    <span>Grafo de Competencias</span>
                  </li>
                  <li nz-menu-item routerLink="/profesor/progreso-estudiantes" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="team"></span>
                    <span>Progreso de Estudiantes</span>
                  </li>
                  <li nz-menu-item routerLink="/profesor/materiales" routerLinkActive="ant-menu-item-selected">
                    <span nz-icon nzType="cloud-upload"></span>
                    <span>Subir Materiales</span>
                  </li>
                </ul>
              </li>
            }

            <li nz-menu-divider class="my-4"></li>

            <li nz-menu-group nzTitle="Cuenta">
              <ul>
                <li nz-menu-item routerLink="/perfil" routerLinkActive="ant-menu-item-selected">
                  <span nz-icon nzType="user"></span>
                  <span>Mi Perfil</span>
                </li>
                <li nz-menu-item routerLink="/configuracion" routerLinkActive="ant-menu-item-selected">
                  <span nz-icon nzType="setting"></span>
                  <span>Ajustes</span>
                </li>
              </ul>
            </li>
          </ul>

          <div class="absolute bottom-0 left-0 w-full px-4 py-6 bg-white/80 backdrop-blur-sm border-t border-slate-50">
            <button
              nz-button
              nzType="text"
              (click)="isCollapsed = !isCollapsed"
              class="w-full flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl h-11 transition-all"
            >
              <span nz-icon [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'" class="text-lg"></span>
              @if (!isCollapsed) {
                <span class="ml-2 font-bold text-xs uppercase tracking-widest">Colapsar</span>
              }
            </button>
          </div>
        </nz-sider>

        <nz-content class="flex-1 bg-slate-50/50 overflow-y-auto overflow-x-hidden">
          <div class="max-w-[1400px] mx-auto px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-10 lg:px-10">
            <router-outlet></router-outlet>
          </div>
        </nz-content>

      </nz-layout>
    </nz-layout>
  `,
  styles: [
    `
      :host ::ng-deep {
        .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ant-menu-inline, .ant-menu-vertical {
          border-right: none;
        }
        .ant-menu-item-selected {
          @apply bg-blue-50 text-blue-600 font-bold rounded-r-full relative !important;
          &::after {
            content: '';
            @apply absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r-full;
            border: none;
          }
        }
        .ant-menu-item-group-title {
          @apply text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pt-6;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  readonly store = inject(AppStore);
  isCollapsed = false;
}