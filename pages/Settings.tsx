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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-.75-4.5h2.25a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 013 15.75v-6a2.25 2.25 0 012.25-2.25H8.25m6.75-1.5V3a2.25 2.25 0 00-2.25-2.25h-3A2.25 2.25 0 006.75 3v2.25" />
    </svg>
);

const Settings = () => {
    const [businessInfo, setBusinessInfo] = useState({
        name: 'JANU MOTORS',
        address: 'Opposite Sitara Gardens, Tilak Nagar, Kadapa',
        phone: '+91 98765 43210',
        email: 'contact@janumotor.com'
    });

    const [financialSettings, setFinancialSettings] = useState({
        taxRate: 5,
        laborRate: 80,
        currency: 'USD'
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        lowStockAlerts: true,
        invoiceReminders: true,
        dailyReports: false
    });

    const [preferences, setPreferences] = useState({
        theme: 'dark',
        language: 'en',
        timezone: 'UTC+5:30'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        // Show success message (could be implemented with toast)
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gradient flex items-center">
                    <Cog6ToothIcon className="h-8 w-8 mr-3 text-primary-500" />
                    System Settings
                </h1>
                <p className="text-white/60 mt-2">Configure your garage management system</p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Business Information */}
                <div className="card-luxury p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-gold rounded-xl">
                            <BuildingIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Business Information</h3>
                            <p className="text-white/60 text-sm">Your garage details and contact information</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Business Name</label>
                            <input 
                                type="text" 
                                value={businessInfo.name}
                                onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                                className="form-input w-full px-4 py-3"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Address</label>
                            <textarea 
                                value={businessInfo.address}
                                onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                                className="form-input w-full px-4 py-3 h-20 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                                <input 
                                    type="tel" 
                                    value={businessInfo.phone}
                                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                                    className="form-input w-full px-4 py-3"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    value={businessInfo.email}
                                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                                    className="form-input w-full px-4 py-3"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="card-luxury p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-gold rounded-xl">
                            <CurrencyDollarIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Financial Settings</h3>
                            <p className="text-white/60 text-sm">Default rates and currency preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Default Tax Rate (%)</label>
                            <input 
                                type="number" 
                                value={financialSettings.taxRate}
                                onChange={(e) => setFinancialSettings({...financialSettings, taxRate: Number(e.target.value)})}
                                className="form-input w-full px-4 py-3"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Labor Rate ($/hour)</label>
                            <input 
                                type="number" 
                                value={financialSettings.laborRate}
                                onChange={(e) => setFinancialSettings({...financialSettings, laborRate: Number(e.target.value)})}
                                className="form-input w-full px-4 py-3"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Currency</label>
                            <select 
                                value={financialSettings.currency}
                                onChange={(e) => setFinancialSettings({...financialSettings, currency: e.target.value})}
                                className="form-input w-full px-4 py-3"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card-luxury p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-gold rounded-xl">
                            <BellIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Notifications</h3>
                            <p className="text-white/60 text-sm">Configure alert preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div>
                                    <label className="text-sm font-medium text-white cursor-pointer">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </label>
                                    <p className="text-xs text-white/60 mt-1">
                                        {key === 'emailAlerts' && 'Receive email notifications for important events'}
                                        {key === 'lowStockAlerts' && 'Get notified when inventory runs low'}
                                        {key === 'invoiceReminders' && 'Automatic payment reminders'}
                                        {key === 'dailyReports' && 'Daily business summary reports'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-dark-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-gold"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Preferences */}
                <div className="card-luxury p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-gold rounded-xl">
                            <Cog6ToothIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">System Preferences</h3>
                            <p className="text-white/60 text-sm">Theme, language, and regional settings</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Theme</label>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <MoonIcon className="w-5 h-5 text-primary-500" />
                                <span className="flex-1 text-white">Dark Mode</span>
                                <span className="text-primary-500 text-sm font-medium">Active</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                            <select 
                                value={preferences.language}
                                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                                className="form-input w-full px-4 py-3"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Timezone</label>
                            <select 
                                value={preferences.timezone}
                                onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                                className="form-input w-full px-4 py-3"
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

            {/* Security Section */}
            <div className="card-luxury p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-gold rounded-xl">
                        <ShieldCheckIcon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Security & Backup</h3>
                        <p className="text-white/60 text-sm">Data protection and backup settings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <h4 className="font-semibold text-white mb-1">SSL Encryption</h4>
                        <p className="text-xs text-green-400">Active</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <div className="w-6 h-6 bg-primary-500 rounded-full animate-pulse"></div>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Auto Backup</h4>
                        <p className="text-xs text-primary-400">Daily at 2:00 AM</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <div className="text-blue-400 text-xl font-bold">2FA</div>
                        </div>
                        <h4 className="font-semibold text-white mb-1">Two-Factor Auth</h4>
                        <p className="text-xs text-blue-400">Recommended</p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-luxury px-8 py-3 rounded-xl flex items-center space-x-2 disabled:opacity-50"
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