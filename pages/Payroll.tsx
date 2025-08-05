import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PayrollRecord } from '../types';
import Modal from '../components/Modal';
import { BanknotesIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '../components/Icons';

// Calendar Icon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
    </svg>
);

// Chart Icon
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

// Money Icon
const CurrencyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
        years.push(i);
    }
    return years;
};

const Payroll = () => {
    const { state, dispatch } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<PayrollRecord> | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const years = generateYears();

    const filteredPayrollData = useMemo(() => {
        return state.payrollRecords
            .filter(p => p.year === selectedYear && p.month === selectedMonth)
            .sort((a,b) => {
                const workerA = state.workers.find(w => w.id === a.worker_id)?.name || '';
                const workerB = state.workers.find(w => w.id === b.worker_id)?.name || '';
                return workerA.localeCompare(workerB);
            });
    }, [state.payrollRecords, state.workers, selectedYear, selectedMonth]);

    const payrollStats = useMemo(() => {
        const currentMonthRecords = filteredPayrollData;
        const totalPayroll = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
        const averagePayroll = currentMonthRecords.length > 0 ? totalPayroll / currentMonthRecords.length : 0;
        const highestPay = currentMonthRecords.length > 0 ? Math.max(...currentMonthRecords.map(r => r.amount)) : 0;
        const totalEmployees = currentMonthRecords.length;

        return { totalPayroll, averagePayroll, highestPay, totalEmployees };
    }, [filteredPayrollData]);

    const handleOpenModal = (record: Partial<PayrollRecord> | null) => {
        if (record) {
            setCurrentRecord(record);
        } else {
            setCurrentRecord({
                worker_id: '',
                amount: 0,
                notes: '',
                year: selectedYear,
                month: selectedMonth
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRecord(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (currentRecord) {
            setCurrentRecord({
                ...currentRecord,
                [name]: type === 'number' ? parseFloat(value) || 0 : value,
            });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentRecord || !currentRecord.worker_id || currentRecord.amount! <= 0) {
            alert("Please select a worker and enter a valid amount.");
            return;
        }

        if (currentRecord.id) {
            await dispatch({ type: 'UPDATE_PAYROLL_RECORD', payload: currentRecord as PayrollRecord });
        } else {
            const newRecord: PayrollRecord = {
                ...currentRecord,
                id: `P${Date.now()}`,
                year: selectedYear,
                month: selectedMonth,
            } as PayrollRecord;
            await dispatch({ type: 'ADD_PAYROLL_RECORD', payload: newRecord });
        }
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this payroll entry?')) {
            await dispatch({ type: 'DELETE_PAYROLL_RECORD', payload: { id } });
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Manager': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            case 'Mechanic': return 'text-primary-400 bg-primary-400/10 border-primary-400/30';
            case 'Receptionist': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            default: return 'text-white/60 bg-white/10 border-white/30';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gradient flex items-center">
                        <BanknotesIcon className="h-8 w-8 mr-3 text-primary-500" />
                        Payroll Management
                    </h1>
                    <p className="text-white/60 mt-2">Manage employee salaries and wages</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Month/Year Selectors */}
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-primary-500/50" />
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="form-input px-3 py-2 min-w-[120px]"
                        >
                            {months.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="form-input px-3 py-2"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => handleOpenModal(null)}
                        className="btn-luxury px-6 py-3 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Add Payroll Entry</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-luxury p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Total Payroll</p>
                            <p className="text-2xl font-bold text-primary-400">${payrollStats.totalPayroll.toLocaleString()}</p>
                        </div>
                        <CurrencyIcon className="h-8 w-8 text-primary-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Employees</p>
                            <p className="text-2xl font-bold text-blue-400">{payrollStats.totalEmployees}</p>
                        </div>
                        <div className="text-2xl">👥</div>
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Average Pay</p>
                            <p className="text-2xl font-bold text-green-400">${payrollStats.averagePayroll.toLocaleString()}</p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="card-luxury p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">Highest Pay</p>
                            <p className="text-2xl font-bold text-yellow-400">${payrollStats.highestPay.toLocaleString()}</p>
                        </div>
                        <div className="text-2xl">⭐</div>
                    </div>
                </div>
            </div>

            {/* Period Display */}
            <div className="card-luxury p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            Payroll for {months[selectedMonth]} {selectedYear}
                        </h3>
                        <p className="text-white/60 mt-1">
                            {payrollStats.totalEmployees} employee{payrollStats.totalEmployees !== 1 ? 's' : ''} • 
                            Total: ${payrollStats.totalPayroll.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full">
                        <BanknotesIcon className="w-5 h-5 text-primary-500" />
                        <span className="text-primary-500 font-medium">
                            {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear() ? 'Current Month' : 'Historical'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payroll Records */}
            {filteredPayrollData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPayrollData.map((payroll) => {
                        const worker = state.workers.find(w => w.id === payroll.worker_id);
                        
                        return (
                            <div key={payroll.id} className="card-luxury p-6 group">
                                {/* Worker Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center font-bold text-black text-lg">
                                            {worker?.name.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{worker?.name || 'Unknown Worker'}</h3>
                                            {worker?.role && (
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(worker.role)}`}>
                                                    {worker.role}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(payroll)}
                                            className="p-2 text-primary-500/60 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all duration-300"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(payroll.id)}
                                            className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Salary Amount */}
                                <div className="text-center mb-4 p-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-green-500/10 border border-primary-500/20">
                                    <p className="text-sm text-white/70 mb-1">Monthly Salary</p>
                                    <p className="text-3xl font-bold text-gradient">${payroll.amount.toLocaleString()}</p>
                                </div>

                                {/* Notes */}
                                {payroll.notes && (
                                    <div className="p-3 rounded-lg bg-dark-50/30 border border-primary-500/10">
                                        <p className="text-sm text-white/70 mb-1">Notes</p>
                                        <p className="text-sm text-white italic">"{payroll.notes}"</p>
                                    </div>
                                )}

                                {/* Performance Indicator */}
                                <div className="mt-4 pt-4 border-t border-primary-500/10">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60">Compared to average</span>
                                        <span className={`font-semibold ${
                                            payroll.amount > payrollStats.averagePayroll ? 'text-green-400' : 
                                            payroll.amount < payrollStats.averagePayroll ? 'text-red-400' : 'text-white'
                                        }`}>
                                            {payroll.amount > payrollStats.averagePayroll ? '+' : ''}
                                            {((payroll.amount - payrollStats.averagePayroll) / payrollStats.averagePayroll * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card-luxury p-12 text-center">
                    <div className="w-20 h-20 bg-dark-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BanknotesIcon className="w-10 h-10 text-primary-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Payroll Records</h3>
                    <p className="text-white/60 mb-6">
                        No payroll entries found for {months[selectedMonth]} {selectedYear}
                    </p>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="btn-luxury px-6 py-3 rounded-xl"
                    >
                        Add First Entry
                    </button>
                </div>
            )}
            
            {/* Add/Edit Payroll Modal */}
            <Modal title={currentRecord?.id ? "Edit Payroll Entry" : "Create Payroll Entry"} isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Worker *</label>
                            <select 
                                name="worker_id" 
                                value={currentRecord?.worker_id || ''} 
                                onChange={handleChange} 
                                className="form-input w-full px-4 py-3" 
                                required
                            >
                                <option value="">-- Select a worker --</option>
                                {state.workers.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Salary Amount ($) *</label>
                            <input 
                                type="number" 
                                name="amount" 
                                value={currentRecord?.amount || 0} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="form-input w-full px-4 py-3" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Period</label>
                            <div className="form-input w-full px-4 py-3 bg-dark-50/50 text-white/60">
                                {months[selectedMonth]} {selectedYear}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
                            <textarea 
                                name="notes" 
                                value={currentRecord?.notes || ''} 
                                onChange={handleChange} 
                                className="form-input w-full px-4 py-3 h-24 resize-none"
                                placeholder="Bonus, overtime, deductions, etc..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={handleCloseModal} 
                            className="btn-secondary px-6 py-3 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-luxury px-6 py-3 rounded-xl"
                        >
                            {currentRecord?.id ? 'Update Entry' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payroll;