import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Customer, Vehicle, JobCard, Invoice, InventoryItem, Worker, AttendanceRecord, PayrollRecord, CarWashBooking, JobStatus, PaymentStatus } from '../types';
import { supabase } from '../supabaseClient';

interface AppState {
    loading: boolean;
    isAuthenticated: boolean;
    isConfigured: boolean;
    error: string | null;
    customers: Customer[];
    vehicles: Vehicle[];
    jobCards: JobCard[];
    invoices: Invoice[];
    inventory: InventoryItem[];
    workers: Worker[];
    attendance: AttendanceRecord[];
    payrollRecords: PayrollRecord[];
    carwashBookings: CarWashBooking[];
}

const initialState: AppState = {
    loading: true,
    isAuthenticated: false,
    isConfigured: !!supabase,
    error: null,
    customers: [],
    vehicles: [],
    jobCards: [],
    invoices: [],
    inventory: [],
    workers: [],
    attendance: [],
    payrollRecords: [],
    carwashBookings: []
};

type Action =
    | { type: 'SET_INITIAL_DATA'; payload: Omit<AppState, 'isAuthenticated' | 'loading' | 'isConfigured' | 'error'> }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'LOGIN' }
    | { type: 'LOGOUT' }
    | { type: 'ADD_CUSTOMER'; payload: Customer }
    | { type: 'ADD_VEHICLE'; payload: Vehicle }
    | { type: 'ADD_JOB_CARD'; payload: JobCard }
    | { type: 'UPDATE_JOB_CARD'; payload: Partial<JobCard> & { id: string } }
    | { type: 'ADD_INVOICE'; payload: Invoice }
    | { type: 'UPDATE_INVOICE'; payload: Invoice }
    | { type: 'DELETE_INVOICE'; payload: { id: string } }
    | { type: 'UPDATE_CUSTOMER'; payload: Customer }
    | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
    | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
    | { type: 'DELETE_INVENTORY_ITEM'; payload: { id: string } }
    | { type: 'ADD_WORKER'; payload: Worker }
    | { type: 'UPDATE_WORKER'; payload: Worker }
    | { type: 'DELETE_WORKER'; payload: { id: string } }
    | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
    | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
    | { type: 'ADD_PAYROLL_RECORD'; payload: PayrollRecord }
    | { type: 'UPDATE_PAYROLL_RECORD'; payload: PayrollRecord }
    | { type: 'DELETE_PAYROLL_RECORD'; payload: { id: string } }
    | { type: 'ADD_CARWASH_BOOKING'; payload: CarWashBooking }
    | { type: 'UPDATE_CARWASH_BOOKING'; payload: CarWashBooking }
    | { type: 'DELETE_CARWASH_BOOKING'; payload: { id: string } };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_INITIAL_DATA':
            return { ...state, ...action.payload, loading: false, error: null };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'LOGIN':
            return { ...state, isAuthenticated: true, error: null };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false, error: null };
        case 'ADD_CUSTOMER':
            return { ...state, customers: [...state.customers, action.payload], error: null };
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, action.payload], error: null };
        case 'ADD_JOB_CARD':
            return { ...state, jobCards: [...state.jobCards, action.payload], error: null };
        case 'UPDATE_JOB_CARD':
            return { 
                ...state, 
                jobCards: state.jobCards.map(j => j.id === action.payload.id ? {...j, ...action.payload} : j),
                error: null 
            };
        case 'ADD_INVOICE':
            return { ...state, invoices: [...state.invoices, action.payload], error: null };
        case 'UPDATE_INVOICE':
            return { 
                ...state, 
                invoices: state.invoices.map(inv => inv.id === action.payload.id ? action.payload : inv),
                error: null 
            };
        case 'DELETE_INVOICE':
            return { 
                ...state, 
                invoices: state.invoices.filter(inv => inv.id !== action.payload.id),
                error: null 
            };
        case 'UPDATE_CUSTOMER':
            return { 
                ...state, 
                customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c),
                error: null 
            };
        case 'ADD_INVENTORY_ITEM':
            return { ...state, inventory: [...state.inventory, action.payload], error: null };
        case 'UPDATE_INVENTORY_ITEM':
            return { 
                ...state, 
                inventory: state.inventory.map(item => item.id === action.payload.id ? action.payload : item),
                error: null 
            };
        case 'DELETE_INVENTORY_ITEM':
            return { 
                ...state, 
                inventory: state.inventory.filter(item => item.id !== action.payload.id),
                error: null 
            };
        case 'ADD_WORKER':
            return { ...state, workers: [...state.workers, action.payload], error: null };
        case 'UPDATE_WORKER':
            return { 
                ...state, 
                workers: state.workers.map(w => w.id === action.payload.id ? action.payload : w),
                error: null 
            };
        case 'DELETE_WORKER':
            return { 
                ...state, 
                workers: state.workers.filter(w => w.id !== action.payload.id),
                error: null 
            };
        case 'ADD_ATTENDANCE':
            return { ...state, attendance: [...state.attendance, action.payload], error: null };
        case 'UPDATE_ATTENDANCE':
            return { 
                ...state, 
                attendance: state.attendance.map(a => a.id === action.payload.id ? action.payload : a),
                error: null 
            };
        case 'ADD_PAYROLL_RECORD':
            return { ...state, payrollRecords: [...state.payrollRecords, action.payload], error: null };
        case 'UPDATE_PAYROLL_RECORD':
            return { 
                ...state, 
                payrollRecords: state.payrollRecords.map(p => p.id === action.payload.id ? action.payload : p),
                error: null 
            };
        case 'DELETE_PAYROLL_RECORD':
            return { 
                ...state, 
                payrollRecords: state.payrollRecords.filter(p => p.id !== action.payload.id),
                error: null 
            };
        case 'ADD_CARWASH_BOOKING':
            return { ...state, carwashBookings: [...state.carwashBookings, action.payload], error: null };
        case 'UPDATE_CARWASH_BOOKING':
            return { 
                ...state, 
                carwashBookings: state.carwashBookings.map(b => b.id === action.payload.id ? action.payload : b),
                error: null 
            };
        case 'DELETE_CARWASH_BOOKING':
            return { 
                ...state, 
                carwashBookings: state.carwashBookings.filter(b => b.id !== action.payload.id),
                error: null 
            };
        default:
            return state;
    }
};

// Enhanced error handling utility
const handleDatabaseError = (error: any, operation: string): string => {
    console.error(`Database error during ${operation}:`, error);
    
    // Specific error handling for common issues
    if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        return "Database tables not found. Please run the SQL schema in your Supabase project. See README.md for instructions.";
    } 
    
    if (error?.message?.includes('Invalid API key') || error?.message?.includes('401')) {
        return "Invalid Supabase credentials. Please check your config.ts file.";
    }
    
    if (error?.message?.includes('Network request failed') || error?.message?.includes('fetch')) {
        return "Network error. Please check your internet connection and try again.";
    }
    
    if (error?.message?.includes('duplicate key') || error?.message?.includes('already exists')) {
        return "This record already exists. Please check your data and try again.";
    }
    
    if (error?.message?.includes('foreign key') || error?.message?.includes('violates')) {
        return "Cannot perform this operation due to data dependencies. Please check related records.";
    }
    
    if (error?.message?.includes('permission') || error?.message?.includes('403')) {
        return "You don't have permission to perform this operation.";
    }
    
    // Generic error message for unknown errors
    return `An error occurred while ${operation.toLowerCase().replace('_', ' ')}. Please try again. If the problem persists, contact support.`;
};

// Retry utility for transient errors
const retryOperation = async function<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            // Don't retry on client errors (4xx) or specific database errors
            if (
                error?.message?.includes('4') || 
                error?.message?.includes('duplicate') ||
                error?.message?.includes('foreign key') ||
                error?.message?.includes('permission')
            ) {
                throw error;
            }
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw new Error('Max retries exceeded');
};

const AppContext = createContext<{ 
    state: AppState; 
    dispatch: (action: Action) => Promise<void>;
    clearError: () => void;
    formatCurrency: (amount: number) => string;
} | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, baseDispatch] = useReducer(appReducer, initialState);

    const formatCurrency = (amount: number): string => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    useEffect(() => {
        if (!state.isConfigured) {
            baseDispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        const fetchInitialData = async () => {
            if (!supabase) return;
            
            try {
                baseDispatch({ type: 'SET_LOADING', payload: true });
                baseDispatch({ type: 'SET_ERROR', payload: null });

                const [
                    { data: customers, error: e1 }, 
                    { data: vehicles, error: e2 }, 
                    { data: jobCards, error: e3 }, 
                    { data: invoices, error: e4 },
                    { data: inventory, error: e5 }, 
                    { data: workers, error: e6 }, 
                    { data: attendance, error: e7 }, 
                    { data: payrollRecords, error: e8 },
                    { data: carwashBookings, error: e9 }
                ] = await Promise.all([
                    supabase.from('customers').select('*'),
                    supabase.from('vehicles').select('*'),
                    supabase.from('job_cards').select('*'),
                    supabase.from('invoices').select('*'),
                    supabase.from('inventory').select('*'),
                    supabase.from('workers').select('*'),
                    supabase.from('attendance').select('*'),
                    supabase.from('payroll').select('*'),
                    supabase.from('carwash_bookings').select('*'),
                ]);

                const errors = [e1, e2, e3, e4, e5, e6, e7, e8, e9].filter(Boolean);
                if (errors.length > 0) {
                    throw errors[0]; // Throw the first error encountered
                }

                baseDispatch({ 
                    type: 'SET_INITIAL_DATA', 
                    payload: {
                        customers: customers || [],
                        vehicles: vehicles || [],
                        jobCards: jobCards || [],
                        invoices: invoices || [],
                        inventory: inventory || [],
                        workers: workers || [],
                        attendance: attendance || [],
                        payrollRecords: payrollRecords || [],
                        carwashBookings: carwashBookings || [],
                    }
                });

                // Auto-login for demo purposes
                baseDispatch({ type: 'LOGIN' });

            } catch (error: any) {
                const errorMessage = handleDatabaseError(error, 'loading initial data');
                baseDispatch({ type: 'SET_ERROR', payload: errorMessage });
            }
        };

        fetchInitialData();
    }, [state.isConfigured]);

    const dispatch = async (action: Action) => {
        if (!supabase) {
            baseDispatch({ 
                type: 'SET_ERROR', 
                payload: "Database connection not available. Please check your configuration." 
            });
            return;
        }
        
        try {
            // Clear any existing errors
            baseDispatch({ type: 'SET_ERROR', payload: null });

            switch (action.type) {
                case 'ADD_CUSTOMER': {
                    const result = await retryOperation(async () =>
                        supabase.from('customers').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'ADD_VEHICLE': {
                    const result = await retryOperation(async () =>
                        supabase.from('vehicles').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_JOB_CARD': {
                    const result = await retryOperation(async () =>
                        supabase.from('job_cards').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_JOB_CARD': {
                    const result = await retryOperation(async () =>
                        supabase.from('job_cards').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_INVOICE': {
                    const result = await retryOperation(async () =>
                        supabase.from('invoices').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_INVOICE': {
                    const result = await retryOperation(async () =>
                        supabase.from('invoices').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'DELETE_INVOICE': {
                    const result = await retryOperation(async () =>
                        supabase.from('invoices').delete().eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'UPDATE_CUSTOMER': {
                    const result = await retryOperation(async () =>
                        supabase.from('customers').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_INVENTORY_ITEM': {
                    const result = await retryOperation(async () =>
                        supabase.from('inventory').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_INVENTORY_ITEM': {
                    const result = await retryOperation(async () =>
                        supabase.from('inventory').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'DELETE_INVENTORY_ITEM': {
                    const result = await retryOperation(async () =>
                        supabase.from('inventory').delete().eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_WORKER': {
                    const result = await retryOperation(async () =>
                        supabase.from('workers').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_WORKER': {
                    const result = await retryOperation(async () =>
                        supabase.from('workers').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'DELETE_WORKER': {
                    const result = await retryOperation(async () =>
                        supabase.from('workers').delete().eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_ATTENDANCE': {
                    const result = await retryOperation(async () =>
                        supabase.from('attendance').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_ATTENDANCE': {
                    const result = await retryOperation(async () =>
                        supabase.from('attendance').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_PAYROLL_RECORD': {
                    const result = await retryOperation(async () =>
                        supabase.from('payroll').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_PAYROLL_RECORD': {
                    const result = await retryOperation(async () =>
                        supabase.from('payroll').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'DELETE_PAYROLL_RECORD': {
                    const result = await retryOperation(async () =>
                        supabase.from('payroll').delete().eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'ADD_CARWASH_BOOKING': {
                    const result = await retryOperation(async () =>
                        supabase.from('carwash_bookings').insert(action.payload).select()
                    );
                    if (result.error) throw result.error;
                    baseDispatch({ ...action, payload: result.data[0] });
                    break;
                }
                case 'UPDATE_CARWASH_BOOKING': {
                    const result = await retryOperation(async () =>
                        supabase.from('carwash_bookings').update(action.payload).eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                case 'DELETE_CARWASH_BOOKING': {
                    const result = await retryOperation(async () =>
                        supabase.from('carwash_bookings').delete().eq('id', action.payload.id)
                    );
                    if (result.error) throw result.error;
                    baseDispatch(action);
                    break;
                }
                default:
                    baseDispatch(action as any); // Handle synchronous actions like LOGIN/LOGOUT
            }
        } catch (error: any) {
            const errorMessage = handleDatabaseError(error, action.type);
            baseDispatch({ type: 'SET_ERROR', payload: errorMessage });
        }
    };

    const clearError = () => {
        baseDispatch({ type: 'SET_ERROR', payload: null });
    };

    return (
        <AppContext.Provider value={{ state, dispatch, clearError, formatCurrency }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};