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
import CarWashScheduling from './pages/CarWashScheduling';
import { useAppContext } from './context/AppContext';
import Payroll from './pages/Payroll';
import { WrenchScrewdriverIcon, Cog6ToothIcon, XMarkIcon } from './components/Icons';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-luxury">
        <div className="relative mb-8">
            {/* Animated Background */}
            <div className="absolute inset-0 animate-pulse">
                <div className="w-32 h-32 bg-gradient-gold rounded-full opacity-20 animate-ping"></div>
            </div>
            
            {/* Main Icon */}
            <div className="relative z-10 p-8 rounded-full glass-gold border border-primary-500/30">
                <WrenchScrewdriverIcon className="h-16 w-16 text-primary-500 animate-float icon-glow" />
            </div>
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gradient">JANU MOTORS</h2>
            <p className="text-lg text-white/80 font-medium">Loading Garage Data...</p>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 bg-primary-500 rounded-full loading-dot"
                        style={{ animationDelay: `${i * 0.16}s` }}
                    ></div>
                ))}
            </div>
        </div>
        
        {/* Ambient Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary-500/30 rounded-full animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }}
                ></div>
            ))}
        </div>
    </div>
);

const ConfigurationNeededScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-luxury p-4">
        <div className="w-full max-w-4xl">
            <div className="card-luxury p-8 text-center space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="p-6 rounded-full glass-gold border border-primary-500/30">
                                <Cog6ToothIcon className="h-16 w-16 text-primary-500 animate-pulse-gold" />
                            </div>
                            <div className="absolute inset-0 w-28 h-28 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gradient">Configuration Required</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Your premium garage management system needs to be connected to a Supabase database.
                    </p>
                </div>

                {/* Instructions */}
                <div className="text-left glass rounded-2xl p-8 border border-primary-500/20 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-2 h-8 bg-gradient-gold rounded-full mr-4"></div>
                        Setup Instructions
                    </h2>
                    
                    <div className="space-y-6">
                        {[
                            {
                                step: 1,
                                title: "Create Supabase Project",
                                description: "Go to supabase.com and create a new project."
                            },
                            {
                                step: 2,
                                title: "Get Credentials",
                                description: "In your Supabase project, go to Project Settings > API and find your Project URL and anon key."
                            },
                            {
                                step: 3,
                                title: "Configure Application",
                                description: "Open the file config.ts in your project code and paste your credentials."
                            },
                            {
                                step: 4,
                                title: "Setup Database",
                                description: "Go to the SQL Editor in your Supabase dashboard, paste the schema from README.md, and click RUN."
                            },
                            {
                                step: 5,
                                title: "Refresh",
                                description: "Once configured, refresh this page to access your garage management system."
                            }
                        ].map((item) => (
                            <div key={item.step} className="flex items-start space-x-4 p-4 rounded-xl bg-dark-50/30 border border-primary-500/10">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-gold text-black font-bold rounded-full flex items-center justify-center text-sm">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                    <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Code Example */}
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold text-white mb-3">config.ts example:</h4>
                        <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-primary-500/20">
                            <div className="text-primary-400">export const</div>
                            <div className="text-white ml-4">supabaseUrl = <span className="text-green-400">'YOUR_SUPABASE_URL'</span>;</div>
                            <div className="text-primary-400">export const</div>
                            <div className="text-white ml-4">supabaseAnonKey = <span className="text-green-400">'YOUR_SUPABASE_ANON_KEY'</span>;</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent/10 border border-primary-500/20">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    <p className="text-white/80">Ready to experience premium garage management</p>
                </div>
            </div>
        </div>
    </div>
);

const ErrorBanner = () => {
    const { state, clearError } = useAppContext();
    
    if (!state.error) return null;

    return (
        <div className="mx-6 mb-6 card-luxury border-l-4 border-accent p-4 animate-slide-up">
            <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                            <svg className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-1">System Error</h4>
                        <p className="text-sm text-white/80 leading-relaxed">{state.error}</p>
                    </div>
                </div>
                <button
                    onClick={clearError}
                    className="flex-shrink-0 ml-4 p-2 text-accent/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-300"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const AppLayout = () => {
  const { state } = useAppContext();
  
  if (!state.isConfigured) {
    return <ConfigurationNeededScreen />;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-luxury">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 xl:pl-80">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="page-transition">
            <ErrorBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = () => {
  const { state } = useAppContext();
  
  if (!state.isConfigured) {
    return <AppLayout />;
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
      { path: "car-wash", element: <CarWashScheduling />, handle: { crumb: 'Car Wash Scheduling' } },
      { path: "settings", element: <Settings />, handle: { crumb: 'Settings' } },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;