import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Customer, Vehicle, JobCard, Invoice, InventoryItem, Worker, AttendanceRecord, PayrollRecord, JobStatus, PaymentStatus } from '../types';
import { supabase } from '../supabaseClient';

interface AppState {
    loading: boolean;
    isAuthenticated: boolean;
    isConfigured: boolean;
    customers: Customer[];
    vehicles: Vehicle[];
    jobCards: JobCard[];
    invoices: Invoice[];
    inventory: InventoryItem[];
    workers: Worker[];
    attendance: AttendanceRecord[];
    payrollRecords: PayrollRecord[];
}

const initialState: AppState = {
    loading: true,
    isAuthenticated: false, // In a real app, check a token or Supabase auth session
    isConfigured: !!supabase,
    customers: [],
    vehicles: [],
    jobCards: [],
    invoices: [],
    inventory: [],
    workers: [],
    attendance: [],
    payrollRecords: []
};

type Action =
    | { type: 'SET_INITIAL_DATA'; payload: Omit<AppState, 'isAuthenticated' | 'loading' | 'isConfigured'> }
    | { type: 'SET_LOADING'; payload: boolean }
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
    | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
    | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
    | { type: 'ADD_PAYROLL_RECORD'; payload: PayrollRecord }
    | { type: 'UPDATE_PAYROLL_RECORD'; payload: PayrollRecord }
    | { type: 'DELETE_PAYROLL_RECORD'; payload: { id: string } };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_INITIAL_DATA':
            return { ...state, ...action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'LOGIN':
            return { ...state, isAuthenticated: true };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false };
        case 'ADD_CUSTOMER':
            return { ...state, customers: [...state.customers, action.payload] };
        case 'ADD_VEHICLE':
            return { ...state, vehicles: [...state.vehicles, action.payload] };
        case 'ADD_JOB_CARD':
            return { ...state, jobCards: [...state.jobCards, action.payload] };
        case 'UPDATE_JOB_CARD':
            return { ...state, jobCards: state.jobCards.map(j => j.id === action.payload.id ? {...j, ...action.payload} : j) };
        case 'ADD_INVOICE':
            return { ...state, invoices: [...state.invoices, action.payload] };
        case 'UPDATE_INVOICE':
            return { ...state, invoices: state.invoices.map(inv => inv.id === action.payload.id ? action.payload : inv) };
        case 'DELETE_INVOICE':
            return { ...state, invoices: state.invoices.filter(inv => inv.id !== action.payload.id) };
        case 'UPDATE_CUSTOMER':
             return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'ADD_INVENTORY_ITEM':
            return { ...state, inventory: [...state.inventory, action.payload] };
        case 'UPDATE_INVENTORY_ITEM':
            return { ...state, inventory: state.inventory.map(item => item.id === action.payload.id ? action.payload : item) };
        case 'DELETE_INVENTORY_ITEM':
            return { ...state, inventory: state.inventory.filter(item => item.id !== action.payload.id) };
        case 'ADD_WORKER':
            return { ...state, workers: [...state.workers, action.payload] };
        case 'UPDATE_WORKER':
            return { ...state, workers: state.workers.map(w => w.id === action.payload.id ? action.payload : w) };
        case 'ADD_ATTENDANCE':
            return { ...state, attendance: [...state.attendance, action.payload] };
        case 'UPDATE_ATTENDANCE':
            return { ...state, attendance: state.attendance.map(a => a.id === action.payload.id ? action.payload : a) };
        case 'ADD_PAYROLL_RECORD':
            return { ...state, payrollRecords: [...state.payrollRecords, action.payload] };
        case 'UPDATE_PAYROLL_RECORD':
            return { ...state, payrollRecords: state.payrollRecords.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PAYROLL_RECORD':
            return { ...state, payrollRecords: state.payrollRecords.filter(p => p.id !== action.payload.id) };
        default:
            return state;
    }
};

const AppContext = createContext<{ state: AppState; dispatch: (action: Action) => Promise<void> } | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, baseDispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        if (!state.isConfigured) {
            baseDispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        const fetchInitialData = async () => {
            if (!supabase) return;
            try {
                const [
                    { data: customers, error: e1 }, { data: vehicles, error: e2 }, { data: jobCards, error: e3 }, { data: invoices, error: e4 },
                    { data: inventory, error: e5 }, { data: workers, error: e6 }, { data: attendance, error: e7 }, { data: payrollRecords, error: e8 }
                ] = await Promise.all([
                    supabase.from('customers').select('*'),
                    supabase.from('vehicles').select('*'),
                    supabase.from('job_cards').select('*'),
                    supabase.from('invoices').select('*'),
                    supabase.from('inventory').select('*'),
                    supabase.from('workers').select('*'),
                    supabase.from('attendance').select('*'),
                    supabase.from('payroll').select('*'),
                ]);
                const errors = [e1, e2, e3, e4, e5, e6, e7, e8].filter(Boolean);
                if (errors.length > 0) throw errors;

                baseDispatch({ type: 'SET_INITIAL_DATA', payload: {
                    customers: customers || [],
                    vehicles: vehicles || [],
                    jobCards: jobCards || [],
                    invoices: invoices || [],
                    inventory: inventory || [],
                    workers: workers || [],
                    attendance: attendance || [],
                    payrollRecords: payrollRecords || [],
                }});
            } catch (error: any) {
                console.error("Error fetching initial data:", error);
                if (error[0]?.message.includes('relation "public.customers" does not exist')) {
                    alert("Database tables not found. Please run the SQL schema in your Supabase project. See README.md for instructions.");
                }
                baseDispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        fetchInitialData();
    }, [state.isConfigured]);

    const dispatch = async (action: Action) => {
        if (!supabase) return;
        
        // Optimistic UI updates are handled by the reducer immediately.
        // If the DB call fails, we should ideally revert the change.
        // For simplicity, we log the error.
        
        switch (action.type) {
            case 'ADD_CUSTOMER': {
                const { data, error } = await supabase.from('customers').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'ADD_VEHICLE': {
                const { data, error } = await supabase.from('vehicles').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'ADD_JOB_CARD': {
                const { data, error } = await supabase.from('job_cards').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'UPDATE_JOB_CARD': {
                const { data, error } = await supabase.from('job_cards').update(action.payload).eq('id', action.payload.id).select();
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'ADD_INVOICE': {
                const { data, error } = await supabase.from('invoices').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'UPDATE_INVOICE': {
                const { data, error } = await supabase.from('invoices').update(action.payload).eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'DELETE_INVOICE': {
                const { error } = await supabase.from('invoices').delete().eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'UPDATE_CUSTOMER': {
                 const { data, error } = await supabase.from('customers').update(action.payload).eq('id', action.payload.id);
                 if (error) console.error(error); else baseDispatch(action);
                 break;
            }
             case 'ADD_INVENTORY_ITEM': {
                const { data, error } = await supabase.from('inventory').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'UPDATE_INVENTORY_ITEM': {
                const { data, error } = await supabase.from('inventory').update(action.payload).eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'DELETE_INVENTORY_ITEM': {
                const { error } = await supabase.from('inventory').delete().eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'ADD_WORKER': {
                const { data, error } = await supabase.from('workers').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'UPDATE_WORKER': {
                const { data, error } = await supabase.from('workers').update(action.payload).eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            case 'ADD_ATTENDANCE': {
                const { data, error } = await supabase.from('attendance').insert(action.payload).select();
                if (error) console.error(error); else baseDispatch({ ...action, payload: data[0] });
                break;
            }
            case 'UPDATE_ATTENDANCE': {
                 const { data, error } = await supabase.from('attendance').update(action.payload).eq('id', action.payload.id);
                 if (error) console.error(error); else baseDispatch(action);
                 break;
            }
            case 'ADD_PAYROLL_RECORD': {
                 const { data, error } = await supabase.from('payroll').insert(action.payload).select();
                 if (error) console.error(error); else baseDispatch({ ...action, payload: data[0]});
                 break;
            }
            case 'UPDATE_PAYROLL_RECORD': {
                 const { data, error } = await supabase.from('payroll').update(action.payload).eq('id', action.payload.id);
                 if (error) console.error(error); else baseDispatch(action);
                 break;
            }
            case 'DELETE_PAYROLL_RECORD': {
                const { error } = await supabase.from('payroll').delete().eq('id', action.payload.id);
                if (error) console.error(error); else baseDispatch(action);
                break;
            }
            default:
                baseDispatch(action as any); // Handle synchronous actions like LOGIN/LOGOUT
        }
    };

    return (
        <AppContext.Provider value={{ state, dispatch }}>
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