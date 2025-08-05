import React from 'react';
import { createHashRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import JobCards from './pages/JobCards';
import JobCardDetail from './pages/JobCardDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Inventory from './pages/Inventory';
import Workers from './pages/Workers';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAppContext } from './context/AppContext';
import Payroll from './pages/Payroll';
import { WrenchScrewdriverIcon, Cog6ToothIcon } from './components/Icons';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
        <WrenchScrewdriverIcon className="h-16 w-16 text-primary-600 animate-spin" />
        <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Loading Garage Data...</p>
    </div>
);

const ConfigurationNeededScreen = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
        <div className="w-full max-w-3xl p-8 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg text-center">
             <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-4">
                    <Cog6ToothIcon className="h-16 w-16 text-red-500 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Configuration Required</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                    Your application needs to be connected to a Supabase database.
                </p>
            </div>
            <div className="text-left bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Follow these steps:</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                    <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">supabase.com</a> and create a new project.</li>
                    <li>In your Supabase project, go to **Project Settings {'>'} API** and find your **Project URL** and **`anon` key**.</li>
                    <li>Open the file `config.ts` in your project code.</li>
                    <li>
                        Paste your credentials into `config.ts`:
                        <pre className="bg-gray-200 dark:bg-gray-700 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                            <code>
                                {`export const supabaseUrl = 'YOUR_SUPABASE_URL';\nexport const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';`}
                            </code>
                        </pre>
                    </li>
                    <li>Go to the **SQL Editor** in your Supabase dashboard, paste the schema from the `README.md` file, and click **RUN**.</li>
                     <li>Once configured, **refresh this page**.</li>
                </ol>
            </div>
        </div>
    </div>
);

const AppLayout = () => {
  const { state } = useAppContext();
  
  if (!state.isConfigured) {
    return <ConfigurationNeededScreen />;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = () => {
  const { state } = useAppContext();
  
  if (!state.isConfigured) {
    return <AppLayout />; // Will show the config screen
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Dashboard />, handle: { crumb: 'Dashboard' } },
      { path: "customers", handle: { crumb: 'Customers' },
        children: [
          { index: true, element: <Customers /> },
          { path: ":customerId", element: <CustomerDetail />, handle: { crumb: 'Customer Details' } },
        ]
      },
      { path: "job-cards", handle: { crumb: 'Job Cards' },
        children: [
          { index: true, element: <JobCards /> },
          { path: ":jobCardId", element: <JobCardDetail />, handle: { crumb: 'Job Details' } },
        ]
      },
      { path: "invoices", handle: { crumb: 'Invoices' },
        children: [
          { index: true, element: <Invoices /> },
          { path: ":invoiceId", element: <InvoiceDetail />, handle: { crumb: 'Invoice Details' } },
        ]
      },
      { path: "inventory", element: <Inventory />, handle: { crumb: 'Inventory' } },
      { path: "workers", element: <Workers />, handle: { crumb: 'Workers' } },
      { path: "payroll", element: <Payroll />, handle: { crumb: 'Payroll' } },
      { path: "settings", element: <Settings />, handle: { crumb: 'Settings' } },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;