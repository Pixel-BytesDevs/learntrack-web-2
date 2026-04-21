import { Injectable } from "@angular/core";
import { Services } from "../../../../environments/services/service.dev";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EvaluationResponse } from "../../models/evaluacion-recomendacion.models";

export interface EvaluateRecommendationRequest {
  userId: number;
  topicId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private apiUrl = Services.moduloAlumno.evaluacion;

  constructor(private http: HttpClient) {}

  evaluateRecommendation(request: EvaluateRecommendationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.apiUrl, request);
  }

  submitPlacementTest(id: number, placementTest: EvaluationResponse): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/${id}/submit`, placementTest);
  }
}