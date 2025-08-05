import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, JobStatus, Invoice, InvoiceItem } from '../types';
import Modal from '../components/Modal';
import { TrashIcon } from '../components/Icons';

const Invoices = () => {
    const { state, dispatch } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState('');

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case PaymentStatus.UNPAID: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case PaymentStatus.PARTIAL: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
        
        const laborRate = 80; // Default rate
        
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
        const taxRate = 0.05; // 5%
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        const newInvoice: Invoice = {
            id: `INV${Date.now()}`,
            job_card_id: job.id,
            customer_id: job.customer_id,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Invoices</h2>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Create Invoice
                </button>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Invoice ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.invoices.map(invoice => {
                            const customer = state.customers.find(c => c.id === invoice.customer_id);
                            return (
                                <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">{invoice.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer?.name}</td>
                                    <td className="px-6 py-4">{invoice.issue_date}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">${invoice.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.payment_status)}`}>
                                            {invoice.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-4">
                                            <Link to={`/invoices/${invoice.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">View</Link>
                                            <button onClick={() => handleDelete(invoice.id)} className="text-red-600 dark:text-red-500 hover:text-red-800">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal title="Create New Invoice" isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)}>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Completed Job</label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">-- Select a Job --</option>
                            {availableJobsForInvoice.map(job => {
                                const customer = state.customers.find(c => c.id === job.customer_id);
                                return (
                                    <option key={job.id} value={job.id}>
                                        Job {job.id} - {customer?.name} - "{job.description.substring(0, 30)}..."
                                    </option>
                                );
                            })}
                        </select>
                         {availableJobsForInvoice.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No completed jobs are available to be invoiced.</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={!selectedJobId} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400">Generate Invoice</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Invoices;