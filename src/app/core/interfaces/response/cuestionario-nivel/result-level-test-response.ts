import { ScoreAndTopicResponse } from "./score-and-topic-response";

export interface ResultLevelTestResponse {
    scores: ScoreAndTopicResponse[];
    nameFirsTopic: string;
}