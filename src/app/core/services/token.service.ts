import { Injectable } from '@angular/core';
import { TokenPayload } from '../models/auth.models';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

@Injectable({
	providedIn: 'root',
})
export class TokenService {
	private readonly ACCESS_KEY = 'access_token';
	private readonly REFRESH_KEY = 'refresh_token';

	// ── Persistencia ────────────────────────────────────────────────

	setTokens(accessToken: string, refreshToken: string): void {
		localStorage.setItem(this.ACCESS_KEY, accessToken);
		localStorage.setItem(this.REFRESH_KEY, refreshToken);
	}

	getAccessToken(): string | null {
		return localStorage.getItem(this.ACCESS_KEY);
	}

	getRefreshToken(): string | null {
		return localStorage.getItem(this.REFRESH_KEY);
	}

	clearTokens(): void {
		localStorage.removeItem(this.ACCESS_KEY);
		localStorage.removeItem(this.REFRESH_KEY);
		sessionStorage.removeItem('code_verifier');
	}

	// ── Decodificación ───────────────────────────────────────────────

	decodeToken(): TokenPayload | null {
		const token = this.getAccessToken();
		if (!token) return null;
		try {
			const base64Payload = token.split('.')[1];
			const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
			return JSON.parse(decoded) as TokenPayload;
		} catch {
			return null;
		}
	}

	// ── Helpers ──────────────────────────────────────────────────────

	isGoogleUser(): boolean {
		return this.decodeToken()?.isGoogleUser ?? false;
	}

	getDisplayName(): string {
		return this.decodeToken()?.name ?? this.getUsername();
	}

	getRoles(): string[] {
		return this.decodeToken()?.roles ?? [];
	}

	getUsername(): string {
		return this.decodeToken()?.username ?? '';
	}

	isFirstLogin(): boolean {
		return this.decodeToken()?.firstLogin ?? false;
	}

	hasRole(role: string): boolean {
		return this.getRoles().includes(role);
	}

	isTokenExpired(): boolean {
		const payload = this.decodeToken();
		if (!payload) return true;
		return Date.now() >= payload.exp * 1000;
	}

	isLoggedIn(): boolean {
		return !!this.getAccessToken() && !this.isTokenExpired();
	}
}
