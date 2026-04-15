import { BehaviorSubject, Observable } from "rxjs";
import { OAData, Recommendation } from "../../models/recomendation.models";
import { Injectable } from "@angular/core";



@Injectable({
	providedIn: 'root',
})
export class RecomendationStateService {
	private recommendationSubject = new BehaviorSubject<Recommendation | null>(
		null,
	);
	private oaPrincipalSubject = new BehaviorSubject<OAData | undefined>(
		undefined,
	); // Nuevo subject para oaPrincipal

	recommendation$ = this.recommendationSubject.asObservable();
	oaPrincipal$ = this.oaPrincipalSubject.asObservable();

	setRecommendation(recommendation: Recommendation | null): void {
		this.recommendationSubject.next(recommendation);
	}

	setOaPrincipal(oaPrincipal: OAData | undefined): void {
		this.oaPrincipalSubject.next(oaPrincipal); // Establecer el oaPrincipal
	}

	getRecommendation(): Observable<Recommendation | null | undefined> {
		return this.recommendation$;
	}

	getOaPrincipal(): Observable<OAData | undefined> {
		return this.oaPrincipal$; // Obtener el OA principal
	}
}