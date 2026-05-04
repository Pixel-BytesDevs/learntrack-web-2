import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';

// Core & Shared
import { TokenService } from '../../../../core/services/token.service';
import { KatexDirective } from '../../../../shared/directives/katex.directive';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { EvaluacionService } from '../../../../core/services/evaluacion-recomendacion/evaluacion-recomendacion.service';
import { EvaluationResponse } from '../../../../core/models/evaluacion-recomendacion.models';
import { AlternativePlacement } from '../../../../core/models/cuestionario-nivel.models';

@Component({
  selector: 'app-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    KatexDirective,
    DecimalPipe,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzSpinModule,
    NzModalModule,
    NzTagComponent,
  ],
  templateUrl: './evaluacion.component.html',
  styleUrl: './evaluacion.component.scss',
})
export class EvaluacionComponent implements OnInit, OnDestroy {
  private evaluationService = inject(EvaluacionService);
  private tokenService = inject(TokenService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private destroy$ = new Subject<void>();

  

  // Signals de Estado
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);

  placementTest = signal<EvaluationResponse | null>(null);
  currentQuestionIndex = signal(0);
  timeRemaining = signal(0);

  // Modal de Resultados
  showResultModal = signal(false);
  domainLevelResult = signal<number>(0);

  // Computados
  currentQuestion = computed(() => {
    const test = this.placementTest();
    return test
      ? test.questionTestResponses[this.currentQuestionIndex()]
      : null;
  });

  canGoNext = computed(() => {
    const question = this.currentQuestion();
    if (!question) return false;
    // Retorna true si al menos una alternativa está seleccionada
    return question.alternatives.some((alt) => alt.selected);
  });
  progressPercentage = computed(() => {
    const test = this.placementTest();
    if (!test) return 0;
    return (
      ((this.currentQuestionIndex() + 1) / test.questionTestResponses.length) *
      100
    );
  });

  private timerInterval?: any;

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const topicId = params['topicId'];
        const userId = Number(this.tokenService.getUsername()) || 1;
        console.log("userId: ",userId);

        if (topicId) {
          this.fetchEvaluation(userId, topicId);
        } else {
          this.error.set('No se especificó un tema para evaluar.');
          this.loading.set(false);
        }
      });
  }

  fetchEvaluation(userId: number, topicId: string): void {
    this.loading.set(true);
    this.evaluationService
      .evaluateRecommendation({ userId, topicId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.placementTest.set(res);
          this.timeRemaining.set(res.duration * 60);
          this.startTimer();
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la evaluación. Intenta de nuevo.');
          this.loading.set(false);
        },
      });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining() > 0) {
        this.timeRemaining.update((t) => t - 1);
      } else {
        this.finishEvaluation();
      }
    }, 1000);
  }

selectAlternative(alt: AlternativePlacement): void {
  this.placementTest.update((test) => {
    if (!test) return test;

    const questionIndex = this.currentQuestionIndex();

    const updatedQuestions = [...test.questionTestResponses];

    const current = updatedQuestions[questionIndex];

    updatedQuestions[questionIndex] = {
      ...current,
      alternatives: current.alternatives.map((a) => ({
        ...a,
        selected: a.id === alt.id,
      })),
    };

    return {
      ...test,
      questionTestResponses: updatedQuestions,
    };
  });
}

  nextQuestion(): void {
    const test = this.placementTest();
    if (
      test &&
      this.currentQuestionIndex() < test.questionTestResponses.length - 1
    ) {
      this.currentQuestionIndex.update((i) => i + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((i) => i - 1);
    }
  }

  async finishEvaluation(): Promise<void> {
    clearInterval(this.timerInterval);
    const test = this.placementTest();
    if (!test) return;

    this.submitting.set(true);

    // Calculamos duración real
    const realDuration = Math.floor(
      (test.duration * 60 - this.timeRemaining()) / 60,
    );
    const finalPayload: EvaluationResponse = {
      ...test,
      duration: realDuration,
    };
    const userId = Number(this.tokenService.getUsername()) || 1;

    try {
      const result = await this.evaluationService
        .submitPlacementTest(userId, finalPayload)
        .toPromise();
      console.log("results: ",result)
      this.domainLevelResult.set(result || 0);
      this.showResultModal.set(true);
    } catch (e) {
      this.message.error('Error al enviar los resultados.');
    } finally {
      this.submitting.set(false);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  confirmAndExit(): void {
    this.showResultModal.set(false);
    this.router.navigate(['/alumno/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
