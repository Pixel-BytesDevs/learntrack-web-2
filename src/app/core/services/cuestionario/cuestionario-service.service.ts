import { catchError, of } from "rxjs";
import { PreguntaResponse } from "../../models/cuestionario.models";
import { Services } from "../../../../environments/services/service.dev";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CUESTIONARIO_MOCKS } from "../../mocks/cuestionario-mocks";

@Injectable({
	providedIn: 'root',
})
export class CuestionarioService {
	private apiUrl = Services.moduloAlumno.cuestionarioUrl;

	constructor(private http: HttpClient) {}

	// Obtener las preguntas (primero desde el backend, si falla, usar mocks)
	getQuestions() {
		return this.http.get<PreguntaResponse[]>(this.apiUrl).pipe(
			// Si la llamada al backend falla, utilizamos mocks
			catchError((error) => {
				console.error('Error al obtener preguntas desde el backend:', error);
				return of(CUESTIONARIO_MOCKS);
			}),
		);
	}
}