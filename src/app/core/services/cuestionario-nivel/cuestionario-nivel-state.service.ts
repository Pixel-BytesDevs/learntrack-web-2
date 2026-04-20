import { inject, Injectable } from "@angular/core";
import { CuestionarioNivelService } from "./cuestionario-nivel.service";
import { Router } from "@angular/router";
import { PlacementResponse, PlacementTestSnapshot } from "../../models/cuestionario-nivel.models";
import { BehaviorSubject, catchError, delay, finalize, of, tap } from "rxjs";
import { UiState } from "../../enums/tipos-ui-state.enum";
import { ResultLevelTestResponse } from "../../interfaces/response/cuestionario-nivel/result-level-test-response";

@Injectable({ providedIn: 'root' })
export class CuestionarioNivelStateService {

	private _results$ = new BehaviorSubject<ResultLevelTestResponse | undefined>(undefined);
readonly results$ = this._results$.asObservable();
	private apiService = inject(CuestionarioNivelService);
	private router = inject(Router);

	private _test$ = new BehaviorSubject<PlacementResponse | null>(null);
	readonly test$ = this._test$.asObservable();

	private _loading$ = new BehaviorSubject<boolean>(false);
	readonly loading$ = this._loading$.asObservable();

	private _submitted$ = new BehaviorSubject<boolean>(false);
	readonly submitted$ = this._submitted$.asObservable();

	private _timeUp$ = new BehaviorSubject<boolean>(false);
	readonly timeUp$ = this._timeUp$.asObservable();

	private STORAGE_KEY = 'placement-test-state-v1';

	private _currentIndex = new BehaviorSubject<number>(0);
	readonly currentIndex$ = this._currentIndex.asObservable();

	private _remainingSeconds = new BehaviorSubject<number>(0);
	readonly remainingSeconds$ = this._remainingSeconds.asObservable();

	private _uiState = new BehaviorSubject<
		UiState
	>(UiState.LOADING);
	readonly uiState$ = this._uiState.asObservable();

	constructor() {
		this.restoreState(); // 👈 intentar cargar el estado al iniciar
	}

	/** Carga el cuestionario inicial */
	loadTest() {
		this._loading$.next(true);

		const cached = localStorage.getItem(this.STORAGE_KEY);
		if (cached) {
			this.restoreState();
			this._loading$.next(false);
			return;
		}

		this.apiService
			.getPlacementTest()
			.pipe(
				tap((test) => {
					test!.startedAt = new Date().toISOString();
					this._test$.next(test);
					this._remainingSeconds.next(20 * 60); // ejemplo: 20 minutos
					this._uiState.next(UiState.ACTIVE);
					this.saveState();
				}),
				catchError((error) => {
					console.error('❌ Error al cargar cuestionario', error);
					this._test$.next(null);
					return of(null);
				}),
				finalize(() => this._loading$.next(false)),
			)
			.subscribe();
	}

	/** Marca la alternativa seleccionada */
	selectAlternative(questionId: number, alternativeId: number): void {
		const current = structuredClone(this._test$.value);
		if (!current) return;

		const q = current.questionTestResponses.find((x) => x.id === questionId);
		if (q) {
			q.alternatives.forEach(
				(alt) => (alt.selected = alt.id === alternativeId),
			);
		}

		this._test$.next(current);
		this.saveState(); // 👈 guarda cada cambio
	}

	updateCurrentIndex(index: number) {
		this._currentIndex.next(index);
		this.saveState();
	}

	nextQuestion() {
		const currentIndex = this._currentIndex.value;
		const total = this._test$.value?.questionTestResponses.length ?? 0;
		if (currentIndex < total - 1) {
			this._currentIndex.next(currentIndex + 1);
			this.saveState();
		}
	}

	previousQuestion() {
		const currentIndex = this._currentIndex.value;
		if (currentIndex > 0) {
			this._currentIndex.next(currentIndex - 1);
			this.saveState();
		}
	}

	/** Valida el cuestionario antes de enviar (marca no respondidas como false) */
	validateBeforeSubmit(test: PlacementResponse): PlacementResponse {
		const validated: PlacementResponse = structuredClone(test);
		validated.questionTestResponses.forEach((q) => {
			q.alternatives.forEach((alt) => {
				if (alt.selected === null || alt.selected === undefined)
					alt.selected = false;
			});
		});
		const now = new Date().toISOString();
		validated.endedAt = now;
		validated.duration = this.calculateDuration(
			test.startedAt,
			validated.endedAt,
		);
		return validated;
	}

	/** Envía el cuestionario validado */
	/** Envía el cuestionario validado al backend */
submitTest(test: PlacementResponse) {
  const validated = this.validateBeforeSubmit(test);

  this._loading$.next(true);
  this._submitted$.next(false);
  this._uiState.next(UiState.SUBMITTING);

  this.apiService.submitPlacementTest(validated)
    .pipe(
      tap((response) => {
        console.log('RESULTADOS:', response);

        this._results$.next(response);

        localStorage.setItem(
          'placement-results',
          JSON.stringify(response)
        );

        this._submitted$.next(true);
        this._uiState.next(UiState.COMPLETED);
        this.clearState();
      }),
      finalize(() => this._loading$.next(false))
    )
    .subscribe({
      next: () => {
        this.router.navigate(['/alumno/test-inicial/results']);
      },
      error: (err) => {
        console.error(err);
      }
    });
}
	markTimeUp() {
		this._timeUp$.next(true);
		this._uiState.next(UiState.TIMEOUT);
		this.saveState();
	}

	updateRemainingTime(seconds: number) {
		this._remainingSeconds.next(seconds);
		this.saveState(); // 🔄 se guarda el tiempo actualizado cada segundo
	}

	private calculateDuration(startedAt: string, endedAt: string): number {
		const start = new Date(startedAt).getTime();
		const end = new Date(endedAt).getTime();
		return Math.floor((end - start) / 1000);
	}

	// 🧩 === PERSISTENCIA LOCAL ===
	private saveState() {
		const snapshot: PlacementTestSnapshot = {
			test: this._test$.value!,
			currentIndex: this._currentIndex.value,
			remainingSeconds: this._remainingSeconds.value,
			uiState: this._uiState.value,
			savedAt: new Date().toISOString(),
		};
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snapshot));
	}

	private restoreState() {
		const cached = localStorage.getItem(this.STORAGE_KEY);
		if (!cached) return;

		try {
			const snapshot: PlacementTestSnapshot = JSON.parse(cached);

			const now = Date.now();
			const savedAt = new Date(snapshot.savedAt).getTime();
			const diff = Math.floor((now - savedAt) / 1000);

			let remaining = snapshot.remainingSeconds - diff;
			if (remaining < 0) remaining = 0;

			this._test$.next(snapshot.test);
			this._currentIndex.next(snapshot.currentIndex);
			this._remainingSeconds.next(remaining);
			this._uiState.next(snapshot.uiState);

			console.log('♻️ Estado restaurado, tiempo ajustado:', remaining);
		} catch (err) {
			console.error('❌ Error al restaurar estado', err);
			this.clearState();
		}
	}

	private clearState() {
		localStorage.removeItem(this.STORAGE_KEY);
	}
}
