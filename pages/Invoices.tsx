import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, JobStatus, Invoice, InvoiceItem } from '../types';
import Modal from '../components/Modal';
import { TrashIcon, DocumentTextIcon, PlusIcon, CurrencyDollarIcon } from '../components/Icons';

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

    const getStatusIcon = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return '✅';
            case PaymentStatus.UNPAID: return '❌';
            case PaymentStatus.PARTIAL: return '⚠️';
            default: return '📄';
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
        
        const laborRate = 80;
        
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
        const taxRate = 0.05;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        const newInvoice: Invoice = {
            id: `INV${Date.now()}`,
            job_card_id: job.id,
            customer_id: job.customer_id,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items,
            subtotal,
            tax: taxRate * 100,
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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <DocumentTextIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Invoice Management
                    </h1>
                    <p className="text-white/60 mt-2">Billing and payment tracking</p>
                </div>
                
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Invoice</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="card-luxury p-4 border-l-4 border-primary-500">
                    <div className="text-center">
                        <p className="text-sm font-medium text-white/70">Total</p>
                        <p className="text-xl font-bold text-white">{invoiceStats.total}</p>
                    </div>
                </div>

                <div className="card-luxury p-4 border-l-4 border-green-500">
                    <div className="text-center">
                        <p className="text-sm font-medium text-white/70">Paid</p>
                        <p className="text-xl font-bold text-green-400">{invoiceStats.paid}</p>
                    </div>
                </div>

                <div className="card-luxury p-4 border-l-4 border-red-500">
                    <div className="text-center">
                        <p className="text-sm font-medium text-white/70">Unpaid</p>
                        <p className="text-xl font-bold text-red-400">{invoiceStats.unpaid}</p>
                    </div>
                </div>

                <div className="card-luxury p-4 border-l-4 border-yellow-500">
                    <div className="text-center">
                        <p className="text-sm font-medium text-white/70">Partial</p>
                        <p className="text-xl font-bold text-yellow-400">{invoiceStats.partial}</p>
                    </div>
                </div>

                <div className="card-luxury p-4 lg:col-span-2 border-l-4 border-primary-500">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm font-medium text-white/70">Revenue</p>
                            <p className="text-lg font-bold text-primary-400">${invoiceStats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white/70">Pending</p>
                            <p className="text-lg font-bold text-red-400">${invoiceStats.pendingAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card-luxury p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500/50" />
                        <input
                            type="text"
                            placeholder="Search by invoice ID, customer name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-12 pr-4 py-3"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-primary-500/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input px-4 py-3 min-w-[140px]"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInvoices.map(invoice => {
                    const customer = state.customers.find(c => c.id === invoice.customer_id);
                    const daysOverdue = invoice.payment_status === PaymentStatus.UNPAID ? 
                        Math.floor((Date.now() - new Date(invoice.due_date || invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                        <div key={invoice.id} className="card-luxury p-6 group">
                            {/* Invoice Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg font-mono">#{invoice.id}</h3>
                                    <p className="text-primary-500/80 text-sm flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        {new Date(invoice.issue_date).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(invoice.payment_status)}`}>
                                    <span>{getStatusIcon(invoice.payment_status)}</span>
                                    <span>{invoice.payment_status}</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-4 p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black">
                                        {customer?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{customer?.name}</p>
                                        <p className="text-xs text-white/60 truncate">{customer?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Subtotal</span>
                                    <span className="text-white">${invoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">Tax ({invoice.tax}%)</span>
                                    <span className="text-white">${(invoice.subtotal * (invoice.tax / 100)).toFixed(2)}</span>
                                </div>
                                {invoice.discount && invoice.discount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/70">Discount</span>
                                        <span className="text-green-400">-${invoice.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-primary-500/10">
                                    <span className="font-semibold text-white">Total</span>
                                    <span className="font-bold text-xl text-primary-400">${invoice.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Overdue Warning */}
                            {daysOverdue > 0 && (
                                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-xs font-medium text-center">
                                        {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <Link 
                                    to={`/invoices/${invoice.id}`}
                                    className="flex-1 btn-secondary py-2.5 rounded-lg flex items-center justify-center space-x-2 group-hover:bg-primary-500/20 transition-all duration-300"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    <span>View</span>
                                </Link>
                                
                                <button
                                    onClick={() => handleDelete(invoice.id)}
                                    className="p-2.5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Due Date */}
                            <div className="mt-4 pt-4 border-t border-primary-500/10">
                                <p className="text-xs text-white/50">
                                    Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredInvoices.length === 0 && (
                <div className="card-luxury p-12 text-center">
                    <div className="w-20 h-20 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DocumentTextIcon className="w-10 h-10 text-primary-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Invoices Found</h3>
                    <p className="text-white/60 mb-6">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Create your first invoice from a completed job'}
                    </p>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn-luxury px-6 py-3 rounded-xl"
                    >
                        Create First Invoice
                    </button>
                </div>
            )}

            {/* Create Invoice Modal */}
            <Modal title="Create New Invoice" isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}>
                <form onSubmit={handleCreateInvoice} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Select Completed Job *</label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="form-input w-full px-4 py-3"
                            required
                        >
                            <option value="">-- Select a Job --</option>
                            {availableJobsForInvoice.map(job => {
                                const customer = state.customers.find(c => c.id === job.customer_id);
                                return (
                                    <option key={job.id} value={job.id}>
                                        Job #{job.id} - {customer?.name} - "{job.description.substring(0, 40)}..."
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

                    {selectedJobId && (
                        <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Invoice Preview</h4>
                            <p className="text-sm text-white/80">
                                This will generate an invoice with labor costs and parts used for the selected job.
                                You can modify the details after creation.
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setCreateModalOpen(false)} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!selectedJobId} 
                            className="btn-luxury px-6 py-3 rounded-xl disabled:opacity-50"
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