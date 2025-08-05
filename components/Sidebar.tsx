import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon, UsersIcon, WrenchScrewdriverIcon, DocumentTextIcon, CircleStackIcon, UserGroupIcon, Cog6ToothIcon, BanknotesIcon
} from './Icons';

// Car wash icon
const CarWashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V13.5M8.25 21l4.5-4.5M16.5 10.5h.007v.008H16.5V10.5zm-9.75 0h.008v.008H6.75V10.5z" />
    </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Job Cards', href: '/job-cards', icon: WrenchScrewdriverIcon },
  { name: 'Car Wash', href: '/car-wash', icon: CarWashIcon },
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