import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, JobStatus, Invoice, InvoiceItem } from '../types';
import Modal from '../components/Modal';
import { TrashIcon, DocumentTextIcon, PlusIcon } from '../components/Icons';

// Search Icon
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

// Filter Icon
const FunnelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

// Calendar Icon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);

// Eye Icon
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Invoices = () => {
    const { state, dispatch } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredInvoices = useMemo(() => {
        let filtered = state.invoices.filter(invoice => {
            const customer = state.customers.find(c => c.id === invoice.customer_id);
            const searchMatch = 
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

            return searchMatch;
        });

        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.payment_status === statusFilter);
        }

        return filtered.sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
    }, [state.invoices, state.customers, searchTerm, statusFilter]);

    const invoiceStats = useMemo(() => {
        const total = state.invoices.length;
        const paid = state.invoices.filter(i => i.payment_status === PaymentStatus.PAID).length;
        const unpaid = state.invoices.filter(i => i.payment_status === PaymentStatus.UNPAID).length;
        const partial = state.invoices.filter(i => i.payment_status === PaymentStatus.PARTIAL).length;
        const totalRevenue = state.invoices
            .filter(i => i.payment_status === PaymentStatus.PAID)
            .reduce((sum, i) => sum + i.total, 0);
        const pendingAmount = state.invoices
            .filter(i => i.payment_status === PaymentStatus.UNPAID)
            .reduce((sum, i) => sum + i.total, 0);

        return { total, paid, unpaid, partial, totalRevenue, pendingAmount };
    }, [state.invoices]);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-green-500/10 text-green-400 border-green-500/30';
            case PaymentStatus.UNPAID: return 'bg-red-500/10 text-red-400 border-red-500/30';
            case PaymentStatus.PARTIAL: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default: return 'bg-white/10 text-white/60 border-white/30';
        }
    };

    const availableJobsForInvoice = useMemo(() => {
        const invoicedJobIds = new Set(state.invoices.map(inv => inv.job_card_id));
        return state.jobCards.filter(job => 
            job.status === JobStatus.COMPLETED && !invoicedJobIds.has(job.id)
        );
    }, [state.jobCards, state.invoices]);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJobId) return;

        const job = state.jobCards.find(j => j.id === selectedJobId);
        if (!job) return;
        
        const savedFinancial = localStorage.getItem('settings_financialSettings');
        const settingsTaxRate = savedFinancial ? JSON.parse(savedFinancial).taxRate : 18;
        const laborRate = savedFinancial ? JSON.parse(savedFinancial).laborRate : 80;

        const laborItem: InvoiceItem = {
            description: 'Labor',
            quantity: job.labor_hours,
            unit_price: laborRate,
            total: job.labor_hours * laborRate,
        };

        const partItems: InvoiceItem[] = job.parts_used.map(part => {
            const inventoryItem = state.inventory.find(i => i.id === part.itemId);
            const price = inventoryItem?.price || 0;
            return {
                description: inventoryItem?.name || 'Unknown Part',
                quantity: part.quantity,
                unit_price: price,
                total: part.quantity * price,
            };
        });

        const items = [laborItem, ...partItems];
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * (settingsTaxRate / 100);
        const total = subtotal + taxAmount;

        const newInvoice: Invoice = {
            id: `INV${Date.now()}`,
            job_card_id: job.id,
            customer_id: job.customer_id,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items,
            subtotal,
            tax: settingsTaxRate,
            discount: 0,
            total,
            payment_status: PaymentStatus.UNPAID
        };

        await dispatch({ type: 'ADD_INVOICE', payload: newInvoice });
        setCreateModalOpen(false);
        setSelectedJobId('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            await dispatch({ type: 'DELETE_INVOICE', payload: { id } });
        }
    };

    // Display-only: details of the job picked in the create modal (the native <select> truncates long option text)
    const selectedJob = availableJobsForInvoice.find(j => j.id === selectedJobId);
    const selectedJobCustomer = selectedJob ? state.customers.find(c => c.id === selectedJob.customer_id) : undefined;

    const statTiles = [
        { label: 'Total', value: invoiceStats.total, border: 'border-primary-500', text: 'text-white' },
        { label: 'Paid', value: invoiceStats.paid, border: 'border-green-500', text: 'text-green-400' },
        { label: 'Unpaid', value: invoiceStats.unpaid, border: 'border-red-500', text: 'text-red-400' },
        { label: 'Partial', value: invoiceStats.partial, border: 'border-yellow-500', text: 'text-yellow-400' },
        { label: 'Revenue', value: `₹${invoiceStats.totalRevenue.toLocaleString()}`, border: 'border-primary-500', text: 'text-primary-400' },
        { label: 'Pending', value: `₹${invoiceStats.pendingAmount.toLocaleString()}`, border: 'border-red-500', text: 'text-red-400' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Invoice Management</h1>
                    <p className="text-sm text-white/60 mt-1">Billing and payment tracking</p>
                </div>

                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-luxury w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Invoice</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {statTiles.map(tile => (
                    <div key={tile.label} className={`card-luxury p-3 sm:p-4 border-l-4 min-w-0 ${tile.border}`}>
                        <p className="text-xs uppercase tracking-wide text-white/60">{tile.label}</p>
                        <p className={`mt-1 text-xl sm:text-2xl font-bold tabular-nums break-words ${tile.text}`}>{tile.value}</p>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="card-luxury p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search ID, customer or email..."
                            title="Search by invoice ID, customer name, or email"
                            aria-label="Search by invoice ID, customer name, or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-12 pr-4 py-2.5"
                        />
                    </div>

                    <div className="relative w-full sm:w-auto sm:min-w-[11rem]">
                        <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by payment status"
                            className="form-input w-full pl-12 pr-4 py-2.5"
                        >
                            <option value="all">All Status</option>
                            <option value={PaymentStatus.PAID}>Paid</option>
                            <option value={PaymentStatus.UNPAID}>Unpaid</option>
                            <option value={PaymentStatus.PARTIAL}>Partial</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredInvoices.map(invoice => {
                    const customer = state.customers.find(c => c.id === invoice.customer_id);
                    const daysOverdue = invoice.payment_status === PaymentStatus.UNPAID ?
                        Math.floor((Date.now() - new Date(invoice.due_date || invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                    return (
                        <div key={invoice.id} className="card-luxury p-4 sm:p-5 group flex flex-col min-w-0">
                            {/* Invoice Header */}
                            <div className="flex items-start justify-between gap-x-3 gap-y-2 flex-wrap mb-4">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-base font-mono break-all">#{invoice.id}</h3>
                                    <p className="text-primary-500/80 text-sm flex items-center mt-0.5">
                                        <CalendarIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        {new Date(invoice.issue_date).toLocaleDateString()}
                                    </p>
                                </div>

                                <span className={`inline-flex items-center flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(invoice.payment_status)}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" aria-hidden="true"></span>
                                    {invoice.payment_status}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-4 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                        {customer?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white break-words">{customer?.name}</p>
                                        <p className="text-xs text-white/60 break-words">{customer?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Info */}
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-white/70">Subtotal</span>
                                    <span className="text-white tabular-nums whitespace-nowrap">₹{invoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-white/70">Tax ({invoice.tax}%)</span>
                                    <span className="text-white tabular-nums whitespace-nowrap">₹{(invoice.subtotal * (invoice.tax / 100)).toFixed(2)}</span>
                                </div>
                                {invoice.discount && invoice.discount > 0 ? (
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-white/70">Discount</span>
                                        <span className="text-green-400 tabular-nums whitespace-nowrap">-₹{invoice.discount.toFixed(2)}</span>
                                    </div>
                                ) : null}
                                <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-primary-500/10">
                                    <span className="font-semibold text-white">Total</span>
                                    <span className="font-bold text-lg sm:text-xl text-primary-400 tabular-nums whitespace-nowrap">₹{invoice.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Due date, overdue warning and actions (pinned to the card bottom so rows align) */}
                            <div className="mt-auto">
                                <div className="flex items-center justify-between gap-2 flex-wrap pt-3 mb-3 border-t border-primary-500/10">
                                    <p className="text-xs text-white/60">
                                        Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                                    </p>
                                    {daysOverdue > 0 && (
                                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-medium whitespace-nowrap">
                                            {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/invoices/${invoice.id}`}
                                        className="flex-1 min-w-0 btn-secondary py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm group-hover:bg-primary-500/20 transition-colors"
                                    >
                                        <EyeIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>View</span>
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(invoice.id)}
                                        aria-label={`Delete invoice ${invoice.id}`}
                                        title="Delete invoice"
                                        className="flex-shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredInvoices.length === 0 && (
                <div className="card-luxury p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-8 h-8 text-primary-500/50" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Invoices Found</h3>
                    <p className="text-sm text-white/60 mb-5">
                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'Create your first invoice from a completed job'}
                    </p>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn-luxury px-6 py-2.5 rounded-xl"
                    >
                        Create First Invoice
                    </button>
                </div>
            )}

            {/* Create Invoice Modal */}
            <Modal title="Create New Invoice" isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}>
                <form onSubmit={handleCreateInvoice} className="space-y-4 sm:space-y-6">
                    <div>
                        <label htmlFor="invoice-job-select" className="block text-sm font-medium text-white/80 mb-1.5">Select Completed Job *</label>
                        <select
                            id="invoice-job-select"
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="form-input w-full max-w-full px-4 py-2.5"
                            required
                        >
                            <option value="">-- Select a Job --</option>
                            {availableJobsForInvoice.map(job => {
                                const customer = state.customers.find(c => c.id === job.customer_id);
                                return (
                                    <option key={job.id} value={job.id}>
                                        Job #{job.id} - {customer?.name} - "{job.description.substring(0, 40)}{job.description.length > 40 ? '...' : ''}"
                                    </option>
                                );
                            })}
                        </select>
                        {availableJobsForInvoice.length === 0 && (
                            <p className="text-sm text-white/60 mt-2">
                                No completed jobs are available to be invoiced.
                            </p>
                        )}
                    </div>

                    {selectedJob && (
                        <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Invoice Preview</h4>
                            <dl className="text-sm space-y-1 mb-3">
                                <div className="flex gap-2">
                                    <dt className="w-16 flex-shrink-0 text-white/60">Job</dt>
                                    <dd className="min-w-0 text-white break-words">#{selectedJob.id}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="w-16 flex-shrink-0 text-white/60">Customer</dt>
                                    <dd className="min-w-0 text-white break-words">{selectedJobCustomer?.name}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="w-16 flex-shrink-0 text-white/60">Work</dt>
                                    <dd className="min-w-0 text-white break-words">{selectedJob.description}</dd>
                                </div>
                            </dl>
                            <p className="text-sm text-white/80">
                                This will generate an invoice with labor costs and parts used for the selected job.
                                You can modify the details after creation.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="btn-secondary px-6 py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedJobId}
                            className="btn-luxury px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate Invoice
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Invoices;