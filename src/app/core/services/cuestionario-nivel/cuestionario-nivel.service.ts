import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Services } from "../../../../environments/services/service.dev";
import { BehaviorSubject, catchError, Observable, of, tap } from "rxjs";
import { PlacementResponse } from "../../models/cuestionario-nivel.models";
import { PLACEMENT_RESPONSE_MOCK } from "../../mocks/cuestionario-nivel.mock";

@Injectable({
	providedIn: 'root',
})
export class CuestionarioNivelService {
	private http = inject(HttpClient);
	private apiUrl = Services.moduloAlumno.cuestionarioNivel;

	private readonly _questions$ = new BehaviorSubject<PlacementResponse | null>(
		null,
	);
	private readonly _loading$ = new BehaviorSubject<boolean>(false);

	readonly questions$ = this._questions$.asObservable();
	readonly loading$ = this._loading$.asObservable();

	getPlacementTest(): Observable<PlacementResponse | null> {
		this._loading$.next(true);

		return this.http.post<PlacementResponse>(`${this.apiUrl}`, null).pipe(
			tap((res) => this._questions$.next(res)),
			catchError((error) => {
				console.error('Error al obtener PlacementTest:', error);
				this._questions$.next(null);
				return of(PLACEMENT_RESPONSE_MOCK);
			}),
			tap(() => this._loading$.next(false)),
		);
	}

	submitPlacementTest(test: PlacementResponse): Observable<any> {
		return this.http.put(`${this.apiUrl}/submit`, test).pipe(
			tap(() => console.log('PlacementTest enviado correctamente', test)),
			catchError((error) => {
				console.error('Error al enviar PlacementTest:', error);
				return of(null);
			}),
		);
	}
}