import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, CircleStackIcon, UserGroupIcon, Cog6ToothIcon, BanknotesIcon
} from './Icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Job Cards', href: '/job-cards', icon: WrenchScrewdriverIcon },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Inventory', href: '/inventory', icon: CircleStackIcon },
  { name: 'Workers', href: '/workers', icon: UserGroupIcon },
  { name: 'Payroll', href: '/payroll', icon: BanknotesIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = () => {
  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">JANU MOTORS</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ` +
                (isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400 active'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white')
              }
            >
              <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300 group-[.active]:text-primary-500 dark:group-[.active]:text-primary-400"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;