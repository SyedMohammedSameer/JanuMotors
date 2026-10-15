import { JobStatus, PaymentStatus } from '../types';

export const customer = (over: Record<string, unknown> = {}) => ({
    id: 'c1', name: 'Rahul Sharma', phone: '+91 9848000000', email: 'rahul@example.com', address: '12 MG Road, Kadapa',
    communication_log: [], service_history: [], created_at: '2026-01-01T00:00:00.000Z', ...over,
});

export const vehicle = (over: Record<string, unknown> = {}) => ({
    id: 'v1', make: 'Toyota', model: 'Innova', year: 2019, vin: 'MA3EJKD1S00123456', license_plate: 'AP 04 AB 1234', owner_id: 'c1', ...over,
});

export const worker = (over: Record<string, unknown> = {}) => ({ id: 'w1', name: 'Ramesh Kumar', role: 'Mechanic', ...over });

export const inventoryItem = (over: Record<string, unknown> = {}) => ({
    id: 'i1', name: 'Engine Oil 5W-30', sku: 'OIL-5W30', quantity: 10, low_stock_threshold: 4, price: 2450, supplier: 'Castrol', ...over,
});

export const jobCard = (over: Record<string, unknown> = {}) => ({
    id: 'J1', customer_id: 'c1', vehicle_id: 'v1', assigned_to: 'w1', description: 'Full service', status: JobStatus.PENDING,
    parts_used: [], labor_hours: 0, created_at: '2026-10-01T10:00:00.000Z', ...over,
});

export const invoice = (over: Record<string, unknown> = {}) => ({
    id: 'INV1', job_card_id: 'J1', customer_id: 'c1', issue_date: '2026-09-01', due_date: '2026-09-16', items: [], subtotal: 1000,
    tax: 18, discount: 0, total: 1180, payment_status: PaymentStatus.UNPAID, ...over,
});
