import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Services } from "../../../../environments/services/service.dev";
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap } from "rxjs";
import { ActiveTopicResponse } from "../../interfaces/response/grafo/active-topic-response";
import { TemaNodo } from "../../models/grafo.models";


interface ApiResponse {
	message: string;
	userId: number;
	status: string;
  }

@Injectable({
	providedIn: 'root',
})
export class GrafoEstudianteService {
	private http = inject(HttpClient);
	private apiUrl = Services.moduloAlumno.grafoEstudiante;

    private readonly _graph$ = new BehaviorSubject<TemaNodo[] | null>(null);
    private readonly _loading$ = new BehaviorSubject<boolean>(false);
    readonly loading$ = this._loading$.asObservable();
    readonly graph$ = this._graph$.asObservable();

	getGrafoEstudiante(userId: number): Observable<TemaNodo[] | null> {
        this._loading$.next(true);
		return this.http.get<TemaNodo[]>(`${this.apiUrl}/progress-graph`).pipe(
			tap((res) => this._graph$.next(res)),
			catchError((error) => {
				console.error('Error al obtener el grafo del estudiante:', error);
				this._graph$.next(null);
                return of(null);
			}),
            finalize(() => this._loading$.next(false)),
		);
	}

	initializationOfStudentGraph(): Observable<string> {
		return this.http.post<ApiResponse>(`${this.apiUrl}/initialize`, null).pipe(
			map(response => response.message),
			catchError((error) => {
				console.error('Error al inicializar el grafo del estudiante: ', error);
				return of("ERROR");
			}),
		);
	}

	getActiveTopics(): Observable<ActiveTopicResponse[]> {
		return this.http.get<ActiveTopicResponse[]>(`${this.apiUrl}/active-topics`).pipe(
			catchError((error) => {
				console.error('Error al obtener temas activos:', error);
				return of([]);
			}),
		);
	}
}