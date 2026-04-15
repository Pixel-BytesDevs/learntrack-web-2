import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCardModule } from 'ng-zorro-antd/card';
import { RecomendationStateService } from '../../../../core/services/recomendation/recomendation-state.service';
import { OAData, Recommendation } from '../../../../core/models/recomendation.models';
import { TiposMaterial } from '../../../../core/enums/tipos-material.enum';

// Core


@Component({
  selector: 'app-visor-oa',
  standalone: true,
  imports: [CommonModule, RouterModule, NzButtonModule, NzIconModule, NzTagModule, NzToolTipModule, NzProgressModule, NzCardModule],
  templateUrl: './visor-oa.component.html',
  styleUrl: './visor-oa.component.scss'
})
export class VisorOaComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  private stateService = inject(RecomendationStateService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals de Estado
  loading = signal(true);
  isPlaying = signal(false);
  videoProgress = signal(0);
  currentTime = signal(0);
  videoDuration = signal(0);
  
  recommendation = signal<Recommendation | null>(null);
  selectedResource = signal<OAData | null>(null);
  
  // Recursos complementarios (excluyendo el seleccionado)
  complementaryResources = computed(() => {
    const rec = this.recommendation();
    const current = this.selectedResource();
    if (!rec) return [];
    return rec.learningObjects
      .filter(oa => oa.recommendationId !== current?.recommendationId)
      .sort((a, b) => b.stylePercentage - a.stylePercentage)
      .slice(0, 3);
  });

  protected readonly TiposMaterial = TiposMaterial;

  ngOnInit(): void {
    // Escuchar cambios en la recomendación global
    this.stateService.recommendation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res) {
          this.recommendation.set(res);
          this.loading.set(false);
        }
      });

    // Escuchar cuál es el OA principal definido
    this.stateService.oaPrincipal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(oa => {
        if (oa) this.selectedResource.set(oa);
      });
  }

  // --- Controles de Video ---
  togglePlay(): void {
    const player = this.videoPlayer?.nativeElement;
    if (!player) return;

    if (this.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
    this.isPlaying.set(!this.isPlaying());
  }

  onTimeUpdate(): void {
    const player = this.videoPlayer.nativeElement;
    this.currentTime.set(player.currentTime);
    this.videoDuration.set(player.duration);
    this.videoProgress.set((player.currentTime / player.duration) * 100);
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // --- Navegación ---
  selectResource(resource: OAData): void {
    this.selectedResource.set(resource);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initEvaluation(): void {
    const rec = this.recommendation();
    if (!rec) return;
    this.router.navigate(['/alumno/recomendaciones/evaluacion'], {
      queryParams: { topicId: rec.topicId }
    });
  }

  goBack(): void {
    this.router.navigate(['/alumno/recomendaciones']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}