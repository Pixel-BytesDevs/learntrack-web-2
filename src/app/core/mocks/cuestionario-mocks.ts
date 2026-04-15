import { PreguntaResponse } from "../models/cuestionario.models";


export const CUESTIONARIO_MOCKS: PreguntaResponse[] = [
  {
    preguntaId: 1,
    sentencia: 'Pregunta numero 1:',
    alternativas: [
      { alternativaId: 1, alternativa: 'Pregunta 1 Alternativa 1' },
      { alternativaId: 2, alternativa: 'Pregunta 1 Alternativa 2' },
      { alternativaId: 3, alternativa: 'Pregunta 1 Alternativa 3' },
      { alternativaId: 4, alternativa: 'Pregunta 1 Alternativa 4' },
    ],
  },
/*
  {
    preguntaId: 2,
    sentencia: 'Pregunta numero 2:',
    alternativas: [
      { alternativaId: 5, alternativa: 'Pregunta 2 Alternativa 1' },
      { alternativaId: 6, alternativa: 'Pregunta 2 Alternativa 2' },
      { alternativaId: 7, alternativa: 'Pregunta 2 Alternativa 3' },
      { alternativaId: 8, alternativa: 'Pregunta 2 Alternativa 4' },
    ],
  },
 {
    preguntaId: 3,
    sentencia: 'Pregunta numero 3:',
    alternativas: [
      { alternativaId: 9, alternativa: 'Pregunta 3 Alternativa 1' },
      { alternativaId: 10, alternativa: 'Pregunta 3 Alternativa 2' },
      { alternativaId: 11, alternativa: 'Pregunta 3 Alternativa 3' },
      { alternativaId: 12, alternativa: 'Pregunta 3 Alternativa 4' },
    ],
  },
  */
  // Agrega más preguntas si lo necesitas
];

