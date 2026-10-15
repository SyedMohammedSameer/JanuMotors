import { vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../utils/settings';

// Pages and components read everything through useAppContext(). Tests replace that hook with a controlled context:
//   vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));
let current: any;

export const buildContext = (stateOverrides: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) => ({
    state: {
        loading: false,
        isAuthenticated: true,
        isConfigured: true,
        error: null,
        customers: [],
        vehicles: [],
        jobCards: [],
        invoices: [],
        inventory: [],
        workers: [],
        attendance: [],
        payrollRecords: [],
        carwashBookings: [],
        settings: DEFAULT_SETTINGS,
        settingsStatus: 'database',
        ...stateOverrides,
    },
    dispatch: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
    saveSettings: vi.fn().mockResolvedValue({ ok: true, status: 'database' }),
    ...extra,
});

export const setContext = (ctx: ReturnType<typeof buildContext>) => {
    current = ctx;
    return ctx;
};

export const useAppContextMock = () => current;
