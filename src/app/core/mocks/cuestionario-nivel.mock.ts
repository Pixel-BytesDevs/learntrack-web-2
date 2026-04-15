import { PlacementResponse } from "../models/cuestionario-nivel.models";

export const PLACEMENT_RESPONSE_MOCK: PlacementResponse = {
	id: 1,
	startedAt: '2026-02-05T14:00:00Z',
	endedAt: '2026-02-05T14:15:00Z',
	duration: 900,
	questionTestResponses: [
		{
			id: 101,
			difficulty: {
				id: 1,
				label: 'Easy',
			},
			topicId: 'algebra-basica',
			timeTakenInSeconds: 45,
			statement: 'Resuelve la siguiente expresión: $2x + 3 = 7$',
			alternatives: [
				{
					id: 1,
					latexExpression: 'x = 2',
					selected: true,
				},
				{
					id: 2,
					latexExpression: 'x = 1',
					selected: false,
				},
				{
					id: 3,
					latexExpression: 'x = 5',
					selected: false,
				},
			],
		}
	],
};