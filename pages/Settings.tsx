import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { NotificationPrefs, MAX_TAX_RATE } from '../utils/settings';

// Dollar Icon
const CurrencyDollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Notification Icon
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const labelClass = 'block text-sm font-medium text-white/80 mb-1.5';
const inputClass = 'form-input w-full px-4 py-2.5';

// Card header shared by every settings section
const SectionHeader = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 bg-gradient-gold rounded-xl flex-shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
            <p className="text-xs sm:text-sm text-white/60">{description}</p>
        </div>
    </div>
);

// Every toggle here changes what the notification bell shows, so nothing on this page is a placeholder.
const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    { key: 'lowStockAlerts', label: 'Low stock alerts', description: 'Show items that are out of stock or below their reorder level' },
    { key: 'invoiceReminders', label: 'Overdue invoice alerts', description: 'Show unpaid or part-paid invoices that are past their due date' },
    { key: 'jobAlerts', label: 'Unassigned job alerts', description: 'Show pending job cards that have no mechanic assigned' },
    { key: 'carWashAlerts', label: 'Car wash alerts', description: "Show today's scheduled car wash bookings" },
];

const Settings = () => {
    const { state, saveSettings } = useAppContext();

    // Inputs are kept as text so a field can be emptied while typing; they are validated on save.
    const [taxRate, setTaxRate] = useState(String(state.settings.taxRate));
    const [laborRate, setLaborRate] = useState(String(state.settings.laborRate));
    const [notifications, setNotifications] = useState<NotificationPrefs>(state.settings.notifications);

    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

    const taxNumber = Number(taxRate);
    const laborNumber = Number(laborRate);
    const taxError = taxRate.trim() === '' || !Number.isFinite(taxNumber) || taxNumber < 0 || taxNumber > MAX_TAX_RATE
        ? `Enter a tax rate between 0 and ${MAX_TAX_RATE}`
        : '';
    const laborError = laborRate.trim() === '' || !Number.isFinite(laborNumber) || laborNumber < 0
        ? 'Enter a labour rate of 0 or more'
        : '';

    const handleSave = async () => {
        if (taxError || laborError) return;
        setIsSaving(true);
        setResult(null);
        const outcome = await saveSettings({ taxRate: taxNumber, laborRate: laborNumber, notifications });
        setIsSaving(false);
        if (!outcome.ok) {
            setResult({ ok: false, message: outcome.message ?? 'Could not save settings. Please try again.' });
            return;
        }
        setResult({
            ok: true,
            message: outcome.status === 'database'
                ? '✓ Settings saved for all computers'
                : '✓ Saved on this computer only (shared settings are not set up yet)',
        });
        window.setTimeout(() => setResult(null), 4000);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">System Settings</h1>
                <p className="text-sm text-white/60 mt-1">Rates used for new invoices and the alerts shown in the notification bell</p>
            </div>

            {/* Where these settings live */}
            {state.settingsStatus === 'browser' && (
                <div role="status" className="rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm text-primary-300">
                    <p className="font-semibold text-primary-400">Settings are saved on this computer only</p>
                    <p className="mt-1 text-white/70">
                        To share them across computers, run <span className="font-mono text-white/90">db/create_app_settings_table.sql</span> once
                        in your Supabase SQL Editor, then reload and press Save.
                    </p>
                </div>
            )}
            {state.settingsStatus === 'unsaved' && (
                <div role="status" className="rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm text-white/70">
                    <p className="font-semibold text-primary-400">Not shared yet</p>
                    <p className="mt-1">These values come from this computer. Press Save once to use them on every computer.</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-4 sm:gap-6">
                {/* Financial Settings */}
                <div className="card-luxury p-4 sm:p-6">
                    <SectionHeader
                        icon={<CurrencyDollarIcon className="h-5 w-5 text-black" />}
                        title="Financial Settings"
                        description="Applied when an invoice is created from a job card"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                        <div className="min-w-0">
                            <label htmlFor="settings-tax-rate" className={labelClass}>Default Tax Rate (%)</label>
                            <input
                                id="settings-tax-rate"
                                type="number"
                                inputMode="decimal"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                className={inputClass}
                                min="0"
                                max={MAX_TAX_RATE}
                                step="0.1"
                                aria-invalid={Boolean(taxError)}
                            />
                            {taxError && <p className="mt-1.5 text-xs text-red-400">{taxError}</p>}
                        </div>

                        <div className="min-w-0">
                            <label htmlFor="settings-labor-rate" className={labelClass}>Labor Rate (₹/hour)</label>
                            <input
                                id="settings-labor-rate"
                                type="number"
                                inputMode="decimal"
                                value={laborRate}
                                onChange={(e) => setLaborRate(e.target.value)}
                                className={inputClass}
                                min="0"
                                step="0.01"
                                aria-invalid={Boolean(laborError)}
                            />
                            {laborError && <p className="mt-1.5 text-xs text-red-400">{laborError}</p>}
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card-luxury p-4 sm:p-6">
                    <SectionHeader
                        icon={<BellIcon className="h-5 w-5 text-black" />}
                        title="Notifications"
                        description="Choose which alerts appear in the notification bell"
                    />

                    <div className="space-y-3">
                        {NOTIFICATION_OPTIONS.map(({ key, label, description }) => (
                            <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="min-w-0">
                                    <label htmlFor={`settings-notif-${key}`} className="text-sm font-medium text-white cursor-pointer">
                                        {label}
                                    </label>
                                    <p className="text-xs text-white/60 mt-1">{description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                        id={`settings-notif-${key}`}
                                        type="checkbox"
                                        checked={notifications[key]}
                                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-dark-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-gold"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
                {result && (
                    <p
                        role={result.ok ? 'status' : 'alert'}
                        className={`text-sm font-medium text-center sm:text-right ${result.ok ? 'text-green-400' : 'text-red-400'}`}
                    >
                        {result.message}
                    </p>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving || Boolean(taxError || laborError)}
                    className="btn-luxury w-full sm:w-auto sm:min-w-[11rem] px-8 py-2.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                            <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                            <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                            <span className="ml-2">Saving...</span>
                        </>
                    ) : (
                        <span>Save Settings</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Settings;
