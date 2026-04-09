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

function numberToRealWords(amount: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((amount = Math.floor(amount)).toString().length > 9) return 'overflow';
    const n = ('000000000' + amount).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() ? str.trim() + ' Rupees Only' : 'Zero Rupees Only';
}

async function buildInvoicePDF(
    invoice: Invoice,
    customer: Customer | undefined,
    vehicle: Vehicle | undefined
) {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 10; 

    const safeValue = (value?: string, fallback = '') => value?.trim() || fallback;
    const formatDate = (value?: string) => {
        if (!value) return '';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime())
            ? value
            : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    };

    const amountFormatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false
    });
    const formatAmt = (val: number) => amountFormatter.format(val);

    const getLocalImageAsset = async (path: string) => {
        try {
            const res = await fetch(path);
            const blob = await res.blob();
            return await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    };

    const bankQr = await getLocalImageAsset('/assets/bankqr.jpeg');
    const reviewQr = await getLocalImageAsset('/assets/reviewqr.png');

    let totalGross = invoice.subtotal;
    const discountInc = invoice.discount || 0;
    const payableTotal = totalGross - discountInc;
    
    let preTaxTotal = payableTotal / (1 + (CGST_RATE + SGST_RATE) / 100);
    const totalTax = payableTotal - preTaxTotal;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    
    const baseTotalBeforeDiscount = totalGross / (1 + (CGST_RATE + SGST_RATE) / 100);
    const baseDiscount = discountInc / (1 + (CGST_RATE + SGST_RATE) / 100);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    
    let y = m;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GSTIN : 37CZXXPB7686K2Z9', m + 2, y + 5);
    doc.text('TAX INVOICE', pw / 2, y + 5, { align: 'center' });
    doc.text('Cell : 8885333003', pw - m - 2, y + 5, { align: 'right' });
    
    y += 7;
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text('JANU MOTORS', pw / 2, y + 8, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('D.No. 38/5001-17, Kadapa to Bellary Road, Opp. Sitara Hotel, Tilak Nagar', pw/2, y + 14, { align: 'center' });
    doc.text('Y.S.R. Kadapa Dist, A.P.', pw/2, y + 19, { align: 'center' });
    
    y += 22;
    const headerBottomY = y;
    doc.rect(m, m, pw - m*2, headerBottomY - m);
    
    let detailsHeight = 18;
    doc.rect(m, y, pw - m*2, detailsHeight);
    doc.line(pw / 2, y, pw / 2, y + detailsHeight);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const custName = safeValue(customer?.name, 'Walking Customer');
    const custAddr = safeValue(customer?.address, '');
    const custPhone = safeValue(customer?.phone, '');
    
    doc.text(`Name      : ${custName}`, m + 4, y + 5);
    doc.text(`Address   : ${custAddr}`, m + 4, y + 10);
    doc.text(`State       : 37`, m + 4, y + 15);
    
    doc.text(`Invoice No. : ${invoice.id}`, pw/2 + 4, y + 5);
    doc.text(`Date of Issue : ${formatDate(invoice.issue_date)}`, pw/2 + 4, y + 10);
    doc.text(`Customer Mobile: ${custPhone}`, pw/2 + 4, y + 15);
    
    y += detailsHeight;
    
    const tableX = [
        m,
        m + 10,
        m + 82,
        m + 100,
        m + 116,
        m + 128,
        m + 150,
        m + 170,
        pw - m
    ];
    const headerHeightRow = 8;

    doc.rect(tableX[0], y, tableX[8] - tableX[0], headerHeightRow);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('No.', (tableX[0] + tableX[1]) / 2, y + 5, { align: 'center' });
    doc.text('Description', tableX[1] + 2, y + 5, { align: 'left' });
    doc.text('HSN Code', (tableX[2] + tableX[3]) / 2, y + 5, { align: 'center' });
    doc.text('GST %', (tableX[3] + tableX[4]) / 2, y + 5, { align: 'center' });
    doc.text('Qty', (tableX[4] + tableX[5]) / 2, y + 5, { align: 'center' });
    doc.text('Price', (tableX[5] + tableX[6]) / 2, y + 5, { align: 'center' });
    doc.text('GST', (tableX[6] + tableX[7]) / 2, y + 5, { align: 'center' });
    doc.text('Total', (tableX[7] + tableX[8]) / 2, y + 5, { align: 'center' });
    doc.setFontSize(9);

    tableX.slice(1).forEach(vx => doc.line(vx, y, vx, y + headerHeightRow));

    y += headerHeightRow;
    const bY = ph - 100;
    doc.rect(tableX[0], y, tableX[8] - tableX[0], bY - y);
    tableX.slice(1).forEach(vx => doc.line(vx, y, vx, bY));

    let iy = y + 6;
    invoice.items.forEach((item, index) => {
        const baseRate = item.unit_price / (1 + (CGST_RATE + SGST_RATE) / 100);
        const gstAmount = item.unit_price - baseRate;
        const itemGstTotal = gstAmount * item.quantity;
        const itemTotalWithGst = item.unit_price * item.quantity;
        const hsnCode = safeValue((item as any).hsn || (item as any).hsn_code, '');
        const gstRateLabel = `${CGST_RATE + SGST_RATE}%`;

        doc.text(String(index + 1), (tableX[0] + tableX[1]) / 2, iy, { align: 'center' });
        doc.text(doc.splitTextToSize(item.description, tableX[2] - tableX[1] - 4)[0] || '', tableX[1] + 2, iy, { align: 'left' });
        doc.text(hsnCode, (tableX[2] + tableX[3]) / 2, iy, { align: 'center' });
        doc.text(gstRateLabel, (tableX[3] + tableX[4]) / 2, iy, { align: 'center' });
        doc.text(String(item.quantity), (tableX[4] + tableX[5]) / 2, iy, { align: 'center' });
        doc.text(formatAmt(item.unit_price), tableX[6] - 2, iy, { align: 'right' });
        doc.text(formatAmt(itemGstTotal), tableX[7] - 2, iy, { align: 'right' });
        doc.text(formatAmt(itemTotalWithGst), tableX[8] - 2, iy, { align: 'right' });
        iy += 8;
    });
    
    const rightColLeft = m + 128; 
    const amtVx = m + 166;
    const textRightAlign = m + 164;
    
    doc.rect(rightColLeft, bY, pw - m - rightColLeft, 7);
    doc.line(amtVx, bY, amtVx, bY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL AMOUNT', textRightAlign, bY + 5.2, { align: 'right' });
    doc.text(formatAmt(payableTotal), pw-m-2, bY + 5.2, { align: 'right' });
    
    let tY = bY + 7;
    doc.rect(rightColLeft, tY, pw - m - rightColLeft, 7);
    doc.line(amtVx, tY, amtVx, tY + 7);
    doc.text('DISCOUNT', textRightAlign, tY + 5.2, { align: 'right' });
    doc.text(baseDiscount > 0 ? formatAmt(baseDiscount) : '', pw-m-2, tY + 5.2, { align: 'right' });
    
    doc.rect(m, bY, rightColLeft - m, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const wordsStr = `Total Invoice Amount in Words : ${numberToRealWords(payableTotal)}`;
    const wordsLines = doc.splitTextToSize(wordsStr, rightColLeft - m - 8);
    // Draw the potentially multi-line string centered vertically depending on lines
    // For 1 line it's perfectly middle, for 2 lines it still fits inside 14mm height box
    doc.text(wordsLines, m + 4, bY + 7);
    
    const taxLabels = [
        { lbl: 'Total Amount Before Tax', val: preTaxTotal },
        { lbl: 'Add : CGST', val: cgst },
        { lbl: 'Add : SGST', val: sgst },
        { lbl: 'Add : IGST', val: 0 },
        { lbl: 'Total Tax Amount', val: totalTax },
        { lbl: 'Round off', val: payableTotal - (preTaxTotal + totalTax) },
        { lbl: 'Total Amount After Tax', val: payableTotal }
    ];
    
    let lY = tY + 7;
    taxLabels.forEach((row, i) => {
        doc.rect(rightColLeft, lY, pw - m - rightColLeft, 7);
        doc.line(amtVx, lY, amtVx, lY + 7);
        
        doc.setFont('helvetica', i===6 ? 'bold' : 'normal');
        doc.text(row.lbl, textRightAlign, lY + 5.2, { align: 'right' });
        doc.text(row.val === 0 && i===3 ? '' : formatAmt(row.val), pw-m-2, lY + 5.2, { align: 'right' });
        lY += 7;
    });
    
    doc.rect(m, tY + 7, rightColLeft - m, 49);
    
    let bLeftX = m + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BANK DETAILS', bLeftX, tY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Bank: State Bank of India', bLeftX + 2, tY + 19);
    doc.text('A/c No: 44823559046', bLeftX + 2, tY + 24);
    doc.text('IFSC Code: SBIN0010109', bLeftX + 2, tY + 29);
    
    if (bankQr) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('SCAN TO PAY', m + 70.5, tY + 12, { align: 'center' });
        doc.addImage(bankQr, 'PNG', m + 60, tY + 14, 21, 21);
    }
    if (reviewQr) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('RATE US', m + 98.5, tY + 12, { align: 'center' });
        doc.addImage(reviewQr, 'PNG', m + 88, tY + 14, 21, 21);
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.line(m, tY + 44, rightColLeft, tY + 44);
    doc.text('Certified that the particulars given above are true and correct', bLeftX, tY + 51);
    
    let botY = lY; 
    doc.rect(m, botY, pw - m*2, 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', m + 4, botY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Goods once sold cannot be taken back', m + 4, botY + 10);
    doc.text('Subject to Kadapa jurisdiction only', m + 4, botY + 14);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('For JANU MOTORS', pw - m - 26, botY + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signature', pw - m - 26, botY + 20, { align: 'center' });
    
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
            const total    = subtotal - (editedInvoice.discount || 0);
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

    const displayTotal = invoice.subtotal - (invoice.discount || 0);
    const baseTotalAfterDiscount = displayTotal / (1 + (CGST_RATE + SGST_RATE) / 100);
    const cgstAmt     = (displayTotal - baseTotalAfterDiscount) / 2;
    const sgstAmt     = cgstAmt;

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

    const handlePrint = async () => {
        setIsDownloading(true);
        try {
            const doc = await buildInvoicePDF(invoice, customer, vehicle);
            const blobUrl = doc.output('bloburi');
            const printWindow = window.open(blobUrl.toString());
            if (printWindow) {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            }
        } catch (err) {
            console.error(err);
            alert('Print preparation failed.');
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
                            <button onClick={handlePrint} disabled={isDownloading}
                                className="btn-luxury px-4 py-2 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50"
                                title="Print invoice">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.745h10.56m0 0v3.75m0-3.75v-1.972M6.72 13.745h-.75a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6a2.25 2.25 0 0 0-2.25-2.25h-.75m0 0V6a2.25 2.25 0 0 0-2.25-2.25H9.75a2.25 2.25 0 0 0-2.25 2.25v6.745m0 0H3.75A2.25 2.25 0 0 0 1.5 22.25v-6a2.25 2.25 0 0 1 2.25-2.25h.75m0 0h6m-9 6h6" />
                                </svg>
                                {isDownloading ? 'Preparing…' : 'Print'}
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
                        <div className="flex justify-between text-white/65"><span>Subtotal (Inclusive)</span><span>₹{invoice.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white/60 items-center">
                            <span>Discount</span>
                            {isEditing
                                ? <input type="number" value={invoice.discount || 0} onChange={e => setEditedInvoice({ ...invoice, discount: Number(e.target.value) })} className="w-20 p-1 rounded form-input text-xs text-right" />
                                : <span>-₹{(invoice.discount || 0).toFixed(2)}</span>}
                        </div>
                        <div className="flex justify-between text-white/40"><span className="text-[10px]">Tax Base (Pre-tax)</span><span className="text-[10px]">₹{baseTotalAfterDiscount.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white/50"><span className="text-[10px]">Included CGST ({CGST_RATE}%)</span><span className="text-[10px]">₹{cgstAmt.toFixed(2)}</span></div>
                        <div className="flex justify-between text-white/50"><span className="text-[10px]">Included SGST ({SGST_RATE}%)</span><span className="text-[10px]">₹{sgstAmt.toFixed(2)}</span></div>
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
