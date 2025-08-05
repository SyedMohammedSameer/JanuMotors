export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  owner_id: string;
}

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'Call' | 'Visit' | 'Email';
  notes: string;
}

export interface ServiceHistory {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  communication_log: CommunicationLog[];
  service_history: ServiceHistory[];
  created_at: string;
}

export enum JobStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface JobCard {
  id: string;
  vehicle_id: string;
  customer_id: string;
  description: string;
  status: JobStatus;
  assigned_to: string;
  parts_used: { itemId: string; quantity: number }[];
  labor_hours: number;
  created_at: string;
  completed_date?: string;
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  job_card_id: string;
  customer_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  payment_status: PaymentStatus;
  payment_method?: 'Cash' | 'Card' | 'Transfer';
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
  price: number;
  supplier: string;
}

export interface Worker {
  id: string;
  name: string;
  role: 'Mechanic' | 'Receptionist' | 'Manager';
}

export interface AttendanceRecord {
  id: string;
  worker_id: string;
  clock_in: string;
  clock_out?: string;
  date: string;
  daily_pay?: number;
}

export interface PayrollRecord {
  id: string;
  worker_id: string;
  month: number;
  year: number;
  amount: number;
  notes?: string;
}