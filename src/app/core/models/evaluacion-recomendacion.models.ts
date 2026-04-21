import { QuestionPlacement } from "./cuestionario-nivel.models";

export interface EvaluationResponse {
    id: number;
    duration: number;
    questionTestResponses: QuestionPlacement[];
    startedAt: string;
    userId: number;
    topicName: string
}