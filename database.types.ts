import {
    Customer,
    Vehicle,
    JobCard,
    Invoice,
    InventoryItem,
    Worker,
    AttendanceRecord,
    PayrollRecord
} from './types';

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Customer;
        Update: Partial<Customer>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Vehicle;
        Update: Partial<Vehicle>;
      };
      job_cards: {
        Row: JobCard;
        Insert: JobCard;
        Update: Partial<JobCard>;
      };
      invoices: {
        Row: Invoice;
        Insert: Invoice;
        Update: Partial<Invoice>;
      };
      inventory: {
        Row: InventoryItem;
        Insert: InventoryItem;
        Update: Partial<InventoryItem>;
      };
      workers: {
        Row: Worker;
        Insert: Worker;
        Update: Partial<Worker>;
      };
      attendance: {
        Row: AttendanceRecord;
        Insert: AttendanceRecord;
        Update: Partial<AttendanceRecord>;
      };
      payroll: {
        Row: PayrollRecord;
        Insert: PayrollRecord;
        Update: Partial<PayrollRecord>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
