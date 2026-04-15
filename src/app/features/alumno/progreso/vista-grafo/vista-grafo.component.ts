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
      class="relative w-full h-[600px] bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner"
    >
      @if (loading()) {
        <div
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm"
        >
          <nz-spin nzSimple nzSize="large"></nz-spin>
        </div>
      }

      <div
        class="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2"
      >
        <p
          class="font-bold text-slate-400 uppercase tracking-widest mb-2 text-[10px]"
        >
          Estado de Competencias
        </p>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-[#10b981]"></span> Excelente
          (Dominio 3)
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Bueno (Dominio
          2)
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Bajo (Dominio
          1)
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

      const status = !n.isActive
        ? 'blocked'
        : n.dominio === 1
          ? 'low'
          : n.dominio === 2
            ? 'good'
            : n.dominio === 3
              ? 'excellent'
              : 'neutral';

      nodesList.push({
        group: 'nodes', // Esto le indica a TS que es un NodeDefinition
        data: {
          id: idStr,
          label: n.label,
          status: status,
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
          selector: 'node[status="excellent"]',
          style: { 'background-color': '#10b981', 'border-color': '#d1fae5' },
        },
        {
          selector: 'node[status="good"]',
          style: { 'background-color': '#3b82f6', 'border-color': '#dbeafe' },
        },
        {
          selector: 'node[status="low"]',
          style: { 'background-color': '#f59e0b', 'border-color': '#fef3c7' },
        },
        { 
          selector: 'node[status="blocked"]', 
          style: { 
            'background-color': '#e2e8f0', 
            'color': '#94a3b8',
            'border-color': '#f1f5f9',
            'opacity': 0.8
          } 
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
