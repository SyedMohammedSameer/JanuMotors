import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Recent Node versions ship an experimental global `localStorage` that is unusable without extra flags and shadows
// jsdom's. Install a small in-memory Storage so every test (and the app code under test) gets a working one.
class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() { return this.store.size; }
    clear() { this.store.clear(); }
    getItem(key: string) { return this.store.has(key) ? (this.store.get(key) as string) : null; }
    key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
    removeItem(key: string) { this.store.delete(key); }
    setItem(key: string, value: string) { this.store.set(key, String(value)); }
}
const storage = new MemoryStorage();
Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });

afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.useRealTimers();
});

// React Router prints v7 migration notices on every render; they are noise in test output.
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) return;
    originalWarn(...args);
};
