import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMatches, Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon } from './Icons';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { useDismiss } from '../utils/useDismiss';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

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

const Clock = () => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 30000);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <div className="hidden xl:flex flex-col items-end text-right whitespace-nowrap">
            <div className="text-sm font-semibold text-white">
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <div className="text-xs text-primary-500/80">
                {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
};

const UserMenu = () => {
    const { dispatch } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);
    useDismiss(wrapperRef, open, close);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        let cancelled = false;
        supabase?.auth.getSession()
            .then(({ data }) => {
                if (!cancelled) setEmail(data.session?.user?.email ?? '');
            })
            .catch(() => { /* leave the email blank */ });
        return () => { cancelled = true; };
    }, []);

    const handleSignOut = async () => {
        setOpen(false);
        await dispatch({ type: 'LOGOUT' });
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label="Account menu"
                className="flex h-11 items-center gap-3 rounded-xl bg-dark-50/60 border border-primary-500/20 px-2 xl:pl-2 xl:pr-4 hover:bg-primary-500/10 transition-colors duration-200"
            >
                <span className="relative flex-shrink-0">
                    <UserCircleIcon className="w-8 h-8 text-primary-500" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-50"></span>
                </span>
                <span className="hidden xl:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-white whitespace-nowrap">Admin</span>
                    <span className="text-xs text-primary-500/80 whitespace-nowrap">Administrator</span>
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-primary-500/20 bg-dark-50 shadow-luxury z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-primary-500/10">
                        <div className="text-sm font-semibold text-white">Admin</div>
                        {email && <div className="text-xs text-primary-500/80 break-all">{email}</div>}
                    </div>
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={() => { setOpen(false); navigate('/settings'); }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                            Settings
                        </button>
                        <div className="border-t border-primary-500/10 my-1"></div>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const matches = useMatches();
    const crumbs = matches
        .filter((match): match is MatchWithCrumb =>
            Boolean(match.handle && (match.handle as any).crumb)
        );

    return (
        <header className="sticky top-0 z-30 glass border-b border-primary-500/10 px-4 lg:px-8">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-x-3 sm:gap-x-4 gap-y-3 py-3 md:py-0 md:h-20">
                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                    className="lg:hidden flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-dark-50/60 border border-primary-500/20 text-primary-500 hover:bg-primary-500/10 transition-colors duration-200"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>

                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="min-w-0 flex-1 md:flex-none md:max-w-[40%] lg:max-w-none">
                    {crumbs.length > 0 ? (
                        <ol className="flex items-center min-w-0">
                            {crumbs.map((crumb, index) => {
                                const isLast = index === crumbs.length - 1;
                                return (
                                    <li key={crumb.id} className={`items-center min-w-0 ${isLast ? 'flex' : 'hidden sm:flex'}`}>
                                        {index > 0 && (
                                            <ChevronRightIcon className="hidden sm:block w-4 h-4 mx-1.5 flex-shrink-0 text-primary-500/50" />
                                        )}
                                        {isLast ? (
                                            <span className="text-base sm:text-lg font-bold text-white truncate" title={crumb.handle.crumb}>
                                                {crumb.handle.crumb}
                                            </span>
                                        ) : (
                                            <Link
                                                to={crumb.pathname}
                                                className="text-primary-500 hover:text-primary-400 transition-colors duration-200 font-medium whitespace-nowrap"
                                            >
                                                {crumb.handle.crumb}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <span className="text-base sm:text-lg font-bold text-white">Dashboard</span>
                    )}
                </nav>

                {/* Search: second row on phones, centred and flexible from md up */}
                <div className="order-last basis-full md:order-none md:basis-auto md:flex-1 md:min-w-0 md:max-w-md md:mx-auto">
                    <GlobalSearch />
                </div>

                {/* Clock, notifications, account */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 md:ml-0">
                    <Clock />
                    <NotificationBell />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
