import React from 'react';
import { useMatches, Link } from 'react-router-dom';
import { UserCircleIcon } from './Icons';

// Notification Bell Icon
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

// Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

// Chevron Right Icon
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

type MatchWithCrumb = ReturnType<typeof useMatches>[number] & {
    handle: {
        crumb: string;
    }
}

const Header = () => {
    const matches = useMatches();
    const crumbs = matches
        .filter((match): match is MatchWithCrumb =>
            Boolean(match.handle && (match.handle as any).crumb)
        );

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    return (
        <header className="sticky top-0 z-30 h-20 glass border-b border-primary-500/10 px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
                {/* Left Section - Breadcrumbs */}
                <div className="flex items-center space-x-4 flex-1">
                    {/* Mobile spacing */}
                    <div className="lg:hidden w-12"></div>
                    
                    <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
                        {crumbs.length > 0 ? (
                            <ol className="flex items-center space-x-2">
                                {crumbs.map((crumb, index) => (
                                    <li key={crumb.id} className="flex items-center">
                                        {index > 0 && (
                                            <ChevronRightIcon className="w-4 h-4 mx-2 text-primary-500/50" />
                                        )}
                                        {index === crumbs.length - 1 ? (
                                            <span className="text-lg font-bold text-white">
                                                {crumb.handle.crumb}
                                            </span>
                                        ) : (
                                            <Link 
                                                to={crumb.pathname} 
                                                className="text-primary-500 hover:text-primary-400 transition-colors duration-200 font-medium"
                                            >
                                                {crumb.handle.crumb}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <span className="text-lg font-bold text-white">Dashboard</span>
                        )}
                    </nav>
                </div>

                {/* Center Section - Search (Hidden on mobile) */}
                <div className="hidden md:flex items-center mx-8">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-80 pl-10 pr-4 py-2.5 bg-dark-50/50 border border-primary-500/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:bg-dark-50/80 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-primary-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Section - Time, Notifications, Profile */}
                <div className="flex items-center space-x-4">
                    {/* Time Display (Hidden on mobile) */}
                    <div className="hidden lg:flex flex-col items-end text-right">
                        <div className="text-sm font-semibold text-white">{currentTime}</div>
                        <div className="text-xs text-primary-500/80">{currentDate}</div>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-3 rounded-xl bg-dark-50/50 border border-primary-500/20 text-primary-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-300 group">
                        <BellIcon className="w-6 h-6" />
                        {/* Notification Badge */}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            3
                        </span>
                        {/* Hover Glow */}
                        <div className="absolute inset-0 rounded-xl bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    {/* Profile */}
                    <div className="relative group">
                        <button className="flex items-center space-x-3 p-3 rounded-xl bg-dark-50/50 border border-primary-500/20 hover:bg-primary-500/10 transition-all duration-300">
                            <div className="relative">
                                <UserCircleIcon className="w-8 h-8 text-primary-500" />
                                {/* Online Status */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-50"></div>
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-semibold text-white">Admin User</span>
                                <span className="text-xs text-primary-500/80">Administrator</span>
                            </div>
                        </button>

                        {/* Dropdown Menu (Hidden by default, can be implemented later) */}
                        <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className="glass rounded-xl border border-primary-500/20 shadow-luxury overflow-hidden">
                                <div className="p-4 border-b border-primary-500/10">
                                    <div className="text-sm font-semibold text-white">Admin User</div>
                                    <div className="text-xs text-primary-500/80">admin@janumotor.com</div>
                                </div>
                                <div className="p-2">
                                    <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-500/10 rounded-lg transition-colors">
                                        Profile Settings
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-500/10 rounded-lg transition-colors">
                                        Preferences
                                    </button>
                                    <div className="border-t border-primary-500/10 my-2"></div>
                                    <button className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden px-4 pb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-50/50 border border-primary-500/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-primary-500 focus:bg-dark-50/80 transition-all duration-300"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;