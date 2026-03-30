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
    const jobCard = state.jobCards.find(jc => jc.id === invoice.job_card_id);
    const vehicle = jobCard ? state.vehicles.find(v => v.id === jobCard.vehicle_id) : null;

    const cgstRate = invoice.tax / 2;
    const sgstRate = invoice.tax / 2;
    const cgstAmount = invoice.subtotal * (cgstRate / 100);
    const sgstAmount = invoice.subtotal * (sgstRate / 100);

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
            <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
                <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
                <div className="flex flex-wrap items-center gap-2">
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
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Invoice Content */}
            <div id="invoice-content" className="card-luxury p-6 sm:p-10">

                {/* ── Company Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-primary-500/20">
                    {/* Left: Logo + Company Info */}
                    <div className="flex items-start gap-4">
                        <img
                            src="/assets/logo.png"
                            alt="JANU MOTORS"
                            className="h-16 w-16 rounded-xl flex-shrink-0"
                        />
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide leading-tight">
                                JANU MOTORS
                            </h2>
                            <p className="text-sm text-white/60 mt-1">Opposite Sitara Gardens, Tilak Nagar, Kadapa</p>
                            <p className="text-sm text-white/60">Phone: +91 98765 43210</p>
                            <p className="text-sm text-white/50 mt-1 font-mono text-xs">GSTIN: 37XXXXX0000X1XX</p>
                        </div>
                    </div>

                    {/* Right: Invoice Title */}
                    <div className="text-left sm:text-right flex-shrink-0">
                        <h1 className="text-4xl font-black text-primary-400 uppercase tracking-widest">Invoice</h1>
                        <p className="text-white/50 font-mono text-sm mt-1">{invoice.id}</p>
                        <div className="mt-3 flex sm:justify-end gap-6">
                            <div>
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Issue Date</p>
                                <p className="text-white text-sm font-medium">{invoice.issue_date}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Due Date</p>
                                <p className="text-white text-sm font-medium">{invoice.due_date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bill To + Vehicle Details ── */}
                <div className="grid sm:grid-cols-3 gap-6 py-8 border-b border-primary-500/10">
                    {/* Bill To */}
                    <div>
                        <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Bill To</p>
                        <p className="font-bold text-lg text-white leading-tight">{customer?.name || '—'}</p>
                        {customer?.phone && <p className="text-white/70 text-sm">{customer.phone}</p>}
                        {customer?.email && <p className="text-white/70 text-sm">{customer.email}</p>}
                        {customer?.address && <p className="text-white/60 text-sm mt-1">{customer.address}</p>}
                    </div>

                    {/* Vehicle Details */}
                    <div>
                        <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Vehicle Details</p>
                        {vehicle ? (
                            <>
                                <p className="font-bold text-lg text-white leading-tight">
                                    {vehicle.make} {vehicle.model}
                                </p>
                                <p className="text-white/70 text-sm">Reg. No: <span className="font-semibold text-white">{vehicle.license_plate}</span></p>
                                {vehicle.year && <p className="text-white/60 text-sm">Year: {vehicle.year}</p>}
                                {vehicle.vin && <p className="text-white/50 text-xs font-mono mt-1">VIN: {vehicle.vin}</p>}
                            </>
                        ) : (
                            <p className="text-white/40 text-sm italic">No vehicle linked</p>
                        )}
                    </div>

                    {/* Job Card Ref */}
                    <div className="sm:text-right">
                        <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">Job Card Ref</p>
                        <Link
                            to={`/job-cards/${invoice.job_card_id}`}
                            className="text-primary-400 hover:text-primary-300 font-mono text-sm hover:underline"
                        >
                            {invoice.job_card_id}
                        </Link>
                    </div>
                </div>

                {/* ── Items Table ── */}
                <div className="py-6">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px]">
                            <thead className="border-b-2 border-primary-500/20">
                                <tr className="text-left text-xs font-bold text-primary-500 uppercase tracking-wider">
                                    <th className="py-3 pr-4">Description</th>
                                    <th className="py-3 px-4 text-center w-20">Qty</th>
                                    <th className="py-3 px-4 text-right w-32">Unit Price</th>
                                    <th className="py-3 pl-4 text-right w-32">Amount</th>
                                    {isEditing && <th className="py-3 pl-4 text-right w-12"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-500/10">
                                {invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-3 pr-4 font-medium text-white">
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
                                        <td className="py-3 px-4 text-center text-white/80">
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
                                        <td className="py-3 px-4 text-right text-white/80">
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
                                        <td className="py-3 pl-4 text-right font-semibold text-white">₹{item.total.toFixed(2)}</td>
                                        {isEditing &&
                                            <td className="py-3 pl-4 text-right">
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
                    </div>

                    {isEditing && (
                        <button
                            onClick={handleAddItem}
                            className="flex items-center gap-2 text-sm btn-secondary px-3 py-1 rounded-lg mt-4"
                        >
                            <PlusIcon className="w-4 h-4" /> Add Item
                        </button>
                    )}
                </div>

                {/* ── Totals ── */}
                <div className="flex justify-end border-t border-primary-500/10 pt-6">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                            <span>Subtotal</span>
                            <span>₹{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                            <span>CGST ({cgstRate}%)</span>
                            <span>₹{cgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                            <span>SGST ({sgstRate}%)</span>
                            <span>₹{sgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/60 items-center">
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
                        <div className="flex justify-between font-bold text-lg text-primary-400 border-t-2 border-primary-500/20 pt-3">
                            <span>Total Due</span>
                            <span>₹{invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Authority Signature ── */}
                <div className="mt-10 pt-6 border-t border-primary-500/10">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
                        {/* Terms / Bank Details placeholder */}
                        <div className="text-xs text-white/40 max-w-xs">
                            <p className="font-semibold text-white/50 mb-1">Terms & Conditions</p>
                            <p>Payment is due within 30 days of invoice date.</p>
                            <p>Thank you for choosing Janu Motors!</p>
                        </div>

                        {/* Signature Box */}
                        <div className="text-center flex-shrink-0">
                            <div className="w-48 h-16 border-b-2 border-white/30 mb-2"></div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Authorised Signatory</p>
                            <p className="text-sm font-bold text-white mt-0.5">For JANU MOTORS</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoiceDetail;
