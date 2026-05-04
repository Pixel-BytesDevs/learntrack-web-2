import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ActiveTopicResponse } from '../../../core/interfaces/response/grafo/active-topic-response';
import { ScoreAndTopicResponse } from '../../../core/interfaces/response/cuestionario-nivel/score-and-topic-response';
import { Recommendation } from '../../../core/models/recomendation.models';
import { GrafoEstudianteService } from '../../../core/services/grafo/grafo-estudiante.service';
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
  private readonly grafoEstudiante = inject(GrafoEstudianteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly recommendation = signal<Recommendation | null>(null);
  readonly activeTopics = signal<ActiveTopicResponse[]>([]);

  readonly studentName = computed(() => {
    const fullName = this.store.user()?.name?.trim();
    if (!fullName) return 'Estudiante';
    return fullName.split(' ')[0];
  });

  readonly topicRows = computed(() =>
    this.activeTopics().map((t) => ({
      id: t.id,
      nameTopic: t.name,
      score: Math.round(Number(t.domain)),
    })),
  );

  readonly averageScore = computed(() => {
    const topics = this.activeTopics();
    if (!topics.length) return 0;
    const total = topics.reduce((acc, t) => acc + Number(t.domain), 0);
    return Math.round(total / topics.length);
  });

  readonly strongestTopic = computed(() => {
    const topics = this.activeTopics();
    if (!topics.length) return this.emptyTopic;
    const best = topics.reduce((b, t) => (Number(t.domain) > Number(b.domain) ? t : b));
    return { nameTopic: best.name, score: Math.round(Number(best.domain)) };
  });

  readonly weakestTopic = computed(() => {
    const topics = this.activeTopics();
    if (!topics.length) return this.emptyTopic;
    const worst = topics.reduce((w, t) => (Number(t.domain) < Number(w.domain) ? t : w));
    return { nameTopic: worst.name, score: Math.round(Number(worst.domain)) };
  });

  readonly hasData = computed(
    () => !!this.recommendation() || this.activeTopics().length > 0,
  );

  constructor() {
    this.grafoEstudiante
      .getActiveTopics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((topics) => this.activeTopics.set(topics ?? []));

    this.recommendationState.recommendation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recommendation) => this.recommendation.set(recommendation));
  }
}