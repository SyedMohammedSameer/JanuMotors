import { describe, expect, it } from 'vitest';
import {
    DEFAULT_SETTINGS, SETTINGS_ROW_ID, isMissingTableError, normalizeSettings, readBrowserSettings, settingsFromRow,
    settingsToRow, writeBrowserSettings,
} from '../utils/settings';

const memoryStorage = (initial: Record<string, string> = {}) => {
    const data = { ...initial };
    return {
        getItem: (key: string) => (key in data ? data[key] : null),
        setItem: (key: string, value: string) => { data[key] = value; },
        data,
    };
};

describe('normalizeSettings', () => {
    it('falls back to the defaults for missing or junk input', () => {
        expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
        expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
        expect(normalizeSettings('nope')).toEqual(DEFAULT_SETTINGS);
        expect(normalizeSettings({ taxRate: 'abc', laborRate: '' })).toEqual(DEFAULT_SETTINGS);
    });

    it('accepts numeric strings (database numerics can arrive as strings)', () => {
        const s = normalizeSettings({ taxRate: '12.5', laborRate: '450' });
        expect(s.taxRate).toBe(12.5);
        expect(s.laborRate).toBe(450);
    });

    it('clamps the tax rate to 0-100 and the labour rate to 0 or more', () => {
        expect(normalizeSettings({ taxRate: 150 }).taxRate).toBe(100);
        expect(normalizeSettings({ taxRate: -5 }).taxRate).toBe(0);
        expect(normalizeSettings({ laborRate: -20 }).laborRate).toBe(0);
    });

    it('keeps boolean notification flags and defaults the rest', () => {
        const s = normalizeSettings({ notifications: { lowStockAlerts: false, jobAlerts: 'yes' } });
        expect(s.notifications.lowStockAlerts).toBe(false);
        expect(s.notifications.jobAlerts).toBe(true); // not a boolean -> default
        expect(s.notifications.carWashAlerts).toBe(true);
    });
});

describe('database row mapping', () => {
    it('round-trips through the row shape', () => {
        const settings = normalizeSettings({ taxRate: 5, laborRate: 300, notifications: { carWashAlerts: false } });
        const row = settingsToRow(settings);
        expect(row.id).toBe(SETTINGS_ROW_ID);
        expect(row.tax_rate).toBe(5);
        expect(row.labor_rate).toBe(300);
        expect(settingsFromRow(row)).toEqual(settings);
    });
});

describe('browser (legacy localStorage) settings', () => {
    it('returns null when nothing was saved', () => {
        expect(readBrowserSettings(memoryStorage())).toBeNull();
    });

    it('reads the keys written by older versions of the Settings page', () => {
        const storage = memoryStorage({
            settings_financialSettings: JSON.stringify({ taxRate: 12, laborRate: 500, currency: 'INR' }),
            settings_notifications: JSON.stringify({ emailAlerts: true, lowStockAlerts: false, invoiceReminders: true, dailyReports: false }),
        });
        const s = readBrowserSettings(storage)!;
        expect(s.taxRate).toBe(12);
        expect(s.laborRate).toBe(500);
        expect(s.notifications.lowStockAlerts).toBe(false);
        expect(s.notifications.jobAlerts).toBe(true);
    });

    it('survives corrupt JSON', () => {
        expect(readBrowserSettings(memoryStorage({ settings_financialSettings: '{not json' }))).toBeNull();
    });

    it('writes back in a format the old keys and the reader both understand', () => {
        const storage = memoryStorage({ settings_financialSettings: JSON.stringify({ currency: 'INR' }) });
        writeBrowserSettings(normalizeSettings({ taxRate: 9, laborRate: 120 }), storage);
        expect(JSON.parse(storage.data.settings_financialSettings)).toMatchObject({ taxRate: 9, laborRate: 120, currency: 'INR' });
        expect(readBrowserSettings(storage)!.laborRate).toBe(120);
    });
});

describe('isMissingTableError', () => {
    it('recognises Postgres and PostgREST codes', () => {
        expect(isMissingTableError({ code: '42P01', message: 'x' })).toBe(true);
        expect(isMissingTableError({ code: 'PGRST205', message: 'x' })).toBe(true);
    });

    it('recognises the message wording', () => {
        expect(isMissingTableError({ message: "Could not find the table 'public.app_settings' in the schema cache" })).toBe(true);
        expect(isMissingTableError({ message: 'relation "public.app_settings" does not exist' })).toBe(true);
    });

    it('does not treat permission or network errors as a missing table', () => {
        expect(isMissingTableError({ code: '42501', message: 'permission denied for table app_settings' })).toBe(false);
        expect(isMissingTableError({ message: 'Failed to fetch' })).toBe(false);
        expect(isMissingTableError(null)).toBe(false);
        expect(isMissingTableError('boom')).toBe(false);
    });
});
