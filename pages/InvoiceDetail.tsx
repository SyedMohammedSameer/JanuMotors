import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, Invoice, InvoiceItem } from '../types';
import { ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CGST_RATE = 9;
const SGST_RATE = 9;
const GOLD = '#B8860B';
const GOLD_LIGHT = '#F5C518';

// ─── White paper invoice rendered off-screen for PDF capture ───────────────
const PrintInvoice = ({ invoice, customer, vehicle }: {
    invoice: Invoice;
    customer: any;
    vehicle: any;
}) => {
    const cgstAmt = invoice.subtotal * (CGST_RATE / 100);
    const sgstAmt = invoice.subtotal * (SGST_RATE / 100);
    const total   = invoice.subtotal + cgstAmt + sgstAmt - (invoice.discount || 0);

    const statusColor =
        invoice.payment_status === PaymentStatus.PAID    ? '#16a34a' :
        invoice.payment_status === PaymentStatus.UNPAID  ? '#dc2626' : '#d97706';

    const row = (label: string, value: string, bold = false, big = false, borderTop = false) => (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 0',
            borderTop: borderTop ? '2px solid #D4A017' : 'none',
            marginTop: borderTop ? '6px' : 0,
        }}>
            <span style={{ color: '#555', fontSize: big ? 14 : 12, fontWeight: bold ? 700 : 400 }}>{label}</span>
            <span style={{ color: bold ? '#111' : '#444', fontSize: big ? 16 : 12, fontWeight: bold ? 700 : 500 }}>{value}</span>
        </div>
    );

    return (
        <div id="invoice-pdf" style={{
            position: 'fixed', left: '-9999px', top: 0,
            width: 794, background: '#fff', fontFamily: 'Arial, sans-serif',
            padding: '48px 52px', boxSizing: 'border-box', color: '#222',
        }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 20, borderBottom: `3px solid ${GOLD}` }}>
                {/* Left: company */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img src="/assets/logo.png" alt="JANU MOTORS" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#111', letterSpacing: 1 }}>JANU MOTORS</div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Opposite Sitara Gardens, Tilak Nagar, Kadapa</div>
                        <div style={{ fontSize: 11, color: '#666' }}>Ph: +91 98765 43210</div>
                        <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace', marginTop: 2 }}>GSTIN: 37XXXXX0000X1XX</div>
                    </div>
                </div>

                {/* Right: invoice meta */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: GOLD, letterSpacing: 3, textTransform: 'uppercase' }}>Invoice</div>
                    <div style={{ fontSize: 11, color: '#777', fontFamily: 'monospace', marginTop: 2 }}>{invoice.id}</div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>Issue Date</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{invoice.issue_date}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>Due Date</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{invoice.due_date}</div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: 8, display: 'inline-block',
                        padding: '3px 12px', borderRadius: 20,
                        border: `1px solid ${statusColor}`,
                        color: statusColor, fontSize: 11, fontWeight: 700,
                    }}>
                        {invoice.payment_status}
                    </div>
                </div>
            </div>

            {/* ── Bill To / Vehicle / Job Card ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #e5e7eb' }}>
                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Bill To</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{customer?.name || '—'}</div>
                    {customer?.phone    && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{customer.phone}</div>}
                    {customer?.email    && <div style={{ fontSize: 11, color: '#555' }}>{customer.email}</div>}
                    {customer?.address  && <div style={{ fontSize: 11, color: '#777', marginTop: 3 }}>{customer.address}</div>}
                </div>
                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Vehicle Details</div>
                    {vehicle ? (
                        <>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{vehicle.make} {vehicle.model}</div>
                            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                                Reg No: <span style={{ fontWeight: 700, color: '#222' }}>{vehicle.license_plate}</span>
                            </div>
                            {vehicle.year && <div style={{ fontSize: 11, color: '#777' }}>Year: {vehicle.year}</div>}
                            {vehicle.vin  && <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace', marginTop: 2 }}>VIN: {vehicle.vin}</div>}
                        </>
                    ) : <div style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>Not linked</div>}
                </div>
                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Job Card Ref</div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#444' }}>{invoice.job_card_id}</div>
                </div>
            </div>

            {/* ── Items Table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                <thead>
                    <tr style={{ background: '#1a1a1a' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left',   color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Description</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 60 }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right',  color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 110 }}>Unit Price</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right',  color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 110 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#222' }}>{item.description}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#555', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#555', textAlign: 'right' }}>₹{item.unit_price.toFixed(2)}</td>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: '#222', fontWeight: 600, textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ── Totals + Signature ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, paddingTop: 4 }}>

                {/* Signature */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 180, height: 52, borderBottom: '2px solid #999', marginBottom: 6 }}></div>
                    <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Authorised Signatory</div>
                    <div style={{ fontSize: 11, color: '#333', fontWeight: 700, marginTop: 2 }}>For JANU MOTORS</div>
                </div>

                {/* Totals box */}
                <div style={{ width: 240, background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px' }}>
                    {row('Subtotal',              `₹${invoice.subtotal.toFixed(2)}`)}
                    {row(`CGST (${CGST_RATE}%)`,  `₹${cgstAmt.toFixed(2)}`)}
                    {row(`SGST (${SGST_RATE}%)`,  `₹${sgstAmt.toFixed(2)}`)}
                    {row('Discount',              `-₹${(invoice.discount || 0).toFixed(2)}`)}
                    {row('Total Due',             `₹${total.toFixed(2)}`, true, true, true)}
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 10, color: '#999' }}>
                Payment is due within 30 days of invoice date &nbsp;·&nbsp; Thank you for choosing Janu Motors!
            </div>
        </div>
    );
};

// ─── Main component ─────────────────────────────────────────────────────────
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
            const total = subtotal + taxAmount - (editedInvoice.discount || 0);
            setEditedInvoice(prev => prev ? {
                ...prev, subtotal, total, tax: CGST_RATE + SGST_RATE,
                items: prev.items.map(item => ({ ...item, total: item.quantity * item.unit_price }))
            } : null);
        }
    }, [isEditing, editedInvoice?.items, editedInvoice?.discount]);

    if (!originalInvoice) return <Navigate to="/invoices" replace />;
    const invoice  = isEditing && editedInvoice ? editedInvoice : originalInvoice;
    if (!invoice) return null;

    const customer = state.customers.find(c => c.id === invoice.customer_id);
    const jobCard  = state.jobCards.find(jc => jc.id === invoice.job_card_id);
    const vehicle  = jobCard ? state.vehicles.find(v => v.id === jobCard.vehicle_id) : null;

    const cgstAmt    = invoice.subtotal * (CGST_RATE / 100);
    const sgstAmt    = invoice.subtotal * (SGST_RATE / 100);
    const displayTotal = invoice.subtotal + cgstAmt + sgstAmt - (invoice.discount || 0);

    const statusCls = (s: PaymentStatus) => ({
        [PaymentStatus.PAID]:    'bg-green-500/10 text-green-400 border-green-500/30',
        [PaymentStatus.UNPAID]:  'bg-red-500/10 text-red-400 border-red-500/30',
        [PaymentStatus.PARTIAL]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    }[s] ?? 'bg-white/10 text-white/60 border-white/30');

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) =>
        dispatch({ type: 'UPDATE_INVOICE', payload: { ...invoice, payment_status: e.target.value as PaymentStatus } });

    const handleSave = async () => {
        if (editedInvoice) { await dispatch({ type: 'UPDATE_INVOICE', payload: editedInvoice }); setIsEditing(false); }
    };

    const handleItemChange = (i: number, field: keyof InvoiceItem, value: string | number) => {
        if (!editedInvoice) return;
        const items = [...editedInvoice.items];
        (items[i] as any)[field] = value;
        setEditedInvoice({ ...editedInvoice, items });
    };

    // PDF is generated from the hidden white PrintInvoice element
    const handleDownloadPdf = () => {
        const el = document.getElementById('invoice-pdf');
        if (!el) return;
        setIsDownloading(true);
        html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pw = pdf.internal.pageSize.getWidth();
                const ph = pdf.internal.pageSize.getHeight();
                const ratio = Math.min((pw - 10) / canvas.width, (ph - 10) / canvas.height);
                const x = (pw - canvas.width * ratio) / 2;
                pdf.addImage(imgData, 'PNG', x, 5, canvas.width * ratio, canvas.height * ratio);
                pdf.save(`Invoice-${invoice.id}.pdf`);
                setIsDownloading(false);
            })
            .catch(() => { setIsDownloading(false); alert('PDF generation failed.'); });
    };

    return (
        <div className="space-y-4 animate-fade-in">

            {/* Hidden white invoice used only for PDF generation */}
            <PrintInvoice invoice={invoice} customer={customer} vehicle={vehicle} />

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap justify-between items-center gap-3 print:hidden">
                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {!isEditing ? (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-white/60">Status:</label>
                                <select value={invoice.payment_status} onChange={handleStatusChange}
                                    className={`rounded-lg border-transparent px-3 py-1.5 text-sm font-semibold ${statusCls(invoice.payment_status)}`}>
                                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={handleDownloadPdf} disabled={isDownloading} className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50">
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                {isDownloading ? 'Generating…' : 'Download PDF'}
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

            {/* ── Dark app invoice card (screen view) ── */}
            <div className="card-luxury p-6 sm:p-8 text-sm">

                {/* Header */}
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
                        <div className={`mt-2 inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${statusCls(invoice.payment_status)}`}>
                            {invoice.payment_status}
                        </div>
                    </div>
                </div>

                {/* Bill To / Vehicle / Job Ref */}
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-primary-500/10 text-xs">
                    <div>
                        <p className="font-bold text-primary-500 uppercase tracking-wider mb-1">Bill To</p>
                        <p className="font-bold text-white text-sm">{customer?.name || '—'}</p>
                        {customer?.phone   && <p className="text-white/65">{customer.phone}</p>}
                        {customer?.email   && <p className="text-white/65">{customer.email}</p>}
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

                {/* Items */}
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

                {/* Totals + Signature */}
                <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-t border-primary-500/10 pt-4">
                    <div className="text-center order-2 sm:order-1">
                        <div className="w-44 h-12 border-b-2 border-white/25 mb-1"></div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Authorised Signatory</p>
                        <p className="text-xs font-bold text-white/70">For JANU MOTORS</p>
                    </div>
                    <div className="w-full sm:w-64 space-y-1 order-1 sm:order-2 text-xs">
                        <div className="flex justify-between text-white/65"><span>Subtotal</span><span>₹{invoice.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white/65"><span>CGST ({CGST_RATE}%)</span><span>₹{cgstAmt.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white/65"><span>SGST ({SGST_RATE}%)</span><span>₹{sgstAmt.toFixed(2)}</span></div>
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

                <p className="mt-4 text-center text-xs text-white/30">
                    Payment due within 30 days · Thank you for choosing Janu Motors!
                </p>
            </div>
        </div>
    );
};

export default InvoiceDetail;
