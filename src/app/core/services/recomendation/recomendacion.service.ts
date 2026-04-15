import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  filter,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { RecomendationStateService } from './recomendation-state.service';
import { Recommendation } from '../../models/recomendation.models';

@Injectable({
  providedIn: 'root',
})
export class RecomendacionService {
  private apiUrl = 'http://26.138.194.69:5000/api/v1/recommendations';

  private stopPolling$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private recommendationStateService: RecomendationStateService,
  ) {}

  /** GET simple (sin polling) */
  getRecommendation(userId: number): Observable<Recommendation | null> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      catchError((err) => {
        console.error('Error obteniendo recomendación', err);
        return of(null);
      }),
    );
  }

  /**
   * Polling controlado: consulta cada X ms hasta que haya una recomendación lista
   */
  pollRecommendation(
    userId: number,
    stop$: Subject<void>,
    intervalMs = 3000,
  ): Observable<Recommendation | null> {
    return timer(0, intervalMs).pipe(
      takeUntil(stop$),
      switchMap(() => this.getRecommendation(userId)),
      filter((response) => {
        if (!response || response.status === 'PENDING') {
          return false;
        }
        return true;
      }),
      take(1), // Toma solo la primera recomendación lista y completa automáticamente
      switchMap((response) => {
        this.recommendationStateService.setRecommendation(response); // Establece la recomendación en el estado
        return of(response);
      }),
    );
  }

  /** Cancelación manual */
  stopPolling() {
    this.stopPolling$.next();
  }
}
