export interface IStorage {
	save<T>(key: string, data: T): void;
	get<T>(key: string): T | undefined;
	remove(key: string): void;
	clear(): void;
}
