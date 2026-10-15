import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../pages/Settings';
import { buildContext, setContext } from './mockContext';
import { DEFAULT_SETTINGS } from '../utils/settings';

vi.mock('../context/AppContext', async () => ({ useAppContext: (await import('./mockContext')).useAppContextMock }));

const setupPage = (stateOverrides = {}, extra = {}) => {
    const ctx = setContext(buildContext(stateOverrides, extra));
    render(<Settings />);
    return { ctx, user: userEvent.setup() };
};

describe('Settings page', () => {
    it('only offers controls that do something: tax, labour rate and the alert switches', () => {
        setupPage();
        expect(screen.getByLabelText('Default Tax Rate (%)')).toHaveValue(18);
        expect(screen.getByLabelText('Labor Rate (₹/hour)')).toHaveValue(80);
        expect(screen.getAllByRole('checkbox')).toHaveLength(4);

        // The placeholder / fabricated sections are gone
        expect(screen.queryByText(/Auto Backup/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/2:00 AM/)).not.toBeInTheDocument();
        expect(screen.queryByText(/SSL Encryption/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Two-Factor/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Business Information/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Language|Timezone|Currency/i)).not.toBeInTheDocument();
    });

    it('saves the edited values through saveSettings and confirms it is shared', async () => {
        const { ctx, user } = setupPage();
        const tax = screen.getByLabelText('Default Tax Rate (%)');
        await user.clear(tax);
        await user.type(tax, '12.5');
        const labour = screen.getByLabelText('Labor Rate (₹/hour)');
        await user.clear(labour);
        await user.type(labour, '450');
        await user.click(screen.getByLabelText('Car wash alerts'));
        await user.click(screen.getByRole('button', { name: 'Save Settings' }));

        expect(ctx.saveSettings).toHaveBeenCalledWith({
            taxRate: 12.5,
            laborRate: 450,
            notifications: { ...DEFAULT_SETTINGS.notifications, carWashAlerts: false },
        });
        expect(await screen.findByText('✓ Settings saved for all computers')).toBeInTheDocument();
    });

    it('blocks saving an invalid tax rate and explains why', async () => {
        const { ctx, user } = setupPage();
        const tax = screen.getByLabelText('Default Tax Rate (%)');
        await user.clear(tax);
        await user.type(tax, '150');
        expect(screen.getByText('Enter a tax rate between 0 and 100')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
        expect(ctx.saveSettings).not.toHaveBeenCalled();

        await user.clear(tax);
        expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
    });

    it('tells the user when settings can only be saved on this computer', async () => {
        const { user } = setupPage(
            { settingsStatus: 'browser' },
            { saveSettings: vi.fn().mockResolvedValue({ ok: true, status: 'browser' }) }
        );
        expect(screen.getByText('Settings are saved on this computer only')).toBeInTheDocument();
        expect(screen.getByText('db/create_app_settings_table.sql')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Save Settings' }));
        expect(await screen.findByText(/Saved on this computer only/)).toBeInTheDocument();
    });

    it('shows the failure and does not claim success when saving fails', async () => {
        const { user } = setupPage({}, { saveSettings: vi.fn().mockResolvedValue({ ok: false, status: 'database', message: 'You do not have permission.' }) });
        await user.click(screen.getByRole('button', { name: 'Save Settings' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('You do not have permission.');
        expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
    });
});
