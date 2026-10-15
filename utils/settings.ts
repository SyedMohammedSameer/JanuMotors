// Application settings that are shared by every computer (stored in the `app_settings` table).
// Pure helpers only: reading/writing the table lives in context/AppContext.tsx.

export interface NotificationPrefs {
    lowStockAlerts: boolean;
    invoiceReminders: boolean; // overdue invoices
    jobAlerts: boolean;        // unassigned pending jobs
    carWashAlerts: boolean;    // today's scheduled washes
}

export interface AppSettings {
    taxRate: number;   // percent, 0-100
    laborRate: number; // rupees per hour
    notifications: NotificationPrefs;
}

/** Row shape of public.app_settings (see db/create_app_settings_table.sql). */
export interface AppSettingsRow {
    id: string;
    tax_rate: number;
    labor_rate: number;
    notifications: Partial<NotificationPrefs>;
    updated_at?: string;
}

/**
 * Where the settings in use come from:
 *  - 'database': the shared row exists, so every computer sees the same values
 *  - 'unsaved':  the table exists but nobody has saved yet; this browser's values (or the defaults) are in use
 *  - 'browser':  the table does not exist yet; values live in this browser only
 */
export type SettingsStatus = 'database' | 'unsaved' | 'browser';

export const SETTINGS_ROW_ID = 'default';
export const MAX_TAX_RATE = 100;

export const DEFAULT_SETTINGS: AppSettings = {
    taxRate: 18,
    laborRate: 80,
    notifications: {
        lowStockAlerts: true,
        invoiceReminders: true,
        jobAlerts: true,
        carWashAlerts: true,
    },
};

const toNumber = (value: unknown, fallback: number): number => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Merges anything we read (database row, old localStorage data, a form) onto the defaults and clamps it to valid values. */
export const normalizeSettings = (raw: unknown): AppSettings => {
    const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const notif = (input.notifications && typeof input.notifications === 'object' ? input.notifications : {}) as Record<string, unknown>;
    const flag = (key: keyof NotificationPrefs) =>
        typeof notif[key] === 'boolean' ? (notif[key] as boolean) : DEFAULT_SETTINGS.notifications[key];

    return {
        taxRate: Math.min(Math.max(round2(toNumber(input.taxRate, DEFAULT_SETTINGS.taxRate)), 0), MAX_TAX_RATE),
        laborRate: Math.max(round2(toNumber(input.laborRate, DEFAULT_SETTINGS.laborRate)), 0),
        notifications: {
            lowStockAlerts: flag('lowStockAlerts'),
            invoiceReminders: flag('invoiceReminders'),
            jobAlerts: flag('jobAlerts'),
            carWashAlerts: flag('carWashAlerts'),
        },
    };
};

export const settingsFromRow = (row: Partial<AppSettingsRow>): AppSettings =>
    normalizeSettings({ taxRate: row.tax_rate, laborRate: row.labor_rate, notifications: row.notifications });

export const settingsToRow = (settings: AppSettings): AppSettingsRow => ({
    id: SETTINGS_ROW_ID,
    tax_rate: settings.taxRate,
    labor_rate: settings.laborRate,
    notifications: settings.notifications,
    updated_at: new Date().toISOString(),
});

// ---- Per-browser copy -------------------------------------------------------------------------------------------
// Older versions saved the Settings page to localStorage only. Those keys are still read (so nothing changes for a
// garage that has not created the database table yet) and are the source of the values shown until the first save.

const LEGACY_FINANCIAL_KEY = 'settings_financialSettings';
const LEGACY_NOTIFICATIONS_KEY = 'settings_notifications';

const readJson = (storage: Pick<Storage, 'getItem'>, key: string): Record<string, unknown> | null => {
    try {
        const raw = storage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
};

/** Settings previously saved in this browser, or null when there are none. */
export const readBrowserSettings = (storage: Pick<Storage, 'getItem'> = window.localStorage): AppSettings | null => {
    const financial = readJson(storage, LEGACY_FINANCIAL_KEY);
    const notifications = readJson(storage, LEGACY_NOTIFICATIONS_KEY);
    if (!financial && !notifications) return null;
    return normalizeSettings({
        taxRate: financial?.taxRate,
        laborRate: financial?.laborRate,
        notifications: {
            lowStockAlerts: notifications?.lowStockAlerts,
            invoiceReminders: notifications?.invoiceReminders,
        },
    });
};

export const writeBrowserSettings = (settings: AppSettings, storage: Pick<Storage, 'setItem' | 'getItem'> = window.localStorage) => {
    try {
        const financial = readJson(storage, LEGACY_FINANCIAL_KEY) ?? {};
        storage.setItem(LEGACY_FINANCIAL_KEY, JSON.stringify({ ...financial, taxRate: settings.taxRate, laborRate: settings.laborRate }));
        storage.setItem(LEGACY_NOTIFICATIONS_KEY, JSON.stringify(settings.notifications));
    } catch {
        // Storage can be unavailable (private mode); the settings then last for this session only.
    }
};

/** True when a Supabase/PostgREST error means "this table does not exist (yet)". */
export const isMissingTableError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    const { code, message } = error as { code?: unknown; message?: unknown };
    if (code === '42P01' || code === 'PGRST205') return true;
    return typeof message === 'string' && /could not find the table|schema cache|relation .* does not exist/i.test(message);
};
