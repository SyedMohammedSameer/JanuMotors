import React, { useState } from 'react';
import { Cog6ToothIcon } from '../components/Icons';

// Theme Toggle Icon
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

// Building Icon
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
);

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

// Security Icon
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

// Clock Icon
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const load = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved) as T;
    } catch {}
    return fallback;
};

const Settings = () => {
    const [businessInfo, setBusinessInfo] = useState(() => load('settings_businessInfo', {
        name: 'JANU MOTORS',
        address: 'Opposite Sitara Gardens, Tilak Nagar, Kadapa',
        phone: '+91 98765 43210',
        email: 'contact@janumotor.com'
    }));

    const [financialSettings, setFinancialSettings] = useState(() => load('settings_financialSettings', {
        taxRate: 18,
        laborRate: 80,
        currency: 'INR'
    }));

    const [notifications, setNotifications] = useState(() => load('settings_notifications', {
        emailAlerts: true,
        lowStockAlerts: true,
        invoiceReminders: true,
        dailyReports: false
    }));

    const [preferences, setPreferences] = useState(() => load('settings_preferences', {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC+5:30'
    }));

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        localStorage.setItem('settings_businessInfo', JSON.stringify(businessInfo));
        localStorage.setItem('settings_financialSettings', JSON.stringify(financialSettings));
        localStorage.setItem('settings_notifications', JSON.stringify(notifications));
        localStorage.setItem('settings_preferences', JSON.stringify(preferences));
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">System Settings</h1>
                <p className="text-sm text-white/60 mt-1">Configure your garage management system</p>
            </div>

            {/* Settings Grid: two independent columns on wide screens so cards keep their natural height */}
            <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6 min-w-0">
                    {/* Business Information */}
                    <div className="card-luxury p-4 sm:p-6">
                        <SectionHeader
                            icon={<BuildingIcon className="h-5 w-5 text-black" />}
                            title="Business Information"
                            description="Your garage details and contact information"
                        />

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="settings-business-name" className={labelClass}>Business Name</label>
                                <input
                                    id="settings-business-name"
                                    type="text"
                                    value={businessInfo.name}
                                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="settings-business-address" className={labelClass}>Address</label>
                                <textarea
                                    id="settings-business-address"
                                    value={businessInfo.address}
                                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                                    className={`${inputClass} min-h-[5rem] resize-y`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                                <div className="min-w-0">
                                    <label htmlFor="settings-business-phone" className={labelClass}>Phone</label>
                                    <input
                                        id="settings-business-phone"
                                        type="tel"
                                        value={businessInfo.phone}
                                        onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label htmlFor="settings-business-email" className={labelClass}>Email</label>
                                    <input
                                        id="settings-business-email"
                                        type="email"
                                        value={businessInfo.email}
                                        onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings */}
                    <div className="card-luxury p-4 sm:p-6">
                        <SectionHeader
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-black" />}
                            title="Financial Settings"
                            description="Default rates and currency preferences"
                        />

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                                <div className="min-w-0">
                                    <label htmlFor="settings-tax-rate" className={labelClass}>Default Tax Rate (%)</label>
                                    <input
                                        id="settings-tax-rate"
                                        type="number"
                                        value={financialSettings.taxRate}
                                        onChange={(e) => setFinancialSettings({...financialSettings, taxRate: Number(e.target.value)})}
                                        className={inputClass}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label htmlFor="settings-labor-rate" className={labelClass}>Labor Rate (₹/hour)</label>
                                    <input
                                        id="settings-labor-rate"
                                        type="number"
                                        value={financialSettings.laborRate}
                                        onChange={(e) => setFinancialSettings({...financialSettings, laborRate: Number(e.target.value)})}
                                        className={inputClass}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="settings-currency" className={labelClass}>Currency</label>
                                <select
                                    id="settings-currency"
                                    value={financialSettings.currency}
                                    onChange={(e) => setFinancialSettings({...financialSettings, currency: e.target.value})}
                                    className={inputClass}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6 min-w-0">
                    {/* Notification Settings */}
                    <div className="card-luxury p-4 sm:p-6">
                        <SectionHeader
                            icon={<BellIcon className="h-5 w-5 text-black" />}
                            title="Notifications"
                            description="Configure alert preferences"
                        />

                        <div className="space-y-3">
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <div className="min-w-0">
                                        <label htmlFor={`settings-notif-${key}`} className="text-sm font-medium text-white cursor-pointer">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </label>
                                        <p className="text-xs text-white/60 mt-1">
                                            {key === 'emailAlerts' && 'Receive email notifications for important events'}
                                            {key === 'lowStockAlerts' && 'Get notified when inventory runs low'}
                                            {key === 'invoiceReminders' && 'Automatic payment reminders'}
                                            {key === 'dailyReports' && 'Daily business summary reports'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                        <input
                                            id={`settings-notif-${key}`}
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-dark-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-gold"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Preferences */}
                    <div className="card-luxury p-4 sm:p-6">
                        <SectionHeader
                            icon={<Cog6ToothIcon className="h-5 w-5 text-black" />}
                            title="System Preferences"
                            description="Theme, language, and regional settings"
                        />

                        <div className="space-y-4">
                            <div>
                                <span className={labelClass}>Theme</span>
                                <div className="flex items-center gap-3 px-4 py-2.5 min-h-[44px] rounded-lg bg-dark-50/30 border border-primary-500/10">
                                    <MoonIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                    <span className="flex-1 min-w-0 text-white">Dark Mode</span>
                                    <span className="text-primary-500 text-sm font-medium flex-shrink-0">Active</span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="settings-language" className={labelClass}>Language</label>
                                <select
                                    id="settings-language"
                                    value={preferences.language}
                                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                                    className={inputClass}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="settings-timezone" className={labelClass}>Timezone</label>
                                <select
                                    id="settings-timezone"
                                    value={preferences.timezone}
                                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                                    className={inputClass}
                                >
                                    <option value="UTC+5:30">IST (UTC+5:30)</option>
                                    <option value="UTC-5">EST (UTC-5)</option>
                                    <option value="UTC+0">GMT (UTC+0)</option>
                                    <option value="UTC+1">CET (UTC+1)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="card-luxury p-4 sm:p-6">
                <SectionHeader
                    icon={<ShieldCheckIcon className="h-5 w-5 text-black" />}
                    title="Security & Backup"
                    description="Data protection and backup settings"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white">SSL Encryption</h3>
                            <p className="text-xs text-green-400">Active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <ClockIcon className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white">Auto Backup</h3>
                            <p className="text-xs text-primary-400">Daily at 2:00 AM</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-xs font-bold">2FA</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white">Two-Factor Auth</h3>
                            <p className="text-xs text-blue-400">Recommended</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
                {saveSuccess && (
                    <p role="status" className="text-sm text-green-400 font-medium text-center sm:text-right">✓ Settings saved successfully</p>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-luxury w-full sm:w-auto sm:min-w-[11rem] px-8 py-2.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
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
