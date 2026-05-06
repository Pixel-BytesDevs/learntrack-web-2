import { TokenService } from './../token.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { RecomendationStateService } from './recomendation-state.service';
import { OAData, Recommendation } from '../../models/recomendation.models';
import { Services } from '../../../../environments/services/service.dev';

@Injectable({
  providedIn: 'root',
})
export class RecomendacionService {
  private apiUrl = Services.moduloAlumno.recomendation;
  tokenService = inject(TokenService);

  private stopPolling$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private recommendationStateService: RecomendationStateService,
  ) {}

  /** GET simple (sin polling) */
  getRecommendation(userId: number): Observable<Recommendation | null> {
    return this.http.get<unknown>(`${this.apiUrl}/${userId}`).pipe(
      map((raw) => this.normalizeRecommendation(raw)),
      catchError((err) => {
        console.error('Error obteniendo recomendación', err);
        return of(null);
      }),
    );
  }

  /**
   * El backend puede devolver:
   * - `{ status: 'PENDING', ... }` mientras prepara la recomendación
   * - Un único objeto `Recommendation`
   * - Un arreglo con un elemento `[{ topicId, topicName, learningObjects }]`
   */
  private normalizeRecommendation(raw: unknown): Recommendation | null {
    if (raw == null || raw === '') return null;

    let node: Record<string, unknown> | null = null;

    if (Array.isArray(raw)) {
      if (raw.length === 0) return null;
      const first = raw[0];
      if (!first || typeof first !== 'object') return null;
      node = first as Record<string, unknown>;
    } else if (typeof raw === 'object') {
      node = raw as Record<string, unknown>;
    } else {
      return null;
    }

    const status = node['status'];
    if (status === 'PENDING') return null;

    const topicId = node['topicId'];
    const topicNameVal = node['topicName'];

    const learningObjectsRaw = node['learningObjects'];
    const learningObjects = Array.isArray(learningObjectsRaw)
      ? learningObjectsRaw.map((lo) =>
          this.normalizeLearningObject(
            typeof lo === 'object' && lo !== null ? (lo as Record<string, unknown>) : {},
            typeof topicNameVal === 'string' ? topicNameVal : '',
          ),
        )
      : [];

    const domainLevelRaw = node['domainLevel'];

    let statusOut: Recommendation['status'] | undefined;
    if (status === 'FAILED') statusOut = 'FAILED';
    else if (status === 'READY') statusOut = 'READY';

    return {
      topicId: typeof topicId === 'string' ? topicId : String(topicId ?? ''),
      topicName: typeof topicNameVal === 'string' ? topicNameVal : '',
      domainLevel:
        typeof domainLevelRaw === 'number' && Number.isFinite(domainLevelRaw)
          ? domainLevelRaw
          : 0,
      learningObjects,
      ...(statusOut ? { status: statusOut } : {}),
    };
  }

  private normalizeLearningObject(lo: Record<string, unknown>, topicFallback: string): OAData {
    const recIdRaw = lo['recommendationId'];
    const recId =
      typeof recIdRaw === 'number'
        ? recIdRaw
        : typeof recIdRaw === 'string'
          ? Number.parseInt(recIdRaw, 10) || 0
          : 0;

    const idObjRaw = lo['idObject'];
    const idObject =
      typeof idObjRaw === 'number'
        ? idObjRaw
        : typeof idObjRaw === 'string'
          ? Number.parseInt(idObjRaw, 10) || recId
          : recId;

    const est = lo['estimatedDuration'];
    const estNum =
      typeof est === 'number' && Number.isFinite(est)
        ? est
        : typeof est === 'string'
          ? Number.parseFloat(est) || 0
          : 0;

    const pct = lo['stylePercentage'];
    const stylePercentage =
      typeof pct === 'number' && Number.isFinite(pct)
        ? pct
        : typeof pct === 'string'
          ? Number.parseFloat(pct) || 0
          : 0;

    const fileName =
      typeof lo['fileName'] === 'string' ? lo['fileName'] : '';

    const typeRaw = lo['typeName'];

    return {
      recommendationId: recId,
      estimatedDuration: estNum,
      fileExtension:
        typeof lo['fileExtension'] === 'string' ? lo['fileExtension'] : '',
      fileName,
      idObject,
      levelName: typeof lo['levelName'] === 'string' ? lo['levelName'] : '',
      s3Url: typeof lo['s3Url'] === 'string' ? lo['s3Url'] : '',
      styleName: typeof lo['styleName'] === 'string' ? lo['styleName'] : '',
      stylePercentage,
      title:
        typeof lo['title'] === 'string' && lo['title']
          ? (lo['title'] as string)
          : fileName || 'Recurso',
      topicName:
        typeof lo['topicName'] === 'string'
          ? (lo['topicName'] as string)
          : topicFallback,
      typeName:
        typeof typeRaw === 'string'
          ? typeRaw
          : typeRaw === null || typeRaw === undefined
            ? ''
            : String(typeRaw),
    };
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
      filter((rec): rec is Recommendation => rec != null),
      take(1),
      switchMap((response) => {
        this.recommendationStateService.setRecommendation(response);
        return of(response);
      }),
    );
  }

  /** Cancelación manual */
  stopPolling() {
    this.stopPolling$.next();
  }
}
