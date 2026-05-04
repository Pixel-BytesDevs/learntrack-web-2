import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumnoDataRequest } from '../../interfaces/request/alumno-data-request';
import { Services } from '../../../../environments/services/service.dev';

@Injectable({
	providedIn: 'root',
})
export class AlumnoService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = Services.moduloAlumno.alumno;

	createAlumno(request: AlumnoDataRequest): Observable<string> {
		return this.http.post(`${this.baseUrl}/create`, request, {
			responseType: 'text',
		});
	}
}
