import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { PkceService } from './pkce.service';
import { TokenService } from './token.service';
import { LoginPayload, LoginResponse, RegisterPayload } from '../models/auth.models';
import { environment } from '../../../environments/environments';


@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private http = inject(HttpClient);
	private pkceService = inject(PkceService);
	private tokenService = inject(TokenService);

	// ── Login con formulario propio ──────────────────────────────────

	login(payload: LoginPayload): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(
			`${environment.auth_url}/auth/login`,
			payload,
		);
	}

	// ── Login con Google (flujo PKCE hacia Spring) ───────────────────

	async loginWithGoogle(): Promise<void> {
		const verifier = this.pkceService.generateCodeVerifier();
		const challenge = await this.pkceService.generateCodeChallenge(verifier);

		const params = new URLSearchParams({
			response_type: 'code',
			client_id: environment.client_id,
			redirect_uri: environment.redirect_uri,
			scope: environment.scope,
			code_challenge: challenge,
			code_challenge_method: 'S256',
			// Le indica a Spring que arranque directo con Google
			// sin mostrar su formulario intermedio de login
			idp: 'google',
		});

		//window.location.href = `${environment.auth_url}/oauth2/authorize?${params}`;
		window.location.href = `${environment.auth_url}/oauth2/authorize?${params}`;
	}

	// ── Intercambio de code por tokens (viene de /authorized) ────────

	getToken(code: string): Observable<LoginResponse> {
		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: environment.client_id,
			redirect_uri: environment.redirect_uri,
			code_verifier: this.pkceService.getCodeVerifier(),
			code,
		});

		const headers = new HttpHeaders({
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' +
				btoa(`${environment.client_id}:${environment.client_secret}`),
		});

		return this.http.post<LoginResponse>(
			environment.token_url,
			body.toString(),
			{ headers },
		);
	}

	// ── Register ─────────────────────────────────────────────────────

	register(payload: RegisterPayload): Observable<any> {
		return this.http.post(`${environment.auth_url}/auth/create`, payload);
	}

	// ── VARK ─────────────────────────────────────────────────────────

	completeVark(username: string): Observable<any> {
		return this.http.patch(
			`${environment.auth_url}/auth/complete-vark?username=${username}`,
			{},
		);
	}

	completeVarkGoogle(email: string): Observable<any> {
		return this.http.patch(
			`${environment.auth_url}/auth/complete-vark-google?email=${email}`,
			{},
		);
	}

	refreshToken(): Observable<LoginResponse> {
		const refreshToken = this.tokenService.getRefreshToken();

		return this.http.post<LoginResponse>(
			`${environment.auth_url}/auth/refresh`,
			{ refreshToken }, // ✅ JSON
		);
	}
}
