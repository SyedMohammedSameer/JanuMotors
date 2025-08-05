import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, Invoice, InvoiceItem } from '../types';
import { WrenchScrewdriverIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDetail = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const { state, dispatch } = useAppContext();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const originalInvoice = useMemo(() => state.invoices.find(inv => inv.id === invoiceId), [state.invoices, invoiceId]);
    const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(originalInvoice ? JSON.parse(JSON.stringify(originalInvoice)) : null);

    useEffect(() => {
        // Recalculate totals whenever items or discount change in edit mode
        if (isEditing && editedInvoice) {
            const subtotal = editedInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
            const taxAmount = subtotal * (editedInvoice.tax / 100);
            const discountAmount = editedInvoice.discount || 0;
            const total = subtotal + taxAmount - discountAmount;

            setEditedInvoice(prev => prev ? {
                ...prev,
                subtotal: subtotal,
                total: total,
                items: prev.items.map(item => ({...item, total: item.quantity * item.unit_price }))
            } : null);
        }
    }, [isEditing, editedInvoice?.items, editedInvoice?.discount, editedInvoice?.tax]);

    if (!originalInvoice) {
        return <Navigate to="/invoices" replace />;
    }
    
    const invoice = isEditing && editedInvoice ? editedInvoice : originalInvoice;
    if (!invoice) return null;

    const customer = state.customers.find(c => c.id === invoice.customer_id);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as PaymentStatus;
        await dispatch({ type: 'UPDATE_INVOICE', payload: {...invoice, payment_status: newStatus} });
    };
    
    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-green-500/10 text-green-400 border-green-500/30';
            case PaymentStatus.UNPAID: return 'bg-red-500/10 text-red-400 border-red-500/30';
            case PaymentStatus.PARTIAL: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default: return 'bg-white/10 text-white/60 border-white/30';
        }
    };

    const handleSave = async () => {
        if (editedInvoice) {
            await dispatch({ type: 'UPDATE_INVOICE', payload: editedInvoice });
            setIsEditing(false);
        }
    };
    
    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        if (editedInvoice) {
            const newItems = [...editedInvoice.items];
            const itemToUpdate = { ...newItems[index] };
            (itemToUpdate[field] as any) = value;
            newItems[index] = itemToUpdate;
            setEditedInvoice({ ...editedInvoice, items: newItems });
        }
    };
    
    const handleAddItem = () => {
        if (editedInvoice) {
            const newItem: InvoiceItem = { description: '', quantity: 1, unit_price: 0, total: 0 };
            setEditedInvoice({ ...editedInvoice, items: [...editedInvoice.items, newItem] });
        }
    };

    const handleDeleteItem = (index: number) => {
        if (editedInvoice) {
            const newItems = editedInvoice.items.filter((_, i) => i !== index);
            setEditedInvoice({ ...editedInvoice, items: newItems });
        }
    };

    const handleDownloadPdf = () => {
        const input = document.getElementById('invoice-content');
        if (!input) return;

        setIsDownloading(true);
        html2canvas(input, { scale: 2, useCORS: true, logging: false, backgroundColor: '#1a1a1a' })
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Invoice-${invoice.id}.pdf`);
            setIsDownloading(false);
        }).catch(() => {
            setIsDownloading(false);
            alert("An error occurred generating the PDF.");
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Controls */}
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
                <div className="flex items-center gap-4">
                    {!isEditing ? (
                        <>
                            <div className="flex items-center gap-2">
                                <label htmlFor="paymentStatus" className="text-sm font-medium text-white/70">Status:</label>
                                <select 
                                    id="paymentStatus" 
                                    value={invoice.payment_status} 
                                    onChange={handleStatusChange} 
                                    className={`rounded-lg border-transparent px-3 py-1.5 text-sm font-semibold ${getStatusColor(invoice.payment_status)} focus:ring-2 focus:ring-primary-500`}
                                >
                                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="btn-secondary px-4 py-2 rounded-xl flex items-center space-x-2"
                                >
                                    <PencilIcon className="h-4 w-4" /> 
                                    <span>Edit</span>
                                </button>
                                <button 
                                    onClick={handleDownloadPdf} 
                                    disabled={isDownloading} 
                                    className="btn-secondary px-4 py-2 rounded-xl flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                    <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                                </button>
                                <button 
                                    onClick={() => window.print()} 
                                    className="btn-luxury px-4 py-2 rounded-xl"
                                >
                                    Print
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedInvoice(originalInvoice ? JSON.parse(JSON.stringify(originalInvoice)) : null);
                                }} 
                                className="btn-secondary px-4 py-2 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="btn-luxury px-4 py-2 rounded-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Content */}
            <div id="invoice-content" className="card-luxury p-8 sm:p-12">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center">
                        <img src="/assets/logo.png" alt="JANU MOTORS" className="h-12 w-12 mr-4" />
                        <div>
                            <p className="text-2xl font-bold text-gradient">JANU MOTORS</p>
                            <p className="text-sm text-white/60">Opposite Sitara Gardens, Tilak Nagar, Kadapa</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-white uppercase">Invoice</h1>
                        <p className="text-white/60 font-mono">{invoice.id}</p>
                    </div>
                </div>

                {/* Bill To & Dates */}
                <div className="grid sm:grid-cols-2 gap-6 mb-10">
                    <div>
                        <p className="font-semibold text-white/60 mb-1">BILL TO</p>
                        <p className="font-bold text-lg text-white">{customer?.name}</p>
                        <p className="text-white/70">{customer?.address}</p>
                        <p className="text-white/70">{customer?.email}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex justify-end gap-6">
                            <div>
                                <p className="font-semibold text-white/60">Issue Date</p>
                                <p className="text-white">{invoice.issue_date}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-white/60">Due Date</p>
                                <p className="text-white">{invoice.due_date}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-right">
                            <p className="font-semibold text-white/60">Job Card</p>
                            <Link to={`/job-cards/${invoice.job_card_id}`} className="text-primary-500 hover:underline">{invoice.job_card_id}</Link>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-10">
                    <thead className="border-b-2 border-primary-500/20">
                        <tr className="text-left text-sm font-semibold text-primary-500 uppercase">
                            <th className="py-3 pr-4">Description</th>
                            <th className="py-3 px-4 text-center w-24">Qty</th>
                            <th className="py-3 px-4 text-right w-32">Unit Price</th>
                            <th className="py-3 pl-4 text-right w-32">Total</th>
                            {isEditing && <th className="py-3 pl-4 text-right w-12"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-primary-500/10">
                                <td className="py-2 pr-4 font-medium text-white">
                                    {isEditing ? 
                                        <input 
                                            type="text" 
                                            value={item.description} 
                                            onChange={e => handleItemChange(index, 'description', e.target.value)} 
                                            className="w-full p-1 rounded form-input text-sm" 
                                        /> : 
                                        item.description
                                    }
                                </td>
                                <td className="py-2 px-4 text-center">
                                    {isEditing ? 
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} 
                                            className="w-full p-1 rounded form-input text-sm text-center" 
                                        /> : 
                                        item.quantity
                                    }
                                </td>
                                <td className="py-2 px-4 text-right">
                                    {isEditing ? 
                                        <input 
                                            type="number" 
                                            value={item.unit_price} 
                                            onChange={e => handleItemChange(index, 'unit_price', Number(e.target.value))} 
                                            className="w-full p-1 rounded form-input text-sm text-right" 
                                        /> : 
                                        `₹${item.unit_price.toFixed(2)}`
                                    }
                                </td>
                                <td className="py-2 pl-4 text-right font-medium text-white">₹{item.total.toFixed(2)}</td>
                                {isEditing && 
                                    <td className="py-2 pl-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteItem(index)} 
                                            className="text-red-500 hover:text-red-400 p-1"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {isEditing && (
                    <button 
                        onClick={handleAddItem} 
                        className="flex items-center gap-2 text-sm btn-secondary px-3 py-1 rounded-lg mb-10"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Item
                    </button>
                )}
                
                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between text-white/70">
                            <span>Subtotal</span>
                            <span>₹{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                            <span>Tax ({invoice.tax}%)</span>
                            <span>₹{(invoice.subtotal * (invoice.tax / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70 items-center">
                            <span>Discount</span>
                            {isEditing ? 
                                <input 
                                    type="number" 
                                    value={invoice.discount || 0} 
                                    onChange={e => setEditedInvoice({...invoice, discount: Number(e.target.value)})} 
                                    className="w-24 p-1 rounded form-input text-sm text-right" 
                                    placeholder="0.00" 
                                />
                                : <span>-₹{(invoice.discount || 0).toFixed(2)}</span>
                            }
                        </div>
                        <div className="flex justify-between font-bold text-xl text-primary-400 border-t-2 border-primary-500/20 pt-2">
                            <span>Total Due</span>
                            <span>₹{invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;