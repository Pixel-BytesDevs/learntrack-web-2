import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { filter } from 'rxjs';

@Component({
  selector: 'app-progreso-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NzTabsModule,
    NzIconModule,
  ],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Análisis de Progreso
        </h1>
        <p class="text-sm sm:text-base text-slate-500 font-medium italic">
          Monitorea tu evolución y descubre tus próximas metas.
        </p>
      </div>

      <nz-tabset
        [nzSelectedIndex]="currentTabIndex"
        (nzSelectedIndexChange)="handleTabChange($event)"
        nzType="card"
        class="custom-nav-tabs alumno-tabs-responsive"
      >
        <nz-tab [nzTitle]="titleGeneral"></nz-tab>
        <nz-tab [nzTitle]="titleGrafo"></nz-tab>
      </nz-tabset>

      <ng-template #titleGeneral>
        <div class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 whitespace-nowrap">
          <span nz-icon nzType="dashboard"></span>
          <span class="font-bold text-sm sm:text-base">Vista General</span>
        </div>
      </ng-template>

      <ng-template #titleGrafo>
        <div class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 whitespace-nowrap">
          <span nz-icon nzType="deployment-unit"></span>
          <span class="font-bold text-sm sm:text-base">Mapa</span>
          <span class="font-bold text-sm sm:text-base hidden sm:inline">de Competencias</span>
        </div>
      </ng-template>

      <div class="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-[2.5rem] border border-slate-100 p-4 sm:p-6 min-h-[min(600px,70vh)] sm:min-h-[600px] shadow-xl shadow-blue-900/5 mt-2 sm:mt-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .ant-tabs-nav {
        margin-bottom: 0 !important;
        border-bottom: none !important;
      }
      .ant-tabs-nav-list {
        @apply gap-3 !important;
      }
      .ant-tabs-tab {
        @apply rounded-2xl border-none bg-slate-100 transition-all !important;
        padding: 10px 0 !important;
        
        &:hover {
          @apply bg-slate-200;
        }
      }
      .ant-tabs-tab-active {
        @apply bg-blue-600 shadow-lg shadow-blue-200 !important;
        .ant-tabs-tab-btn {
          @apply text-white !important;
        }
      }
      .ant-tabs-ink-bar { display: none !important; }

      .alumno-tabs-responsive .ant-tabs-nav {
        margin: 0 !important;
      }
      .alumno-tabs-responsive .ant-tabs-nav-wrap {
        overflow-x: auto !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch;
      }
      .alumno-tabs-responsive .ant-tabs-nav-list {
        flex-wrap: nowrap !important;
        min-width: min-content;
      }
    }
  `]
})
export class ProgresoLayoutComponent implements OnInit {
  private router = inject(Router);
  currentTabIndex = 0;

  ngOnInit() {
    this.syncTabWithRoute();
    
    // Escuchar cambios de ruta para actualizar la pestaña si el usuario navega
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncTabWithRoute();
    });
  }

  private syncTabWithRoute() {
    const url = this.router.url;
    if (url.includes('grafo')) {
      this.currentTabIndex = 1;
    } else {
      this.currentTabIndex = 0;
    }
  }

  handleTabChange(index: number) {
    this.currentTabIndex = index;
    if (index === 0) {
      this.router.navigate(['/alumno/progreso/general']);
    } else {
      this.router.navigate(['/alumno/progreso/grafo']);
    }
  }
}