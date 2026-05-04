import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ScoreAndTopicResponse } from '../../../core/interfaces/response/cuestionario-nivel/score-and-topic-response';
import { Recommendation } from '../../../core/models/recomendation.models';
import { ResultLevelTestResponse } from '../../../core/interfaces/response/cuestionario-nivel/result-level-test-response';
import { RecomendationStateService } from '../../../core/services/recomendation/recomendation-state.service';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-alumno-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzProgressModule,
    NzTagModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly emptyTopic: ScoreAndTopicResponse = { nameTopic: 'Sin datos', score: 0 };
  private readonly store = inject(AppStore);
  private readonly recommendationState = inject(RecomendationStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recommendation = signal<Recommendation | null>(null);
  readonly levelResults = signal<ResultLevelTestResponse | null>(null);

  readonly studentName = computed(() => {
    const fullName = this.store.user()?.name?.trim();
    if (!fullName) return 'Estudiante';
    return fullName.split(' ')[0];
  });

  readonly averageScore = computed(() => {
    const scores = this.levelResults()?.scores ?? [];
    if (!scores.length) return 0;
    const total = scores.reduce((acc, item) => acc + item.score, 0);
    return Math.round(total / scores.length);
  });

  readonly strongestTopic = computed(() => {
    const scores = this.levelResults()?.scores ?? [];
    return scores.reduce(
      (best, item) => (item.score > best.score ? item : best),
      scores[0] ?? this.emptyTopic,
    );
  });

  readonly weakestTopic = computed(() => {
    const scores = this.levelResults()?.scores ?? [];
    return scores.reduce(
      (lowest, item) => (item.score < lowest.score ? item : lowest),
      scores[0] ?? this.emptyTopic,
    );
  });

  readonly hasData = computed(
    () => !!this.recommendation() || (this.levelResults()?.scores?.length ?? 0) > 0,
  );

  constructor() {
    this.loadLevelResults();
    this.recommendationState.recommendation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recommendation) => this.recommendation.set(recommendation));
  }

  private loadLevelResults(): void {
    const cached = localStorage.getItem('placement-results');
    if (!cached) return;

    try {
      const parsed = JSON.parse(cached) as ResultLevelTestResponse;
      this.levelResults.set(parsed);
    } catch (error) {
      console.error('No se pudo leer placement-results', error);
    }
  }
}