import { AsyncLocalStorage } from 'async_hooks';

type TStorage = AsyncLocalStorage<Map<string, unknown>>;

class AsyncStorage {
    private readonly asyncStorage: TStorage;

    constructor() {
        this.asyncStorage = new AsyncLocalStorage<Map<string, unknown>>();
    }

    public storage(): TStorage {
        return this.asyncStorage;
    }

    public get<T>(key: string): T {
        return this.asyncStorage.getStore()?.get(key) as T;
    }

    public set(key: string, value: unknown): void {
        this.asyncStorage.getStore()?.set(key, value);
    }

    public delete(key: string): void {
        this.asyncStorage.getStore()?.delete(key);
    }
}

const asyncStorage = new AsyncStorage()

export default asyncStorage;
