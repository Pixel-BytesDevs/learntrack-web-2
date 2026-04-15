import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';

// Core
import { TokenService } from '../../../../core/services/token.service';
import { RecomendacionService } from '../../../../core/services/recomendation/recomendacion.service';
import { RecomendationStateService } from '../../../../core/services/recomendation/recomendation-state.service';
import { OAData, Recommendation } from '../../../../core/models/recomendation.models';


@Component({
  selector: 'app-oa-recomendada',
  standalone: true,
  imports: [CommonModule, RouterModule, NzButtonModule, NzIconModule, NzTagModule, NzToolTipModule, NzProgressModule],
  templateUrl: './oa-recomendada.component.html',
  styleUrl: './oa-recomendada.component.scss'
})
export class OaRecomendadaComponent implements OnInit, OnDestroy {
  private recomendacionService = inject(RecomendacionService);
  private stateService = inject(RecomendationStateService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private stopPolling$ = new Subject<void>();

  // Signals
  recommendation = signal<Recommendation | null>(null);
  oaPrincipal = signal<OAData | null>(null);
  
  prerequisites = signal<string[]>([
    'Propiedades básicas de la igualdad',
    'Operaciones con números enteros',
    'Simplificación de expresiones',
  ]);

  ngOnInit(): void {
    const userId = Number(this.tokenService.getUsername()) || 1;

    // Suscribirse al estado global de recomendaciones
    this.stateService.recommendation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res) {
          this.recommendation.set(res);
          const best = this.getBestOA(res.learningObjects);
          this.oaPrincipal.set(best || null);
          if (best) this.stateService.setOaPrincipal(best);
        }
      });

    // Iniciar el Polling (cada 5 segundos)
    this.recomendacionService
      .pollRecommendation(userId, this.stopPolling$, 5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  getBestOA(learningObjects: OAData[]): OAData | undefined {
    if (!learningObjects?.length) return undefined;
    return learningObjects.reduce((best, current) => 
      current.stylePercentage > best.stylePercentage ? current : best
    );
  }

  beginLearning() {
    this.router.navigate(['/alumno/recomendaciones/visor-oa']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.recomendacionService.stopPolling();
  }
}