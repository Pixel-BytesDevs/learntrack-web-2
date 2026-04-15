import { UiState } from "../enums/tipos-ui-state.enum";
import { IdLabel } from "./base.models";

export interface AlternativePlacement {
	id: number;
	latexExpression: string;
	selected: boolean;
}


export interface QuestionPlacement {
	id: number;
	difficulty: IdLabel<number>;
	topicId?: string;
	timeTakenInSeconds: number;
	statement: string;
	alternatives: AlternativePlacement[];
}


export interface PlacementResponse {
	id: number;
	startedAt: string;
	endedAt?: string;
	duration: number;
	questionTestResponses: QuestionPlacement[];
}


export interface PlacementTestSnapshot {
	test: PlacementResponse;
	currentIndex: number;
	remainingSeconds: number;
	uiState: UiState;
	savedAt: string; // para control de expiración (opcional)
}

