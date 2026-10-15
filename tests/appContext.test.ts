import { describe, expect, it } from 'vitest';
import { appReducer, resolveSettings } from '../context/AppContext';
import { DEFAULT_SETTINGS } from '../utils/settings';

const baseState = () => ({
    loading: true, isAuthenticated: true, isConfigured: true, error: null as string | null,
    customers: [], vehicles: [], jobCards: [], invoices: [], inventory: [], workers: [], attendance: [], payrollRecords: [],
    carwashBookings: [], settings: DEFAULT_SETTINGS, settingsStatus: 'browser' as const,
});

describe('appReducer: loading flag', () => {
    it('clearing an error does NOT end an in-progress load (refresh on a detail page depends on this)', () => {
        const next = appReducer(baseState(), { type: 'SET_ERROR', payload: null });
        expect(next.loading).toBe(true);
        expect(next.error).toBeNull();
    });

    it('reporting an error still ends the load', () => {
        const next = appReducer(baseState(), { type: 'SET_ERROR', payload: 'Network error' });
        expect(next.loading).toBe(false);
        expect(next.error).toBe('Network error');
    });

    it('finishing the initial data load ends it', () => {
        const next = appReducer(baseState(), {
            type: 'SET_INITIAL_DATA',
            payload: { ...baseState(), customers: [{ id: 'c1' } as any] },
        });
        expect(next.loading).toBe(false);
        expect(next.customers).toHaveLength(1);
    });
});

describe('appReducer: settings', () => {
    it('stores settings together with where they came from', () => {
        const settings = { ...DEFAULT_SETTINGS, taxRate: 5 };
        const next = appReducer(baseState(), { type: 'SET_SETTINGS', payload: settings, status: 'database' });
        expect(next.settings.taxRate).toBe(5);
        expect(next.settingsStatus).toBe('database');
    });
});

describe('resolveSettings', () => {
    it('uses the shared database row when it exists', () => {
        const { settings, settingsStatus } = resolveSettings(null, [{ id: 'default', tax_rate: 12, labor_rate: 400, notifications: {} }]);
        expect(settingsStatus).toBe('database');
        expect(settings.taxRate).toBe(12);
        expect(settings.laborRate).toBe(400);
    });

    it('keeps this browser\'s values when the table exists but nobody has saved yet (so running the SQL changes nothing)', () => {
        window.localStorage.setItem('settings_financialSettings', JSON.stringify({ taxRate: 5, laborRate: 600 }));
        const { settings, settingsStatus } = resolveSettings(null, []);
        expect(settingsStatus).toBe('unsaved');
        expect(settings.taxRate).toBe(5);
        expect(settings.laborRate).toBe(600);
    });

    it('falls back to the browser (and defaults) when the table is missing', () => {
        const withDefaults = resolveSettings({ code: 'PGRST205' }, null);
        expect(withDefaults.settingsStatus).toBe('browser');
        expect(withDefaults.settings).toEqual(DEFAULT_SETTINGS);

        window.localStorage.setItem('settings_financialSettings', JSON.stringify({ taxRate: 7, laborRate: 90 }));
        expect(resolveSettings({ code: 'PGRST205' }, null).settings.taxRate).toBe(7);
    });
});
