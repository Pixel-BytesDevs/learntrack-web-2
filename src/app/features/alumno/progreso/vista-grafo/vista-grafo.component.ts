import {
  Component,
  OnInit,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop'; // Importante para convertir el observable
import cytoscape from 'cytoscape';

import { TokenService } from '../../../../core/services/token.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { TemaNodo } from '../../../../core/models/grafo.models';
import { GrafoEstudianteService } from '../../../../core/services/grafo/grafo-estudiante.service';

@Component({
  selector: 'app-vista-grafo',
  standalone: true,
  imports: [CommonModule, NzSpinModule, NzCardModule],
  template: `
    <div
      class="relative w-full min-h-[280px] h-[52vh] max-h-[720px] sm:h-[58vh] md:h-[600px] md:max-h-none bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner touch-pan-x touch-pan-y"
    >
      @if (loading()) {
        <div
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm"
        >
          <nz-spin nzSimple nzSize="large"></nz-spin>
        </div>
      }

      <div
        class="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-auto z-10 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 max-w-[calc(100%-1.5rem)] sm:max-w-none"
      >
        <p
          class="font-bold text-slate-400 uppercase tracking-widest mb-2 text-[10px]"
        >
          Estado de Competencias
        </p>
        <div class="flex items-center gap-2">
          <span
            class="w-10 h-3 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981]"
          ></span>
          Dominio 0–100 (color continuo)
        </div>
        <div class="flex items-center gap-2 text-slate-500">
          <span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Bajo (cerca de
          0)
        </div>
        <div class="flex items-center gap-2 text-slate-500">
          <span class="w-3 h-3 rounded-full bg-[#eab308]"></span> Intermedio
        </div>
        <div class="flex items-center gap-2 text-slate-500">
          <span class="w-3 h-3 rounded-full bg-[#10b981]"></span> Alto (cerca de
          100)
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-slate-300"></span> Bloqueado /
          Inactivo
        </div>
      </div>

      <div #cy class="w-full h-full cursor-grab active:cursor-grabbing"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class VistaGrafoComponent implements OnInit, AfterViewInit {
  @ViewChild('cy') cyElement!: ElementRef;

  private grafoService = inject(GrafoEstudianteService);
  private tokenService = inject(TokenService);

  // Transformamos el observable del servicio en un Signal para que el HTML no de error
  loading = toSignal(this.grafoService.loading$, { initialValue: false });

  private cy?: cytoscape.Core;

  ngOnInit() {}

  ngAfterViewInit() {
    const userId = Number(this.tokenService.getUsername()) || 1;

    this.grafoService.getGrafoEstudiante(userId).subscribe((nodos) => {
      if (nodos) {
        // Esperamos un frame del navegador para asegurar que el div #cy tenga tamaño
        requestAnimationFrame(() => {
          this.initCytoscape(nodos);
        });
      }
    });
  }

  private initCytoscape(nodos: TemaNodo[]) {
    if (!nodos || nodos.length === 0) return;

    // 1. Tipado estricto para evitar el error TS(2322)
    const nodesList: cytoscape.NodeDefinition[] = [];
    const edgesList: cytoscape.EdgeDefinition[] = [];
    const processedNodes = new Set<string>();

    // 2. Procesar Nodos
    nodos.forEach((n) => {
      const idStr = n.id.toString();
      if (processedNodes.has(idStr)) return;

      const dominioRaw = Number(n.dominio);
      const dominioPct = Math.min(
        100,
        Math.max(0, Number.isFinite(dominioRaw) ? dominioRaw : 0),
      );
      const status = !n.isActive ? 'blocked' : 'active';

      nodesList.push({
        group: 'nodes', // Esto le indica a TS que es un NodeDefinition
        data: {
          id: idStr,
          label: n.label,
          status,
          dominio: dominioPct,
        },
      });
      processedNodes.add(idStr);
    });

    // 3. Procesar Conexiones (Edges)
    nodos.forEach((n) => {
      n.conexiones?.forEach((connId) => {
        const source = n.id.toString();
        const target = connId.toString();

        if (processedNodes.has(source) && processedNodes.has(target)) {
          edgesList.push({
            group: 'edges', // Esto le indica a TS que es un EdgeDefinition
            data: {
              id: `e-${source}-${target}`,
              source: source,
              target: target,
            },
          });
        }
      });
    });

    // 4. Inicialización
    this.cy = cytoscape({
      container: this.cyElement.nativeElement,
      // Pasamos los elementos como un objeto con tipos ya definidos
      elements: {
        nodes: nodesList,
        edges: edgesList,
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            color: '#fff',
            'font-size': '11px',
            'font-weight': 'bold',
            width: '90px',
            height: '90px',
            'background-color': '#64748b',
            'text-wrap': 'wrap',
            'text-max-width': '70px',
            'border-width': 5,
            'border-color': '#f1f5f9',
          },
        },
        {
          selector: 'node[status="active"]',
          style: {
            // dominio 0–100: mapData solo interpola entre dos colores (RGB)
            'background-color':
              'mapData(dominio, 0, 100, #f59e0b, #10b981)',
            'border-color': 'mapData(dominio, 0, 100, #fef3c7, #d1fae5)',
          },
        },
        {
          selector: 'node[status="blocked"]',
          style: {
            'background-color': '#e2e8f0',
            color: '#94a3b8',
            'border-color': '#f1f5f9',
            opacity: 0.8,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#e2e8f0',
            'target-arrow-color': '#e2e8f0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-style': 'solid',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.5,
        animate: false,
        fit: true,
      },
      minZoom: 0.2,
      maxZoom: 2,
      wheelSensitivity: 0.6,
    });

    // Asegurar que el layout se ejecute cuando el contenedor esté listo
    this.cy.ready(() => {
      this.cy
        ?.layout({ name: 'breadthfirst', directed: true, spacingFactor: 1.3 })
        .run();
      this.cy?.center();
    });
  }
}
