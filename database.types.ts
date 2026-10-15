import {
    Customer,
    Vehicle,
    JobCard,
    Invoice,
    InventoryItem,
    Worker,
    AttendanceRecord,
    PayrollRecord,
    CarWashBooking
} from './types';
import { AppSettingsRow } from './utils/settings';

// supabase-js requires table rows to be plain object types; mapping over the interfaces makes them assignable.
type Rowify<T> = { [K in keyof T]: T[K] };

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Rowify<Customer>;
        Insert: Rowify<Customer>;
        Update: Partial<Rowify<Customer>>;
        Relationships: [];
      };
      vehicles: {
        Row: Rowify<Vehicle>;
        Insert: Rowify<Vehicle>;
        Update: Partial<Rowify<Vehicle>>;
        Relationships: [];
      };
      job_cards: {
        Row: Rowify<JobCard>;
        Insert: Rowify<JobCard>;
        Update: Partial<Rowify<JobCard>>;
        Relationships: [];
      };
      invoices: {
        Row: Rowify<Invoice>;
        Insert: Rowify<Invoice>;
        Update: Partial<Rowify<Invoice>>;
        Relationships: [];
      };
      inventory: {
        Row: Rowify<InventoryItem>;
        Insert: Rowify<InventoryItem>;
        Update: Partial<Rowify<InventoryItem>>;
        Relationships: [];
      };
      workers: {
        Row: Rowify<Worker>;
        Insert: Rowify<Worker>;
        Update: Partial<Rowify<Worker>>;
        Relationships: [];
      };
      attendance: {
        Row: Rowify<AttendanceRecord>;
        Insert: Rowify<AttendanceRecord>;
        Update: Partial<Rowify<AttendanceRecord>>;
        Relationships: [];
      };
      payroll: {
        Row: Rowify<PayrollRecord>;
        Insert: Rowify<PayrollRecord>;
        Update: Partial<Rowify<PayrollRecord>>;
        Relationships: [];
      };
      carwash_bookings: {
        Row: Rowify<CarWashBooking>;
        Insert: Rowify<CarWashBooking>;
        Update: Partial<Rowify<CarWashBooking>>;
        Relationships: [];
      };
      app_settings: {
        Row: Rowify<AppSettingsRow>;
        Insert: Rowify<AppSettingsRow>;
        Update: Partial<Rowify<AppSettingsRow>>;
        Relationships: [];
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
