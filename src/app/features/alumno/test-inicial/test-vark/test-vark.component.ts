import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CuestionarioService } from '../../../../core/services/cuestionario/cuestionario-service.service';
import { UsuariosCuestionarioService } from '../../../../core/services/test-inicial/usuarios-cuestionario-service.service';
import { SessionStorage } from '../../../../core/storages/session/session.storage';
import { TokenService } from '../../../../core/services/token.service';
import { CuestionarioPayload, PreguntaResponse } from '../../../../core/models/cuestionario.models';

// Servicios y Modelos


@Component({
  selector: 'app-test-vark',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NzButtonModule, NzIconModule, NzCheckboxModule],
  templateUrl: './test-vark.component.html',
  styleUrl: './test-vark.component.scss'
})
export class TestVarkComponent implements OnInit {
  // Inyecciones
  private cuestionarioService = inject(CuestionarioService);
  private userCuestionarioService = inject(UsuariosCuestionarioService);
  private storage = inject(SessionStorage);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  // Estado con Signals
  questions = signal<PreguntaResponse[]>([]);
  currentIndex = signal(0);
  selectedAnswers = signal<Record<number, number[]>>({});
  loading = signal(false);

  // Computados
  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  totalQuestions = computed(() => this.questions().length);
  
  answeredCount = computed(() => {
    return this.questions().filter(q => (this.selectedAnswers()[q.preguntaId]?.length ?? 0) > 0).length;
  });

  progress = computed(() => {
    if (this.totalQuestions() === 0) return 0;
    return Math.floor((this.answeredCount() / this.totalQuestions()) * 100);
  });

  isLastQuestion = computed(() => this.currentIndex() === this.totalQuestions() - 1);

  constructor() {
    // Efecto para persistir automáticamente en sessionStorage cuando cambien las respuestas
    effect(() => {
      this.storage.save('vark_progress', this.selectedAnswers());
    });
  }

  ngOnInit() {
    this.loadQuestions();
    this.restoreProgress();
  }

  private loadQuestions() {
    this.cuestionarioService.getQuestions().subscribe(data => {
      this.questions.set(data);
    });
  }

  private restoreProgress() {
    const cache = this.storage.get<Record<number, number[]>>('vark_progress');
    if (cache) this.selectedAnswers.set(cache);
  }

  toggleOption(preguntaId: number, alternativaId: number) {
    const current = { ...this.selectedAnswers() };
    let alts = current[preguntaId] ? [...current[preguntaId]] : [];

    if (alts.includes(alternativaId)) {
      alts = alts.filter(id => id !== alternativaId);
    } else {
      alts.push(alternativaId);
    }

    current[preguntaId] = alts;
    this.selectedAnswers.set(current);
  }

  next() {
    if (this.currentIndex() < this.totalQuestions() - 1) {
      this.currentIndex.update(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submit() {
    this.loading.set(true);
    const payload: CuestionarioPayload = {
      usuarioId: Number(this.tokenService.getUsername()) || 1,
      respuestas: this.questions().map(q => ({
        preguntaId: q.preguntaId,
        alternativaIds: this.selectedAnswers()[q.preguntaId] ?? []
      }))
    };

    this.userCuestionarioService.submitCuestionario(payload).subscribe({
      next: () => {
        this.storage.remove('vark_progress');
        this.message.success('Cuestionario VARK completado con éxito');
        this.router.navigate(['/alumno/test-inicial/nivel']);
      },
      error: () => {
        this.message.error('Error al enviar las respuestas');
        this.loading.set(false);
      }
    });
  }
}