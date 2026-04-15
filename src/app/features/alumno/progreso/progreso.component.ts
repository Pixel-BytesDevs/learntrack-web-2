import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { VistaGrafoComponent } from './vista-grafo/vista-grafo.component';


@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, NzTabsModule, NzIconModule, VistaGrafoComponent],
  template: `
    <div class="animate-fade-in space-y-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Mi Progreso Educativo</h1>
        <p class="text-slate-500 font-medium">Visualiza tus logros y el camino que te queda por recorrer.</p>
      </div>

      <nz-tabset nzType="card" class="custom-tabs">
        <nz-tab [nzTitle]="titleGeneral">
          <ng-template #titleGeneral>
            <span nz-icon nzType="dashboard"></span> Vista General
          </ng-template>
          <div class="bg-white p-20 rounded-[2rem] border border-dashed border-slate-200 text-center">
             <p class="text-slate-400 italic">Estadísticas generales en construcción...</p>
          </div>
        </nz-tab>

        <nz-tab [nzTitle]="titleGrafo">
          <ng-template #titleGrafo>
            <span nz-icon nzType="deployment-unit"></span> Mapa de Competencias
          </ng-template>
          <app-vista-grafo></app-vista-grafo>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .custom-tabs .ant-tabs-nav-list { @apply gap-2; }
      .custom-tabs .ant-tabs-tab { @apply rounded-xl border-none bg-slate-100 font-bold transition-all; }
      .custom-tabs .ant-tabs-tab-active { @apply bg-blue-600 !important; .ant-tabs-tab-btn { @apply text-white !important; } }
    }
  `]
})
export class ProgresoComponent {}