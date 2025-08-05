

import { Customer, Vehicle, JobCard, Invoice, InventoryItem, Worker, AttendanceRecord, JobStatus, PaymentStatus, PayrollRecord } from '../types';

export const mockWorkers: Worker[] = [
    { id: 'W1', name: 'John Doe', role: 'Mechanic' },
    { id: 'W2', name: 'Jane Smith', role: 'Mechanic' },
    { id: 'W3', name: 'Emily White', role: 'Receptionist' },
];

export const mockCustomers: Customer[] = [
    {
        id: 'C1',
        name: 'Alice Johnson',
        phone: '555-0101',
        email: 'alice.j@example.com',
        address: '123 Maple St, Springfield',
        communication_log: [{ id: 'COM1', date: '2023-10-15T10:00:00Z', type: 'Call', notes: 'Inquired about oil change price.' }],
        service_history: [{id: 'SH1', date: '2023-09-01T14:00:00Z', description: 'Brake pad replacement', cost: 250}],
        created_at: '2023-10-15T09:00:00Z',
    },
    {
        id: 'C2',
        name: 'Bob Williams',
        phone: '555-0102',
        email: 'bob.w@example.com',
        address: '456 Oak Ave, Springfield',
        communication_log: [],
        service_history: [],
        created_at: '2023-10-20T11:00:00Z',
    }
];

export const mockVehicles: Vehicle[] = [
    { id: 'V1', make: 'Toyota', model: 'Camry', year: 2020, vin: '123ABCXYZ', license_plate: 'STATE-1', owner_id: 'C1' },
    { id: 'V2', make: 'Honda', model: 'CR-V', year: 2018, vin: '456DEFUVW', license_plate: 'STATE-2', owner_id: 'C2' },
    { id: 'V3', make: 'Ford', model: 'F-150', year: 2022, vin: '789GHIJKL', license_plate: 'STATE-3', owner_id: 'C2' },
];

export const mockJobCards: JobCard[] = [
    {
        id: 'J1',
        vehicle_id: 'V1',
        customer_id: 'C1',
        description: 'Standard oil change and tire rotation.',
        status: JobStatus.COMPLETED,
        assigned_to: 'W1',
        parts_used: [{ itemId: 'I1', quantity: 5 }, { itemId: 'I2', quantity: 1 }],
        labor_hours: 1.5,
        created_at: '2023-10-26T09:00:00Z',
        completed_date: '2023-10-26T11:00:00Z'
    },
    {
        id: 'J2',
        vehicle_id: 'V2',
        customer_id: 'C2',
        description: 'Diagnose engine warning light.',
        status: JobStatus.IN_PROGRESS,
        assigned_to: 'W2',
        parts_used: [],
        labor_hours: 0.5,
        created_at: '2023-10-27T10:30:00Z',
    },
    {
        id: 'J3',
        vehicle_id: 'V3',
        customer_id: 'C2',
        description: 'Replace front wiper blades.',
        status: JobStatus.COMPLETED,
        assigned_to: 'W1',
        parts_used: [{ itemId: 'I4', quantity: 2 }],
        labor_hours: 0.5,
        created_at: '2023-10-28T14:00:00Z',
        completed_date: '2023-10-28T14:30:00Z'
    }
];

export const mockInvoices: Invoice[] = [
    {
        id: 'INV1',
        job_card_id: 'J1',
        customer_id: 'C1',
        issue_date: '2023-10-26',
        due_date: '2023-11-10',
        items: [
            { description: 'Labor', quantity: 1.5, unit_price: 80, total: 120 },
            { description: 'Engine Oil', quantity: 5, unit_price: 8, total: 40 },
            { description: 'Oil Filter', quantity: 1, unit_price: 15, total: 15 },
        ],
        subtotal: 175,
        tax: 5,
        discount: 0,
        total: 183.75,
        payment_status: PaymentStatus.PAID,
        payment_method: 'Card'
    },
    {
        id: 'INV2',
        job_card_id: 'J2',
        customer_id: 'C2',
        issue_date: '2023-10-28',
        due_date: '2023-11-12',
        items: [
            { description: 'Diagnostic Fee', quantity: 1, unit_price: 50, total: 50 },
        ],
        subtotal: 50,
        tax: 5,
        discount: 0,
        total: 52.50,
        payment_status: PaymentStatus.UNPAID,
    }
];

export const mockInventory: InventoryItem[] = [
    { id: 'I1', name: 'Engine Oil 5W-30 (Qt)', sku: 'OIL-5W30', quantity: 50, low_stock_threshold: 20, price: 8, supplier: 'AutoParts Co.' },
    { id: 'I2', name: 'Oil Filter Type A', sku: 'FIL-A', quantity: 15, low_stock_threshold: 10, price: 15, supplier: 'AutoParts Co.' },
    { id: 'I3', name: 'Brake Pads Set', sku: 'BRK-123', quantity: 8, low_stock_threshold: 5, price: 60, supplier: 'BrakeMasters' },
    { id: 'I4', name: 'Wiper Blade 22"', sku: 'WPR-22', quantity: 30, low_stock_threshold: 15, price: 12, supplier: 'SeeClear Inc.' },
];

export const mockAttendance: AttendanceRecord[] = [
    { id: 'A1', worker_id: 'W1', date: '2023-10-26', clock_in: '2023-10-26T08:58:00Z', clock_out: '2023-10-26T17:05:00Z', daily_pay: 150 },
    { id: 'A2', worker_id: 'W2', date: '2023-10-26', clock_in: '2023-10-26T09:02:00Z', clock_out: '2023-10-26T17:00:00Z', daily_pay: 160 },
    { id: 'A3', worker_id: 'W1', date: new Date().toISOString().split('T')[0], clock_in: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }, // Clocked in today
    { id: 'A4', worker_id: 'W3', date: new Date().toISOString().split('T')[0], clock_in: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), clock_out: new Date(Date.now() - 30 * 60 * 1000).toISOString() }, // Clocked out today
];

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

export const mockPayrollRecords: PayrollRecord[] = [
    { id: 'P1', worker_id: 'W1', year: currentYear, month: currentMonth, amount: 4200, notes: 'Monthly Salary' },
    { id: 'P2', worker_id: 'W2', year: currentYear, month: currentMonth, amount: 4500, notes: 'Monthly Salary' },
    { id: 'P3', worker_id: 'W3', year: currentYear, month: currentMonth, amount: 3100, notes: 'Monthly Salary' },
    { id: 'P4', worker_id: 'W1', year: currentMonth === 0 ? currentYear - 1 : currentYear, month: currentMonth === 0 ? 11 : currentMonth - 1, amount: 4000, notes: 'Previous Month Salary' },
];