export interface DetalleRespuesta {
  preguntaId: number;
  alternativaIds: number[];
}

export interface EstiloVark {
  estiloVarkId: number;
  tipo: string; // o puedes usar un enum si los valores son fijos
  porcentaje: number;
}
export interface CuestionarioResponse {
  usuarioId: number;
  preguntasProcesadas: number;
  registrosInsertados: number;
  message: string;
  detalles: DetalleRespuesta[];
  estilos: EstiloVark[];
}


//--

export interface RespuestaPayload {
  preguntaId: number;
  alternativaIds: number[];
}

export interface CuestionarioPayload {
  usuarioId: number;
  respuestas: RespuestaPayload[];
}

// del service cuestionario
export interface Alternativa {
  alternativaId: number;
  alternativa: string;
}

export interface PreguntaResponse {
  preguntaId: number;
  sentencia: string;
  alternativas: Alternativa[];
}
