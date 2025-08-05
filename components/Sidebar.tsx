import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, 
    CircleStackIcon, UserGroupIcon, Cog6ToothIcon, BanknotesIcon
} from './Icons';

// Modern Car Wash Icon
const CarWashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V13.5M8.25 21l4.5-4.5M16.5 10.5h.007v.008H16.5V10.5zm-9.75 0h.008v.008H6.75V10.5z" />
    </svg>
);

// Hamburger Menu Icon
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

// Close Icon
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Customers', 
    href: '/customers', 
    icon: UsersIcon,
    description: 'Client Management'
  },
  { 
    name: 'Job Cards', 
    href: '/job-cards', 
    icon: WrenchScrewdriverIcon,
    description: 'Service Orders'
  },
  { 
    name: 'Car Wash', 
    href: '/car-wash', 
    icon: CarWashIcon,
    description: 'Wash Scheduling'
  },
  { 
    name: 'Invoices', 
    href: '/invoices', 
    icon: DocumentTextIcon,
    description: 'Billing & Payments'
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: CircleStackIcon,
    description: 'Parts & Stock'
  },
  { 
    name: 'Workers', 
    href: '/workers', 
    icon: UserGroupIcon,
    description: 'Staff Management'
  },
  { 
    name: 'Payroll', 
    href: '/payroll', 
    icon: BanknotesIcon,
    description: 'Salary & Wages'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon,
    description: 'Configuration'
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-dark-50 border border-primary-500/20 text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
      >
        {isMobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-72 xl:w-80 
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : ''}
      `}>
        <div className="h-full flex flex-col nav-glass border-r border-primary-500/10">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-primary-500/10">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="relative">
                <WrenchScrewdriverIcon className="h-10 w-10 text-primary-500 icon-glow animate-pulse-gold" />
                <div className="absolute inset-0 h-10 w-10 bg-primary-500/20 rounded-full blur-xl"></div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient">JANU MOTORS</span>
                  <span className="text-xs text-primary-500/80 font-medium tracking-wider">PREMIUM GARAGE</span>
                </div>
              )}
            </div>
            
            {/* Collapse Toggle - Desktop Only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
            >
              <svg className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-gold text-black shadow-gold border border-primary-500/30'
                      : 'text-white/80 hover:text-white hover:bg-primary-500/10 border border-transparent hover:border-primary-500/20'
                  } ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}`
                }
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`h-6 w-6 flex-shrink-0 transition-colors duration-300 ${
                        isActive ? 'text-black' : 'text-primary-500 group-hover:text-primary-400'
                      } ${isCollapsed ? '' : 'mr-4'}`} 
                    />
                    
                    {!isCollapsed && (
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-semibold">
                          {item.name}
                        </span>
                        <span className={`text-xs truncate ${
                          isActive ? 'text-black/70' : 'text-white/50 group-hover:text-white/70'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    )}

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-dark-50 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 border border-primary-500/20">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-white/70">{item.description}</div>
                      </div>
                    )}

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-xl bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-6 border-t border-primary-500/10">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent/10 border border-primary-500/20">
                <div className="flex-shrink-0 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">System Status</p>
                  <p className="text-xs text-primary-500">All systems operational</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;