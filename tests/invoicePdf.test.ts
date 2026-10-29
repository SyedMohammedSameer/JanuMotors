import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInvoicePDF } from '../pages/InvoiceDetail';
import { customer, invoice, vehicle } from './fixtures';

// The QR images are fetched by URL; fail the fetch so the builder simply skips them (it handles that case).
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network in tests')));
});

const invoiceData = invoice({
    id: 'INV1795000000000', issue_date: '2026-10-28', subtotal: 5900, discount: 0, total: 5900,
    items: [{ description: 'Labor', quantity: 2, unit_price: 500, total: 1000 }],
});

// jsPDF writes each text run as "(text) Tj" in the page stream, so the PDF text can be searched as a string.
const pdfText = async (cust: any, veh: any) => {
    const doc = await buildInvoicePDF(invoiceData as any, cust, veh);
    return doc.output() as string;
};

describe('Invoice PDF: customer details box', () => {
    it('shows Name, Model Name and Number (vehicle model and registration number)', async () => {
        const text = await pdfText(
            customer({ name: 'Rahul Sharma' }),
            vehicle({ make: 'Toyota', model: 'Innova', license_plate: 'AP 04 AB 1234' })
        );
        expect(text).toContain('(Name) Tj');
        expect(text).toContain('(: Rahul Sharma) Tj');
        expect(text).toContain('(Model Name) Tj');
        expect(text).toContain('(: Toyota Innova) Tj');
        expect(text).toContain('(Number) Tj');
        expect(text).toContain('(: AP 04 AB 1234) Tj');
    });

    it('no longer prints the customer address or a State line', async () => {
        const text = await pdfText(customer({ address: '12 MG Road, Kadapa' }), vehicle());
        expect(text).not.toContain('Address');
        expect(text).not.toContain('State');
        expect(text).not.toContain('12 MG Road');
    });

    it('still prints the invoice number, issue date and customer mobile on the right', async () => {
        const text = await pdfText(customer({ phone: '9848000000' }), vehicle());
        expect(text).toContain('Invoice No. : INV1795000000000');
        expect(text).toContain('Date of Issue : 28-10-2026');
        expect(text).toContain('Customer Mobile: 9848000000');
    });

    it('does not fail when the job has no vehicle; the vehicle fields are simply empty', async () => {
        const text = await pdfText(customer(), undefined);
        expect(text).toContain('(Model Name) Tj');
        expect(text).toContain('(Number) Tj');
        expect(text).toContain('(: ) Tj');
    });

    it('keeps a very long model name inside its box by cutting it with "..."', async () => {
        const longModel = 'Scorpio-N Z8 Select Diesel 4x4 Automatic Premium Edition 2024 Limited Run';
        const text = await pdfText(customer(), vehicle({ make: 'Mahindra & Mahindra', model: longModel }));
        expect(text).not.toContain(longModel);
        expect(text).toMatch(/\(: Mahindra & Mahindra [^)]*\.\.\.\) Tj/);
    });

    it('ignores blank parts of the model name', async () => {
        const text = await pdfText(customer(), vehicle({ make: '  ', model: 'Swift Dzire' }));
        expect(text).toContain('(: Swift Dzire) Tj');
    });
});
