import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { JobStatus, PaymentStatus } from '../types';
import { useDismiss } from '../utils/useDismiss';

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

type Tone = 'danger' | 'warning' | 'info';

interface Notice {
    id: string;
    title: string;
    detail: string;
    to: string;
    tone: Tone;
}

const STORAGE_KEY = 'janu.notifications.read';
const MAX_NOTICES = 30;

const toneDot: Record<Tone, string> = {
    danger: 'bg-red-500',
    warning: 'bg-primary-500',
    info: 'bg-sky-400',
};

const loadReadIds = (): string[] => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
};

const saveReadIds = (ids: string[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Storage can be unavailable (private mode); read-state then lasts for this session only.
    }
};

const localDateString = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const NotificationBell: React.FC = () => {
    const { state, formatCurrency } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [readIds, setReadIds] = useState<string[]>(loadReadIds);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);
    useDismiss(wrapperRef, open, close);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const notices = useMemo<Notice[]>(() => {
        const today = localDateString();
        const customerName = (id: string) => state.customers.find(c => c.id === id)?.name ?? 'Unknown customer';
        const out: Notice[] = [];

        // Same low-stock rule the Dashboard uses (quantity below threshold), plus items that have run out.
        state.inventory.forEach(item => {
            if (item.quantity <= 0) {
                out.push({
                    id: `stock-out:${item.id}`,
                    title: `Out of stock: ${item.name}`,
                    detail: `Reorder level is ${item.low_stock_threshold}`,
                    to: '/inventory',
                    tone: 'danger',
                });
            } else if (item.quantity < item.low_stock_threshold) {
                out.push({
                    id: `stock-low:${item.id}`,
                    title: `Low stock: ${item.name}`,
                    detail: `${item.quantity} left (reorder level ${item.low_stock_threshold})`,
                    to: '/inventory',
                    tone: 'warning',
                });
            }
        });

        state.invoices.forEach(invoice => {
            if (invoice.payment_status !== PaymentStatus.PAID && invoice.due_date && invoice.due_date < today) {
                out.push({
                    id: `invoice-overdue:${invoice.id}:${invoice.payment_status}`,
                    title: `Overdue invoice #${invoice.id}`,
                    detail: `${customerName(invoice.customer_id)} · ${formatCurrency(invoice.total)} · due ${invoice.due_date}`,
                    to: `/invoices/${invoice.id}`,
                    tone: 'danger',
                });
            }
        });

        state.jobCards.forEach(job => {
            if (job.status === JobStatus.PENDING && !job.assigned_to) {
                out.push({
                    id: `job-unassigned:${job.id}`,
                    title: `Unassigned job #${job.id}`,
                    detail: `${customerName(job.customer_id)} · waiting for a mechanic`,
                    to: `/job-cards/${job.id}`,
                    tone: 'warning',
                });
            }
        });

        state.carwashBookings.forEach(booking => {
            if (booking.date === today && booking.status === 'Scheduled') {
                out.push({
                    id: `wash-today:${booking.id}`,
                    title: `Car wash today at ${booking.time_slot}`,
                    detail: `${customerName(booking.customer_id)} · ${booking.service_type}`,
                    to: '/car-wash',
                    tone: 'info',
                });
            }
        });

        const rank: Record<Tone, number> = { danger: 0, warning: 1, info: 2 };
        return out.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, MAX_NOTICES);
    }, [state.inventory, state.invoices, state.jobCards, state.carwashBookings, state.customers, formatCurrency]);

    const readSet = useMemo(() => new Set(readIds), [readIds]);
    const unreadCount = notices.filter(n => !readSet.has(n.id)).length;

    const markRead = (ids: string[]) => {
        // Keep only ids that are still relevant so the stored list cannot grow without bound.
        const current = new Set(notices.map(n => n.id));
        const next = Array.from(new Set([...readIds, ...ids])).filter(id => current.has(id));
        setReadIds(next);
        saveReadIds(next);
    };

    const openNotice = (notice: Notice) => {
        markRead([notice.id]);
        setOpen(false);
        navigate(notice.to);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-haspopup="true"
                aria-expanded={open}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-dark-50/60 border border-primary-500/20 text-primary-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors duration-200"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 bg-accent text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed inset-x-4 top-[4.25rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-xl border border-primary-500/20 bg-dark-50 shadow-luxury z-50 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-primary-500/10">
                        <h2 className="text-sm font-semibold text-white">Notifications</h2>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => markRead(notices.map(n => n.id))}
                                className="text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notices.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <p className="text-sm font-medium text-white">You're all caught up</p>
                            <p className="mt-1 text-xs text-white/60">Stock, invoice and job alerts will show up here.</p>
                        </div>
                    ) : (
                        <ul className="max-h-[min(24rem,60vh)] overflow-y-auto divide-y divide-primary-500/10">
                            {notices.map(notice => {
                                const isRead = readSet.has(notice.id);
                                return (
                                    <li key={notice.id}>
                                        <button
                                            type="button"
                                            onClick={() => openNotice(notice)}
                                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-primary-500/10 transition-colors"
                                        >
                                            <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${isRead ? 'bg-white/20' : toneDot[notice.tone]}`} />
                                            <span className="min-w-0 flex-1">
                                                <span className={`block text-sm font-medium break-words ${isRead ? 'text-white/60' : 'text-white'}`}>
                                                    {notice.title}
                                                </span>
                                                <span className="block text-xs text-white/50 break-words">{notice.detail}</span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
