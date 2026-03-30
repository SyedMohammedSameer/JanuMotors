import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PaymentStatus, Invoice, InvoiceItem, Customer, Vehicle } from '../types';
import { ArrowDownTrayIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CGST_RATE = 9;
const SGST_RATE = 9;

// ─── Pure jsPDF invoice builder (no screenshots) ────────────────────────────
async function buildInvoicePDF(
    invoice: Invoice,
    customer: Customer | undefined,
    vehicle: Vehicle | undefined
) {
    const doc  = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const W    = doc.internal.pageSize.getWidth();   // 210
    const M    = 14; // margin
    const RX   = W - M; // right edge

    // colour helpers
    const setFill   = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
    const setDraw   = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
    const setColor  = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
    const bold      = (size: number) => { doc.setFont('helvetica', 'bold');   doc.setFontSize(size); };
    const normal    = (size: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); };

    const GOLD   = [184, 134, 11]  as [number,number,number];
    const BLACK  = [20,  20,  20]  as [number,number,number];
    const DARK   = [50,  50,  50]  as [number,number,number];
    const GREY   = [110, 110, 110] as [number,number,number];
    const LGREY  = [230, 230, 230] as [number,number,number];
    const WHITE  = [255, 255, 255] as [number,number,number];
    const GREEN  = [22, 163, 74]   as [number,number,number];
    const RED    = [220, 38, 38]   as [number,number,number];
    const AMBER  = [217, 119, 6]   as [number,number,number];

    const cgst  = invoice.subtotal * (CGST_RATE / 100);
    const sgst  = invoice.subtotal * (SGST_RATE / 100);
    const total = invoice.subtotal + cgst + sgst - (invoice.discount || 0);

    // ── Top colour bar ──────────────────────────────────────────────────────
    setFill(20, 20, 20);
    doc.rect(0, 0, W, 38, 'F');

    // Logo (load from public assets)
    try {
        const resp = await fetch('/assets/logo.png');
        const blob = await resp.blob();
        const b64: string = await new Promise(res => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.readAsDataURL(blob);
        });
        doc.addImage(b64, 'PNG', M, 7, 22, 22);
    } catch { /* logo unavailable, skip */ }

    // Company name
    bold(16);
    setColor(...WHITE);
    doc.text('JANU MOTORS', M + 26, 16);

    normal(8);
    setColor(190, 190, 190);
    doc.text('Opposite Sitara Gardens, Tilak Nagar, Kadapa', M + 26, 22);
    doc.text('Ph: +91 98765 43210   |   GSTIN: 37XXXXX0000X1XX', M + 26, 27);

    // INVOICE title (top-right)
    bold(28);
    setColor(...GOLD);
    doc.text('INVOICE', RX, 18, { align: 'right' });

    normal(8);
    setColor(190, 190, 190);
    doc.text(invoice.id, RX, 25, { align: 'right' });
    doc.text(`Issued: ${invoice.issue_date}   Due: ${invoice.due_date}`, RX, 31, { align: 'right' });

    // Status badge
    const statusColor =
        invoice.payment_status === PaymentStatus.PAID    ? GREEN :
        invoice.payment_status === PaymentStatus.UNPAID  ? RED   : AMBER;
    setFill(...statusColor);
    const sLabel = invoice.payment_status.toUpperCase();
    bold(7);
    const sW = doc.getTextWidth(sLabel) + 6;
    doc.roundedRect(RX - sW, 33, sW, 5, 1, 1, 'F');
    setColor(...WHITE);
    doc.text(sLabel, RX - sW / 2, 36.5, { align: 'center' });

    let y = 46;

    // ── Bill To / Vehicle / Job Ref ─────────────────────────────────────────
    const col1 = M;
    const col2 = M + 62;
    const col3 = M + 124;

    bold(7);
    setColor(...GOLD);
    doc.text('BILL TO',       col1, y);
    doc.text('VEHICLE',       col2, y);
    doc.text('JOB CARD REF',  col3, y);

    y += 5;

    bold(10);
    setColor(...BLACK);
    doc.text(customer?.name  || '—',                     col1, y);
    doc.text(`${vehicle?.make || ''} ${vehicle?.model || ''}`.trim() || '—', col2, y);

    normal(8);
    setColor(...DARK);
    doc.text(invoice.job_card_id, col3, y + 1);

    y += 5;
    normal(8);
    setColor(...GREY);
    if (customer?.phone)   doc.text(customer.phone,   col1, y);
    if (vehicle?.license_plate) {
        doc.text(`Reg No: `, col2, y);
        bold(8); setColor(...DARK);
        doc.text(vehicle.license_plate, col2 + doc.getTextWidth('Reg No: '), y);
        normal(8); setColor(...GREY);
    }
    y += 4.5;
    if (customer?.email)   doc.text(customer.email,   col1, y);
    if (vehicle?.year)     doc.text(`Year: ${vehicle.year}`, col2, y);
    y += 4.5;
    if (customer?.address) {
        const lines = doc.splitTextToSize(customer.address, 55);
        doc.text(lines, col1, y);
    }

    y += 10;

    // ── Items Table ─────────────────────────────────────────────────────────
    autoTable(doc, {
        startY: y,
        margin: { left: M, right: M },
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: invoice.items.map((item, i) => [
            String(i + 1),
            item.description,
            String(item.quantity),
            `₹${item.unit_price.toFixed(2)}`,
            `₹${item.total.toFixed(2)}`,
        ]),
        headStyles: {
            fillColor: [20, 20, 20],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'left',
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [40, 40, 40],
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
            0: { cellWidth: 8,  halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 14, halign: 'center' },
            3: { cellWidth: 28, halign: 'right' },
            4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2,
        theme: 'grid',
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ── Totals box (right side) ─────────────────────────────────────────────
    const boxW  = 70;
    const boxX  = RX - boxW;
    const lineH = 6.5;

    // box background
    setFill(250, 250, 250);
    setDraw(...LGREY);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, 44, 2, 2, 'FD');

    const tRow = (label: string, value: string, isBold = false, topLine = false) => {
        if (topLine) {
            setDraw(...GOLD);
            doc.setLineWidth(0.5);
            doc.line(boxX + 3, y + 1, boxX + boxW - 3, y + 1);
            y += 3;
        }
        if (isBold) { bold(10); setColor(...BLACK); }
        else        { normal(8); setColor(...DARK); }
        doc.text(label, boxX + 4, y + 4);
        doc.text(value, boxX + boxW - 4, y + 4, { align: 'right' });
        y += lineH;
    };

    tRow('Subtotal',           `₹${invoice.subtotal.toFixed(2)}`);
    tRow(`CGST (${CGST_RATE}%)`, `₹${cgst.toFixed(2)}`);
    tRow(`SGST (${SGST_RATE}%)`, `₹${sgst.toFixed(2)}`);
    tRow('Discount',           `-₹${(invoice.discount || 0).toFixed(2)}`);
    tRow('Total Due',          `₹${total.toFixed(2)}`, true, true);

    // ── Signature box (left side) ───────────────────────────────────────────
    const sigY  = y - (lineH * 5) + 20;  // align with totals box middle
    setDraw(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(M, sigY + 16, M + 50, sigY + 16);
    normal(8); setColor(...GREY);
    doc.text('Authorised Signatory', M, sigY + 20);
    bold(8);   setColor(...DARK);
    doc.text('For JANU MOTORS',      M, sigY + 25);

    y += 12;

    // ── Footer line ─────────────────────────────────────────────────────────
    setFill(20, 20, 20);
    doc.rect(0, 282, W, 15, 'F');
    normal(7.5);
    setColor(190, 190, 190);
    doc.text(
        'Payment is due within 30 days of invoice date   ·   Thank you for choosing Janu Motors!',
        W / 2, 291,
        { align: 'center' }
    );

    return doc;
}

// ─── Main component ──────────────────────────────────────────────────────────
const InvoiceDetail = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const { state, dispatch } = useAppContext();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const originalInvoice = useMemo(
        () => state.invoices.find(inv => inv.id === invoiceId),
        [state.invoices, invoiceId]
    );
    const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(
        originalInvoice ? JSON.parse(JSON.stringify(originalInvoice)) : null
    );

    useEffect(() => {
        if (isEditing && editedInvoice) {
            const subtotal = editedInvoice.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
            const total    = subtotal * (1 + (CGST_RATE + SGST_RATE) / 100) - (editedInvoice.discount || 0);
            setEditedInvoice(prev => prev ? {
                ...prev, subtotal, total, tax: CGST_RATE + SGST_RATE,
                items: prev.items.map(i => ({ ...i, total: i.quantity * i.unit_price }))
            } : null);
        }
    }, [isEditing, editedInvoice?.items, editedInvoice?.discount]);

    if (!originalInvoice) return <Navigate to="/invoices" replace />;
    const invoice  = isEditing && editedInvoice ? editedInvoice : originalInvoice;
    if (!invoice) return null;

    const customer = state.customers.find(c => c.id === invoice.customer_id);
    const jobCard  = state.jobCards.find(jc => jc.id === invoice.job_card_id);
    const vehicle  = jobCard ? state.vehicles.find(v => v.id === jobCard.vehicle_id) : undefined;

    const cgstAmt     = invoice.subtotal * (CGST_RATE / 100);
    const sgstAmt     = invoice.subtotal * (SGST_RATE / 100);
    const displayTotal = invoice.subtotal + cgstAmt + sgstAmt - (invoice.discount || 0);

    const statusCls = (s: PaymentStatus) => ({
        [PaymentStatus.PAID]:    'bg-green-500/10 text-green-400 border-green-500/30',
        [PaymentStatus.UNPAID]:  'bg-red-500/10 text-red-400 border-red-500/30',
        [PaymentStatus.PARTIAL]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    }[s] ?? 'bg-white/10 text-white/60 border-white/30');

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
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

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const doc = await buildInvoicePDF(invoice, customer, vehicle);
            doc.save(`Invoice-${invoice.id}.pdf`);
        } catch (err) {
            console.error(err);
            alert('PDF generation failed.');
        } finally {
            setIsDownloading(false);
        }
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
                                <select value={invoice.payment_status} onChange={handleStatusChange}
                                    className={`rounded-lg border-transparent px-3 py-1.5 text-sm font-semibold ${statusCls(invoice.payment_status)}`}>
                                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={handleDownloadPdf} disabled={isDownloading}
                                className="btn-luxury px-4 py-2 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50">
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                {isDownloading ? 'Generating…' : 'Download PDF'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setIsEditing(false); setEditedInvoice(JSON.parse(JSON.stringify(originalInvoice))); }}
                                className="btn-secondary px-4 py-2 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleSave} className="btn-luxury px-4 py-2 rounded-xl text-sm">Save</button>
                        </>
                    )}
                </div>
            </div>

            {/* Screen card */}
            <div className="card-luxury p-6 sm:p-8 text-sm">

                {/* Header */}
                <div className="flex justify-between items-start gap-4 pb-5 border-b-2 border-primary-500/20">
                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="JANU MOTORS" className="h-14 w-14 rounded-xl flex-shrink-0" />
                        <div>
                            <p className="text-xl font-extrabold text-white tracking-wide">JANU MOTORS</p>
                            <p className="text-xs text-white/55">Opposite Sitara Gardens, Tilak Nagar, Kadapa</p>
                            <p className="text-xs text-white/55">Ph: +91 98765 43210</p>
                            <p className="text-xs text-white/40 font-mono">GSTIN: 37XXXXX0000X1XX</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-black text-primary-400 uppercase tracking-widest">Invoice</p>
                        <p className="text-white/50 font-mono text-xs mt-0.5">{invoice.id}</p>
                        <div className="flex justify-end gap-5 mt-2">
                            <div><p className="text-xs text-white/40 uppercase">Issued</p><p className="text-white text-xs font-medium">{invoice.issue_date}</p></div>
                            <div><p className="text-xs text-white/40 uppercase">Due</p><p className="text-white text-xs font-medium">{invoice.due_date}</p></div>
                        </div>
                        <span className={`mt-2 inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${statusCls(invoice.payment_status)}`}>
                            {invoice.payment_status}
                        </span>
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
                                <th className="pb-2 pr-3 text-left">#</th>
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
                                    <td className="py-2 pr-3 text-white/40">{i + 1}</td>
                                    <td className="py-2 pr-3 text-white">
                                        {isEditing ? <input type="text" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} className="w-full p-1 rounded form-input text-xs" /> : item.description}
                                    </td>
                                    <td className="py-2 px-3 text-center text-white/80">
                                        {isEditing ? <input type="number" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', Number(e.target.value))} className="w-full p-1 rounded form-input text-xs text-center" /> : item.quantity}
                                    </td>
                                    <td className="py-2 px-3 text-right text-white/80">
                                        {isEditing ? <input type="number" value={item.unit_price} onChange={e => handleItemChange(i, 'unit_price', Number(e.target.value))} className="w-full p-1 rounded form-input text-xs text-right" /> : `₹${item.unit_price.toFixed(2)}`}
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
