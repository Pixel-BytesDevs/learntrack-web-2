import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class PkceService {
	// Genera un code_verifier aleatorio y lo guarda en sessionStorage
	generateCodeVerifier(): string {
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		const verifier = this.base64UrlEncode(array);
		sessionStorage.setItem('code_verifier', verifier);
		return verifier;
	}

	getCodeVerifier(): string {
		return sessionStorage.getItem('code_verifier') ?? '';
	}

	async generateCodeChallenge(verifier: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(verifier);
		const digest = await crypto.subtle.digest('SHA-256', data);
		return this.base64UrlEncode(new Uint8Array(digest));
	}

	private base64UrlEncode(array: Uint8Array): string {
		return btoa(String.fromCharCode(...array))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}
}
