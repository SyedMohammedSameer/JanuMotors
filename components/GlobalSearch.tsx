import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Customer, InventoryItem, Invoice, JobCard, Vehicle, Worker } from '../types';
import { useDismiss } from '../utils/useDismiss';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

type Group = 'Customers' | 'Vehicles' | 'Job Cards' | 'Invoices' | 'Inventory' | 'Workers';

interface SearchResult {
    key: string;
    group: Group;
    title: string;
    subtitle: string;
    to: string;
}

const MAX_PER_GROUP = 4;

const GlobalSearch: React.FC = () => {
    const { state, formatCurrency } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const close = useCallback(() => setOpen(false), []);
    useDismiss(wrapperRef, open, close);

    // Ctrl/Cmd + K focuses the search box.
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Reset whenever the user navigates somewhere.
    useEffect(() => {
        setQuery('');
        setOpen(false);
    }, [location.pathname]);

    const results = useMemo<SearchResult[]>(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const has = (...values: Array<string | number | null | undefined>) =>
            values.some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q));

        const customerById = new Map<string, Customer>(state.customers.map((c: Customer) => [c.id, c]));
        const vehicleById = new Map<string, Vehicle>(state.vehicles.map((v: Vehicle) => [v.id, v]));
        const out: SearchResult[] = [];

        const collect = <T,>(items: T[], matches: (item: T) => boolean, toResult: (item: T) => SearchResult) => {
            let count = 0;
            for (const item of items) {
                if (!matches(item)) continue;
                out.push(toResult(item));
                if (++count >= MAX_PER_GROUP) break;
            }
        };

        collect<Customer>(state.customers, c => has(c.name, c.phone, c.email), c => ({
            key: `customer-${c.id}`,
            group: 'Customers',
            title: c.name,
            subtitle: c.phone || c.email || 'No contact details',
            to: `/customers/${c.id}`,
        }));

        collect<Vehicle>(state.vehicles, v => has(v.license_plate, v.make, v.model, v.vin, v.year), v => ({
            key: `vehicle-${v.id}`,
            group: 'Vehicles',
            title: [v.license_plate, [v.make, v.model].filter(Boolean).join(' ')].filter(Boolean).join(' · ') || 'Vehicle',
            subtitle: customerById.get(v.owner_id)?.name ?? 'Unknown owner',
            to: `/customers/${v.owner_id}`,
        }));

        collect<JobCard>(
            state.jobCards,
            j => has(j.id, j.description, customerById.get(j.customer_id)?.name, vehicleById.get(j.vehicle_id)?.license_plate),
            j => ({
                key: `job-${j.id}`,
                group: 'Job Cards',
                title: `#${j.id}`,
                subtitle: [customerById.get(j.customer_id)?.name, j.status].filter(Boolean).join(' · '),
                to: `/job-cards/${j.id}`,
            })
        );

        collect<Invoice>(state.invoices, i => has(i.id, customerById.get(i.customer_id)?.name), i => ({
            key: `invoice-${i.id}`,
            group: 'Invoices',
            title: `#${i.id}`,
            subtitle: [customerById.get(i.customer_id)?.name, formatCurrency(i.total), i.payment_status].filter(Boolean).join(' · '),
            to: `/invoices/${i.id}`,
        }));

        collect<InventoryItem>(state.inventory, i => has(i.name, i.sku, i.supplier), i => ({
            key: `inventory-${i.id}`,
            group: 'Inventory',
            title: i.name,
            subtitle: [i.sku, `${i.quantity} in stock`].filter(Boolean).join(' · '),
            to: '/inventory',
        }));

        collect<Worker>(state.workers, w => has(w.name, w.role), w => ({
            key: `worker-${w.id}`,
            group: 'Workers',
            title: w.name,
            subtitle: w.role,
            to: '/workers',
        }));

        return out;
    }, [query, state.customers, state.vehicles, state.jobCards, state.invoices, state.inventory, state.workers, formatCurrency]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const select = (result: SearchResult) => {
        navigate(result.to);
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex(i => (results.length ? (i + 1) % results.length : 0));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex(i => (results.length ? (i - 1 + results.length) % results.length : 0));
        } else if (event.key === 'Enter') {
            const result = results[activeIndex];
            if (result) {
                event.preventDefault();
                select(result);
            }
        } else if (event.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    const showPanel = open && query.trim().length > 0;

    return (
        <div ref={wrapperRef} className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500/60" />
            <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={showPanel}
                aria-controls="global-search-results"
                aria-label="Quick search"
                autoComplete="off"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Quick search..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50/60 border border-primary-500/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:border-primary-500 transition-colors duration-200 [&::-webkit-search-cancel-button]:appearance-none"
            />

            {showPanel && (
                <div
                    id="global-search-results"
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-primary-500/20 bg-dark-50 shadow-luxury z-50"
                >
                    {results.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-white/60">
                            No results for “{query.trim()}”
                        </div>
                    ) : (
                        results.map((result, index) => {
                            const showHeading = index === 0 || results[index - 1].group !== result.group;
                            return (
                                <React.Fragment key={result.key}>
                                    {showHeading && (
                                        <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-primary-500/80">
                                            {result.group}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => select(result)}
                                        className={`w-full text-left px-4 py-2 transition-colors duration-100 ${
                                            index === activeIndex ? 'bg-primary-500/15' : 'hover:bg-primary-500/10'
                                        }`}
                                    >
                                        <div className="text-sm font-medium text-white truncate">{result.title}</div>
                                        <div className="text-xs text-white/60 truncate">{result.subtitle}</div>
                                    </button>
                                </React.Fragment>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
