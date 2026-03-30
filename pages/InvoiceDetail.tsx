import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, Invoice, InvoiceItem } from '../types';
import { ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CGST_RATE = 9;
const SGST_RATE = 9;

const InvoiceDetail = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const { state, dispatch } = useAppContext();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const originalInvoice = useMemo(() => state.invoices.find(inv => inv.id === invoiceId), [state.invoices, invoiceId]);
    const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(
        originalInvoice ? JSON.parse(JSON.stringify(originalInvoice)) : null
    );

    useEffect(() => {
        if (isEditing && editedInvoice) {
            const subtotal = editedInvoice.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
            const taxAmount = subtotal * ((CGST_RATE + SGST_RATE) / 100);
            const discountAmount = editedInvoice.discount || 0;
            const total = subtotal + taxAmount - discountAmount;
            setEditedInvoice(prev => prev ? {
                ...prev,
                subtotal,
                total,
                tax: CGST_RATE + SGST_RATE,
                items: prev.items.map(item => ({ ...item, total: item.quantity * item.unit_price }))
            } : null);
        }
    }, [isEditing, editedInvoice?.items, editedInvoice?.discount]);

    if (!originalInvoice) return <Navigate to="/invoices" replace />;
    const invoice = isEditing && editedInvoice ? editedInvoice : originalInvoice;
    if (!invoice) return null;

    const customer  = state.customers.find(c => c.id === invoice.customer_id);
    const jobCard   = state.jobCards.find(jc => jc.id === invoice.job_card_id);
    const vehicle   = jobCard ? state.vehicles.find(v => v.id === jobCard.vehicle_id) : null;

    // Always use 9+9 regardless of what's stored
    const cgstAmt = invoice.subtotal * (CGST_RATE / 100);
    const sgstAmt = invoice.subtotal * (SGST_RATE / 100);
    const displayTotal = invoice.subtotal + cgstAmt + sgstAmt - (invoice.discount || 0);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:    return 'bg-green-500/10 text-green-400 border-green-500/30';
            case PaymentStatus.UNPAID:  return 'bg-red-500/10 text-red-400 border-red-500/30';
            case PaymentStatus.PARTIAL: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default: return 'bg-white/10 text-white/60 border-white/30';
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await dispatch({ type: 'UPDATE_INVOICE', payload: { ...invoice, payment_status: e.target.value as PaymentStatus } });
    };

    const handleSave = async () => {
        if (editedInvoice) {
            await dispatch({ type: 'UPDATE_INVOICE', payload: editedInvoice });
            setIsEditing(false);
        }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        if (!editedInvoice) return;
        const newItems = [...editedInvoice.items];
        (newItems[index] as any)[field] = value;
        setEditedInvoice({ ...editedInvoice, items: newItems });
    };

    const handleDownloadPdf = () => {
        const input = document.getElementById('invoice-content');
        if (!input) return;
        setIsDownloading(true);
        html2canvas(input, { scale: 2, useCORS: true, logging: false, backgroundColor: '#1a1a1a' })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pw = pdf.internal.pageSize.getWidth();
                const ph = pdf.internal.pageSize.getHeight();
                const ratio = Math.min((pw - 20) / canvas.width, (ph - 20) / canvas.height);
                pdf.addImage(imgData, 'PNG', (pw - canvas.width * ratio) / 2, 10, canvas.width * ratio, canvas.height * ratio);
                pdf.save(`Invoice-${invoice.id}.pdf`);
                setIsDownloading(false);
            })
            .catch(() => { setIsDownloading(false); alert('PDF generation failed.'); });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {!isEditing ? (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-white/60">Status:</label>
                                <select
                                    value={invoice.payment_status}
                                    onChange={handleStatusChange}
                                    className={`rounded-lg border-transparent px-3 py-1.5 text-sm font-semibold ${getStatusColor(invoice.payment_status)}`}
                                >
                                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={handleDownloadPdf} disabled={isDownloading} className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50">
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                {isDownloading ? 'Downloading…' : 'PDF'}
                            </button>
                            <button onClick={() => window.print()} className="btn-luxury px-3 py-2 rounded-xl text-sm">Print</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setIsEditing(false); setEditedInvoice(JSON.parse(JSON.stringify(originalInvoice))); }} className="btn-secondary px-4 py-2 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleSave} className="btn-luxury px-4 py-2 rounded-xl text-sm">Save</button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Invoice ── */}
            <div id="invoice-content" className="card-luxury p-6 sm:p-8 text-sm">

                {/* Header row */}
                <div className="flex justify-between items-start gap-4 pb-5 border-b-2 border-primary-500/20">
                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="JANU MOTORS" className="h-14 w-14 rounded-xl flex-shrink-0" />
                        <div>
                            <p className="text-xl font-extrabold text-white tracking-wide">JANU MOTORS</p>
                            <p className="text-xs text-white/55 leading-snug">Opposite Sitara Gardens, Tilak Nagar, Kadapa</p>
                            <p className="text-xs text-white/55">Ph: +91 98765 43210</p>
                            <p className="text-xs text-white/40 font-mono">GSTIN: 37XXXXX0000X1XX</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-black text-primary-400 uppercase tracking-widest">Invoice</p>
                        <p className="text-white/50 font-mono text-xs mt-0.5">{invoice.id}</p>
                        <div className="flex justify-end gap-5 mt-2">
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Issued</p>
                                <p className="text-white font-medium text-xs">{invoice.issue_date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Due</p>
                                <p className="text-white font-medium text-xs">{invoice.due_date}</p>
                            </div>
                        </div>
                        <div className={`mt-2 inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(invoice.payment_status)}`}>
                            {invoice.payment_status}
                        </div>
                    </div>
                </div>

                {/* Bill To + Vehicle + Job Ref */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-primary-500/10 text-xs">
                    <div>
                        <p className="font-bold text-primary-500 uppercase tracking-wider mb-1">Bill To</p>
                        <p className="font-bold text-white text-sm">{customer?.name || '—'}</p>
                        {customer?.phone && <p className="text-white/65">{customer.phone}</p>}
                        {customer?.email && <p className="text-white/65">{customer.email}</p>}
                        {customer?.address && <p className="text-white/50 mt-0.5">{customer.address}</p>}
                    </div>
                    <div>
                        <p className="font-bold text-primary-500 uppercase tracking-wider mb-1">Vehicle</p>
                        {vehicle ? (
                            <>
                                <p className="font-bold text-white text-sm">{vehicle.make} {vehicle.model}</p>
                                <p className="text-white/65">Reg: <span className="font-semibold text-white">{vehicle.license_plate}</span></p>
                                {vehicle.year && <p className="text-white/50">Year: {vehicle.year}</p>}
                            </>
                        ) : <p className="text-white/35 italic">Not linked</p>}
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-primary-500 uppercase tracking-wider mb-1">Job Card</p>
                        <Link to={`/job-cards/${invoice.job_card_id}`} className="text-primary-400 hover:underline font-mono text-xs">
                            {invoice.job_card_id}
                        </Link>
                    </div>
                </div>

                {/* Items table */}
                <div className="py-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-500/20 text-xs font-bold text-primary-500 uppercase tracking-wider">
                                <th className="pb-2 pr-3 text-left">Description</th>
                                <th className="pb-2 px-3 text-center w-14">Qty</th>
                                <th className="pb-2 px-3 text-right w-28">Unit Price</th>
                                <th className="pb-2 pl-3 text-right w-28">Amount</th>
                                {isEditing && <th className="pb-2 pl-2 w-8"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-500/10">
                            {invoice.items.map((item, i) => (
                                <tr key={i} className="text-xs">
                                    <td className="py-2 pr-3 text-white">
                                        {isEditing
                                            ? <input type="text" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} className="w-full p-1 rounded form-input text-xs" />
                                            : item.description}
                                    </td>
                                    <td className="py-2 px-3 text-center text-white/80">
                                        {isEditing
                                            ? <input type="number" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', Number(e.target.value))} className="w-full p-1 rounded form-input text-xs text-center" />
                                            : item.quantity}
                                    </td>
                                    <td className="py-2 px-3 text-right text-white/80">
                                        {isEditing
                                            ? <input type="number" value={item.unit_price} onChange={e => handleItemChange(i, 'unit_price', Number(e.target.value))} className="w-full p-1 rounded form-input text-xs text-right" />
                                            : `₹${item.unit_price.toFixed(2)}`}
                                    </td>
                                    <td className="py-2 pl-3 text-right font-semibold text-white">₹{item.total.toFixed(2)}</td>
                                    {isEditing && (
                                        <td className="py-2 pl-2 text-right">
                                            <button onClick={() => setEditedInvoice({ ...editedInvoice!, items: editedInvoice!.items.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-400">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {isEditing && (
                        <button onClick={() => setEditedInvoice({ ...editedInvoice!, items: [...editedInvoice!.items, { description: '', quantity: 1, unit_price: 0, total: 0 }] })}
                            className="flex items-center gap-1 text-xs btn-secondary px-3 py-1 rounded-lg mt-3">
                            <PlusIcon className="w-3.5 h-3.5" /> Add Item
                        </button>
                    )}
                </div>

                {/* Totals + Signature (side by side) */}
                <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-t border-primary-500/10 pt-4">

                    {/* Signature */}
                    <div className="text-center order-2 sm:order-1">
                        <div className="w-44 h-12 border-b-2 border-white/25 mb-1"></div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Authorised Signatory</p>
                        <p className="text-xs font-bold text-white/70">For JANU MOTORS</p>
                    </div>

                    {/* Totals */}
                    <div className="w-full sm:w-64 space-y-1 order-1 sm:order-2 text-xs">
                        <div className="flex justify-between text-white/65">
                            <span>Subtotal</span>
                            <span>₹{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/65">
                            <span>CGST ({CGST_RATE}%)</span>
                            <span>₹{cgstAmt.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/65">
                            <span>SGST ({SGST_RATE}%)</span>
                            <span>₹{sgstAmt.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/60 items-center">
                            <span>Discount</span>
                            {isEditing
                                ? <input type="number" value={invoice.discount || 0} onChange={e => setEditedInvoice({ ...invoice, discount: Number(e.target.value) })} className="w-20 p-1 rounded form-input text-xs text-right" />
                                : <span>-₹{(invoice.discount || 0).toFixed(2)}</span>}
                        </div>
                        <div className="flex justify-between font-bold text-base text-primary-400 border-t-2 border-primary-500/20 pt-2">
                            <span>Total Due</span>
                            <span>₹{displayTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-4 text-center text-xs text-white/30">
                    Payment due within 30 days · Thank you for choosing Janu Motors!
                </p>
            </div>
        </div>
    );
};

export default InvoiceDetail;
