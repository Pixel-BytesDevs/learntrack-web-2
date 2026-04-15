import { Injectable } from "@angular/core";
import { Services } from "../../../../environments/services/service.dev";
import { HttpClient } from "@angular/common/http";
import { CuestionarioPayload, CuestionarioResponse } from "../../models/cuestionario.models";
import { catchError, of, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UsuariosCuestionarioService{
 private readonly apiUrl = Services.moduloAlumno.insertCuestionarioIrl;

  constructor(private http: HttpClient) {}

  private _resultadoCuestionario?: CuestionarioResponse;

  submitCuestionario(payload: CuestionarioPayload) {
    return this.http.post<CuestionarioResponse>(`${this.apiUrl}`, payload).pipe(
      tap((response) => {
        // Guardamos la respuesta en memoria al recibirla del backend
        this._resultadoCuestionario = response;
      }),
      catchError((error) => {
        console.error('Error al enviar el cuestionario:', error);
        // En caso de error, devolvemos un mock con la misma estructura
        const mockResponse: CuestionarioResponse = {
          usuarioId: payload.usuarioId,
          preguntasProcesadas: payload.respuestas.length,
          registrosInsertados: payload.respuestas.reduce(
            (acc, r) => acc + r.alternativaIds.length,
            0
          ),
          message: 'Se usó fallback (mock)',
          detalles: payload.respuestas.map((r) => ({
            preguntaId: r.preguntaId,
            alternativaIds: r.alternativaIds,
          })),
          estilos: [],
        };
        this._resultadoCuestionario = mockResponse;
        return of(mockResponse);
      })
    );
  }

  // 🔹 Getter para acceder al resultado desde otros componentes
  get resultadoCuestionario(): CuestionarioResponse | undefined {
    return this._resultadoCuestionario;
  }

  // 🔹 Método opcional para limpiar la memoria (por ejemplo, al cerrar sesión)
  clearResultado() {
    this._resultadoCuestionario = undefined;
  }
}