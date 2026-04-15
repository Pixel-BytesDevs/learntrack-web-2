import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, filter, takeUntil, tap } from 'rxjs';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { KatexDirective } from '../../../../shared/directives/katex.directive';
import { CuestionarioNivelStateService } from '../../../../core/services/cuestionario-nivel/cuestionario-nivel-state.service';
import { UiState } from '../../../../core/enums/tipos-ui-state.enum';
import { PlacementResponse } from '../../../../core/models/cuestionario-nivel.models';

// Core & Shared

// Asumo que tienes un TimerComponent, si no, podemos integrarlo aquí
// import { TimerComponent } from '../../../shared/components/timer/timer.component';

@Component({
  selector: 'app-test-nivel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzSpinModule,
    NzCardModule,
    KatexDirective,
  ],
  templateUrl: './test-nivel.component.html',
  styleUrl: './test-nivel.component.scss',
})
export class TestNivelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  readonly state = inject(CuestionarioNivelStateService);

  // UI State adaptado
  uiState = signal<UiState>(UiState.LOADING);
  protected readonly UiStates = UiState;

  test = signal<PlacementResponse | null>(null);
  currentIndex = signal(0);
  selectedAnswers = signal<Record<number, number>>({});

  // Computados para el diseño
  currentQuestion = computed(
    () => this.test()?.questionTestResponses[this.currentIndex()] ?? null,
  );
  totalQuestions = computed(
    () => this.test()?.questionTestResponses.length ?? 0,
  );

  progress = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    const answered = Object.keys(this.selectedAnswers()).length;
    return Math.floor((answered / total) * 100);
  });

  ngOnInit(): void {
    this.state.loadTest();

    // Sincronizar con el State Service
    this.state.test$
      .pipe(
        filter((t) => !!t),
        takeUntil(this.destroy$),
      )
      .subscribe((t) => {
        this.test.set(t);
        this.rehydrateLocalAnswers(t!);
      });

    this.state.currentIndex$
      .pipe(takeUntil(this.destroy$))
      .subscribe((i) => this.currentIndex.set(i));

    this.state.uiState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => this.uiState.set(s));
  }

  selectOption(qId: number, altId: number): void {
    const current = { ...this.selectedAnswers() };
    current[qId] = altId;
    this.selectedAnswers.set(current);
    this.state.selectAlternative(qId, altId);
  }

  next(): void {
    if (this.currentIndex() < this.totalQuestions() - 1) {
      this.state.nextQuestion();
      this.scrollTop();
    }
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.state.previousQuestion();
      this.scrollTop();
    }
  }

  submit(): void {
    if (this.test()) {
      this.state.submitTest(this.test()!);
    }
  }

  private rehydrateLocalAnswers(test: PlacementResponse) {
    const answers: Record<number, number> = {};
    test.questionTestResponses.forEach((q) => {
      const selected = q.alternatives.find((a) => a.selected);
      if (selected) answers[q.id] = selected.id;
    });
    this.selectedAnswers.set(answers);
  }

  private scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
