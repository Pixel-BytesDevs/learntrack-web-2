import { Injectable } from '@angular/core';
import { IStorage } from '../storage';

@Injectable({ providedIn: 'root' })
export class SessionStorage implements IStorage {
	save<T>(key: string, value: T): void {
		const serialized = JSON.stringify(value);
		sessionStorage.setItem(key, serialized);
	}

	get<T>(key: string): T | undefined {
		const value = sessionStorage.getItem(key);
		return value ? JSON.parse(value) : undefined;
	}

	remove(key: string) {
		sessionStorage.removeItem(key);
	}

	clear(): void {
		sessionStorage.clear();
	}
}
