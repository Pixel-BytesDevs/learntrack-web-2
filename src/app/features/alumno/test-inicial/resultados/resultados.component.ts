import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsuariosCuestionarioService } from '../../../../core/services/test-inicial/usuarios-cuestionario-service.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';
import { CuestionarioResponse } from '../../../../core/models/cuestionario.models';
import { CompetenciaInicialDTO, CompetenciaProgresoDTO } from '../../../../core/models/resultados-test.models';
import { TipoEstiloVark } from '../../../../core/enums/tipo-estilo-vark.enum';

// Core



@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, NzButtonModule, NzIconModule, NzProgressModule, NzCardModule, NzTagModule],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss'
})
export class ResultadosComponent implements OnInit {
  private cuestionarioService = inject(UsuariosCuestionarioService);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  // Signals para el estado
  resultado = signal<CuestionarioResponse | undefined>(undefined);
  loading = signal(false);

  // Competencias (pueden venir de un servicio futuro, por ahora mantenemos tus datos)
  competenciasProgreso = signal<CompetenciaProgresoDTO[]>([
    { nombre: 'Ecuaciones lineales', porcentaje: 80 },
    { nombre: 'Expresiones algebraicas', porcentaje: 60 },
    { nombre: 'Factorización', porcentaje: 40 },
    { nombre: 'Ecuaciones cuadráticas', porcentaje: 20 },
  ]);

  competenciaInicial = signal<CompetenciaInicialDTO>({
    competencia: 'Ecuaciones lineales',
    dificultad: 'Intermedio',
    descripcion: 'Comenzamos en esta competencia para consolidar lo ya dominado (80%) y progresar rápidamente hacia problemas con múltiples pasos y variables.'
  });

  // Computados
  estiloPredominante = computed(() => {
    const res = this.resultado();
    if (!res || !res.estilos.length) return undefined;
    return res.estilos.reduce((prev, curr) => (curr.porcentaje > prev.porcentaje ? curr : prev));
  });

  descripcionEstilo = computed(() => {
    const tipo = this.estiloPredominante()?.tipo;
    switch (tipo) {
      case TipoEstiloVark.VISUAL: return 'Aprendes mejor con imágenes, diagramas y esquemas. Los colores y mapas mentales son tus mejores aliados.';
      case TipoEstiloVark.AUDITIVO: return 'Aprendes mejor escuchando y debatiendo. Las explicaciones orales y audios facilitan tu retención.';
      case TipoEstiloVark.LECTURA_ESCRITURA: return 'Prefieres las notas, listas y textos detallados. Escribir y leer es tu forma natural de procesar.';
      case TipoEstiloVark.KINESTESICO: return 'Aprendes haciendo. Las simulaciones y ejemplos prácticos son los que realmente te ayudan a entender.';
      default: return 'Cargando tu perfil...';
    }
  });

  ngOnInit() {
    this.resultado.set(this.cuestionarioService.resultadoCuestionario);
  }

  getStyleColor(tipo: string): string {
    switch (tipo) {
      case TipoEstiloVark.VISUAL: return '#3b82f6';
      case TipoEstiloVark.AUDITIVO: return '#6366f1';
      case TipoEstiloVark.LECTURA_ESCRITURA: return '#a855f7';
      case TipoEstiloVark.KINESTESICO: return '#10b981';
      default: return '#94a3b8';
    }
  }

  finishProcess(): void {
    this.loading.set(true);
    const username = this.tokenService.getUsername();
    const isGoogle = this.tokenService.isGoogleUser();

    const request$ = isGoogle 
      ? this.authService.completeVarkGoogle(username) 
      : this.authService.completeVark(username);

    request$.subscribe({
      next: () => {
        this.authService.refreshToken().subscribe({
          next: (tokens) => {
            this.tokenService.setTokens(tokens.access_token, tokens.refresh_token);
            this.message.success('¡Perfil configurado con éxito!');
            this.router.navigate(['/alumno']);
          },
          error: () => this.handleError()
        });
      },
      error: () => this.handleError()
    });
  }

  private handleError() {
    this.message.error('Error al finalizar el registro.');
    this.loading.set(false);
  }
}