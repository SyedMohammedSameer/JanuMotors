import React from 'react';

const Settings = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 mb-4">Business Information</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                            <input type="text" defaultValue="JANU MOTORS" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input type="text" defaultValue="Opposite Sitara Gardens, Tilak Nagar, Kadapa" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 mb-4">Financial Settings</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Tax Rate (%)</label>
                            <input type="number" defaultValue="5" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    </form>
                </div>
                <div className="flex justify-end">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;