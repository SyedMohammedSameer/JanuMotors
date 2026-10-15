import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon,
    CircleStackIcon, UserGroupIcon, Cog6ToothIcon, BanknotesIcon, XMarkIcon
} from './Icons';

// Modern Car Wash Icon
const CarWashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V13.5M8.25 21l4.5-4.5M16.5 10.5h.007v.008H16.5V10.5zm-9.75 0h.008v.008H6.75V10.5z" />
    </svg>
);

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, description: 'Overview & Analytics' },
    { name: 'Customers', href: '/customers', icon: UsersIcon, description: 'Client Management' },
    { name: 'Job Cards', href: '/job-cards', icon: WrenchScrewdriverIcon, description: 'Service Orders' },
    { name: 'Car Wash', href: '/car-wash', icon: CarWashIcon, description: 'Wash Scheduling' },
    { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon, description: 'Billing & Payments' },
    { name: 'Inventory', href: '/inventory', icon: CircleStackIcon, description: 'Parts & Stock' },
    { name: 'Workers', href: '/workers', icon: UserGroupIcon, description: 'Staff Management' },
    { name: 'Payroll', href: '/payroll', icon: BanknotesIcon, description: 'Salary & Wages' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, description: 'Configuration' },
];

const COLLAPSED_KEY = 'janu.sidebar.collapsed';

const readCollapsed = (): boolean => {
    try {
        return window.localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
        return false;
    }
};

interface SidebarProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(readCollapsed);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            try {
                window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
            } catch {
                // Preference simply won't persist if storage is unavailable.
            }
            return next;
        });
    };

    // Close the mobile drawer with Escape.
    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onMobileClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [mobileOpen, onMobileClose]);

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar: slide-over drawer on phones/tablets, sticky full-height column on desktop */}
            <aside
                aria-label="Main navigation"
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]
                    transform transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:max-w-none lg:flex-shrink-0 lg:self-start
                    lg:transition-[width] ${isCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-64 xl:w-72'}
                `}
            >
                <div className="h-full flex flex-col nav-glass border-r border-primary-500/10 overflow-hidden">
                    {/* Brand */}
                    <div className={`flex items-center h-20 flex-shrink-0 border-b border-primary-500/10 px-4 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
                        <img src="/assets/logo.png" alt="JANU MOTORS" className="h-10 w-10 flex-shrink-0 rounded-lg object-contain icon-glow" />
                        <div className={`ml-3 min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                            <div className="text-lg font-bold leading-tight text-white truncate">JANU MOTORS</div>
                            <div className="text-[11px] font-medium tracking-wider text-primary-500/80 truncate">PREMIUM GARAGE</div>
                        </div>
                        <button
                            type="button"
                            onClick={onMobileClose}
                            aria-label="Close navigation menu"
                            className="lg:hidden flex-shrink-0 p-2 rounded-lg text-primary-500/70 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 ${isCollapsed ? 'lg:px-2' : ''}`}>
                        {navigation.map(item => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === '/'}
                                onClick={onMobileClose}
                                title={isCollapsed ? `${item.name} – ${item.description}` : undefined}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors duration-200
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 ${
                                        isActive
                                            ? 'bg-gradient-gold text-black shadow-gold border-primary-500/30'
                                            : 'text-white/80 hover:text-white hover:bg-primary-500/10 border-transparent hover:border-primary-500/20'
                                    } ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon
                                            className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                                isActive ? 'text-black' : 'text-primary-500 group-hover:text-primary-400'
                                            }`}
                                        />
                                        <span className={`min-w-0 flex-1 truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
                                            {item.name}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Collapse toggle (desktop only) */}
                    <div className={`hidden lg:block flex-shrink-0 border-t border-primary-500/10 p-3 ${isCollapsed ? 'px-2' : ''}`}>
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-primary-500/10 transition-colors duration-200 ${isCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <svg className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {!isCollapsed && <span>Collapse</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
