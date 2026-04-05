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
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const rightEdge = pageWidth - margin;
    const contentWidth = pageWidth - margin * 2;
    const footerReserve = 22;

    const setFill = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
    const setDraw = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
    const setColor = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
    const bold = (size: number) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); };
    const normal = (size: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); };

    const ACCENT = [181, 137, 67] as [number, number, number];
    const CHARCOAL = [24, 31, 40] as [number, number, number];
    const INK = [31, 41, 55] as [number, number, number];
    const MUTED = [107, 114, 128] as [number, number, number];
    const BORDER = [221, 226, 232] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const SUCCESS = [22, 163, 74] as [number, number, number];
    const DANGER = [220, 38, 38] as [number, number, number];
    const WARNING = [217, 119, 6] as [number, number, number];

    const amountFormatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const formatCurrency = (value: number) => `INR ${amountFormatter.format(value)}`;
    const formatDiscount = (value: number) => value > 0 ? `-INR ${amountFormatter.format(value)}` : 'INR 0.00';
    const formatDate = (value?: string) => {
        if (!value) return 'Not set';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime())
            ? value
            : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const safeValue = (value?: string, fallback = 'Not provided') => value?.trim() || fallback;

    const cgst = invoice.subtotal * (CGST_RATE / 100);
    const sgst = invoice.subtotal * (SGST_RATE / 100);
    const total = invoice.subtotal + cgst + sgst - (invoice.discount || 0);

    let y = margin;
    const ensureSpace = (requiredHeight: number, nextPageY = 22) => {
        if (y + requiredHeight > pageHeight - footerReserve) {
            doc.addPage();
            y = nextPageY;
        }
    };

    let logoData: string | null = null;
    try {
        const resp = await fetch('/assets/logo.png');
        const blob = await resp.blob();
        logoData = await new Promise(resolve => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.readAsDataURL(blob);
        });
    } catch {
        logoData = null;
    }

    const drawCard = (x: number, top: number, width: number, title: string, primaryLines: string[], detailLines: string[]) => {
        const primaryHeight = primaryLines.length * 5.2;
        const detailHeight = detailLines.length * 4.6;
        const height = Math.max(28, 14 + primaryHeight + detailHeight + 8);

        setFill(...WHITE);
        doc.roundedRect(x, top, width, height, 3, 3, 'F');
        setDraw(...BORDER);
        doc.roundedRect(x, top, width, height, 3, 3, 'S');

        bold(8);
        setColor(...ACCENT);
        doc.text(title.toUpperCase(), x + 6, top + 8);

        let lineY = top + 15;
        bold(10.5);
        setColor(...INK);
        primaryLines.forEach(line => {
            doc.text(line, x + 6, lineY);
            lineY += 5.2;
        });

        normal(8.5);
        setColor(...MUTED);
        lineY += 1;
        detailLines.forEach(line => {
            doc.text(line, x + 6, lineY);
            lineY += 4.6;
        });

        return height;
    };

    const headerHeight = 42;
    setFill(...CHARCOAL);
    doc.roundedRect(margin, y, contentWidth, headerHeight, 4, 4, 'F');
    setFill(...ACCENT);
    doc.roundedRect(margin, y, contentWidth, 3.5, 4, 4, 'F');

    if (logoData) {
        doc.addImage(logoData, 'PNG', margin + 6, y + 8, 16, 16);
    }

    bold(18);
    setColor(...WHITE);
    doc.text('JANU MOTORS', margin + 26, y + 13);

    normal(8.5);
    setColor(208, 214, 222);
    doc.text('Opposite Sitara Gardens, Tilak Nagar, Kadapa', margin + 26, y + 20);
    doc.text('Ph: +91 98765 43210', margin + 26, y + 25.5);
    doc.text('GSTIN: 37XXXXX0000X1XX', margin + 26, y + 31);

    const headerRightWidth = 58;
    const headerRightX = rightEdge - headerRightWidth;
    const headerRightInnerLeft = headerRightX + 4;
    const headerRightInnerRight = rightEdge - 4;

    bold(22);
    setColor(...ACCENT);
    doc.text('INVOICE', headerRightInnerRight, y + 13, { align: 'right' });

    const statusColor =
        invoice.payment_status === PaymentStatus.PAID ? SUCCESS :
        invoice.payment_status === PaymentStatus.UNPAID ? DANGER : WARNING;
    const statusLabel = invoice.payment_status.toUpperCase();
    bold(7.5);
    const badgeWidth = doc.getTextWidth(statusLabel) + 12;
    setFill(...statusColor);
    doc.roundedRect(headerRightInnerRight - badgeWidth, y + 17, badgeWidth, 6.5, 3.25, 3.25, 'F');
    setColor(...WHITE);
    doc.text(statusLabel, headerRightInnerRight - badgeWidth / 2, y + 21.2, { align: 'center' });

    normal(7.2);
    setColor(208, 214, 222);
    doc.text('INVOICE NO', headerRightInnerLeft, y + 29.5);

    const headerInvoiceLines = doc.splitTextToSize(invoice.id, headerRightWidth - 8);
    bold(8.4);
    setColor(...WHITE);
    doc.text(headerInvoiceLines, headerRightInnerLeft, y + 34.5);

    y += headerHeight + 8;

    const metaGap = 6;
    const metaWidth = (contentWidth - metaGap) / 2;
    const metaHeight = 20;
    const metaItems: Array<[string, string]> = [
        ['Job Card', invoice.job_card_id],
        ['Issue Date', formatDate(invoice.issue_date)],
    ];

    metaItems.forEach(([label, value], index) => {
        const x = margin + index * (metaWidth + metaGap);
        setFill(...WHITE);
        doc.roundedRect(x, y, metaWidth, metaHeight, 2.5, 2.5, 'F');
        setDraw(...BORDER);
        doc.roundedRect(x, y, metaWidth, metaHeight, 2.5, 2.5, 'S');
        setFill(...ACCENT);
        doc.rect(x, y, metaWidth, 1.4, 'F');

        normal(7.5);
        setColor(...MUTED);
        doc.text(label.toUpperCase(), x + 4, y + 7);

        bold(9);
        setColor(...INK);
        const valueLines = doc.splitTextToSize(value, metaWidth - 8).slice(0, 2);
        doc.text(valueLines, x + 4, y + 13);
    });

    y += metaHeight + 8;

    const cardGap = 6;
    const leftCardWidth = contentWidth * 0.56;
    const rightCardWidth = contentWidth - leftCardWidth - cardGap;
    const customerPrimary = doc.splitTextToSize(safeValue(customer?.name, 'Walk-in Customer'), leftCardWidth - 12);
    const customerDetails = [
        ...doc.splitTextToSize(safeValue(customer?.phone, 'Phone not provided'), leftCardWidth - 12),
        ...doc.splitTextToSize(safeValue(customer?.email, 'Email not provided'), leftCardWidth - 12),
        ...doc.splitTextToSize(safeValue(customer?.address, 'Address not provided'), leftCardWidth - 12),
    ];
    const vehiclePrimary = doc.splitTextToSize(
        vehicle ? `${vehicle.make} ${vehicle.model}`.trim() : 'Vehicle not linked',
        rightCardWidth - 12
    );
    const vehicleDetails = [
        ...doc.splitTextToSize(
            vehicle?.license_plate ? `Registration: ${vehicle.license_plate}` : 'Registration: Not provided',
            rightCardWidth - 12
        ),
        ...(vehicle?.year ? doc.splitTextToSize(`Model Year: ${vehicle.year}`, rightCardWidth - 12) : []),
        ...doc.splitTextToSize(`Service Ref: ${invoice.job_card_id}`, rightCardWidth - 12),
    ];

    const billToHeight = drawCard(margin, y, leftCardWidth, 'Bill To', customerPrimary, customerDetails);
    const vehicleCardHeight = drawCard(
        margin + leftCardWidth + cardGap,
        y,
        rightCardWidth,
        'Vehicle & Service',
        vehiclePrimary,
        vehicleDetails
    );

    y += Math.max(billToHeight, vehicleCardHeight) + 10;

    bold(9);
    setColor(...ACCENT);
    doc.text('SERVICE BREAKDOWN', margin, y);
    normal(8);
    setColor(...MUTED);
    doc.text('Itemized labor and parts billed for this job', margin, y + 4.5);
    y += 8;

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin, bottom: footerReserve },
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: invoice.items.map((item, i) => [
            String(i + 1),
            item.description,
            String(item.quantity),
            formatCurrency(item.unit_price),
            formatCurrency(item.total),
        ]),
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 8.6,
            textColor: INK,
            lineColor: BORDER,
            lineWidth: 0.2,
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
            overflow: 'linebreak',
            valign: 'middle',
        },
        headStyles: {
            fillColor: CHARCOAL,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 8.2,
            halign: 'left',
            cellPadding: { top: 4.2, bottom: 4.2, left: 4, right: 4 },
        },
        bodyStyles: {
            textColor: INK,
        },
        alternateRowStyles: {
            fillColor: [250, 248, 244],
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 34, halign: 'right' },
            4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
        },
        rowPageBreak: 'avoid',
    });

    const tableState = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
    y = (tableState.lastAutoTable?.finalY || y) + 10;

    const summaryWidth = 78;
    const notesWidth = contentWidth - summaryWidth - 8;
    const notesText = invoice.payment_status === PaymentStatus.PAID
        ? 'Payment has been received for this service. We appreciate your trust in Janu Motors.'
        : 'Payment is due within 30 days of the issue date. Please reference the invoice number when making payment.';
    const noteLines = doc.splitTextToSize(
        `${notesText}\nQuestions about this invoice? Contact Janu Motors at +91 98765 43210.`,
        notesWidth - 12
    );
    const notesHeight = Math.max(36, 18 + noteLines.length * 4.5 + 12);
    const summaryHeight = 48;

    ensureSpace(Math.max(notesHeight, summaryHeight) + 4);

    setFill(...WHITE);
    doc.roundedRect(margin, y, notesWidth, notesHeight, 3, 3, 'F');
    setDraw(...BORDER);
    doc.roundedRect(margin, y, notesWidth, notesHeight, 3, 3, 'S');

    bold(8);
    setColor(...ACCENT);
    doc.text('PAYMENT & NOTES', margin + 6, y + 8);

    normal(8.5);
    setColor(...MUTED);
    doc.text(noteLines, margin + 6, y + 14);

    const signLineY = y + notesHeight - 11;
    setDraw(184, 189, 194);
    doc.setLineWidth(0.35);
    doc.line(margin + 6, signLineY, margin + 56, signLineY);
    normal(8);
    setColor(...MUTED);
    doc.text('Authorised Signatory', margin + 6, signLineY + 4.5);

    const summaryX = margin + notesWidth + 8;
    setFill(...WHITE);
    doc.roundedRect(summaryX, y, summaryWidth, summaryHeight, 3, 3, 'F');
    setDraw(...BORDER);
    doc.roundedRect(summaryX, y, summaryWidth, summaryHeight, 3, 3, 'S');

    bold(8);
    setColor(...ACCENT);
    doc.text('AMOUNT SUMMARY', summaryX + 5, y + 8);

    const drawSummaryRow = (label: string, value: string, rowY: number) => {
        normal(8);
        setColor(...MUTED);
        doc.text(label, summaryX + 5, rowY);
        setColor(...INK);
        doc.text(value, summaryX + summaryWidth - 5, rowY, { align: 'right' });
    };

    drawSummaryRow('Subtotal', formatCurrency(invoice.subtotal), y + 15);
    drawSummaryRow(`CGST (${CGST_RATE}%)`, formatCurrency(cgst), y + 21);
    drawSummaryRow(`SGST (${SGST_RATE}%)`, formatCurrency(sgst), y + 27);
    drawSummaryRow('Discount', formatDiscount(invoice.discount || 0), y + 33);

    setFill(...CHARCOAL);
    doc.roundedRect(summaryX + 4, y + summaryHeight - 13, summaryWidth - 8, 9, 2, 2, 'F');
    bold(10);
    setColor(...WHITE);
    doc.text('Total Due', summaryX + 8, y + summaryHeight - 7);
    doc.text(formatCurrency(total), summaryX + summaryWidth - 8, y + summaryHeight - 7, { align: 'right' });

    const totalPages = doc.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        setDraw(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, rightEdge, pageHeight - 15);

        normal(7.5);
        setColor(...MUTED);
        doc.text('Thank you for choosing Janu Motors', margin, pageHeight - 9.5);
        doc.text('Opposite Sitara Gardens, Tilak Nagar, Kadapa', pageWidth / 2, pageHeight - 9.5, { align: 'center' });
        doc.text(`Page ${pageNumber} of ${totalPages}`, rightEdge, pageHeight - 9.5, { align: 'right' });
    }

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
