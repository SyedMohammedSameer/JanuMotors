import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PayrollRecord } from '../types';
import Modal from '../components/Modal';
import { BanknotesIcon, PencilSquareIcon, TrashIcon } from '../components/Icons';

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
            // Update
            await dispatch({ type: 'UPDATE_PAYROLL_RECORD', payload: currentRecord as PayrollRecord });
        } else {
            // Create
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <BanknotesIcon className="h-7 w-7 mr-3 text-primary-500"/>
                    Payroll Management
                </h2>
                <div className="flex items-center gap-4">
                    <select 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                     <button 
                        onClick={() => handleOpenModal(null)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        Create Payroll Entry
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                <h3 className="text-lg font-semibold p-4 text-gray-800 dark:text-white border-b dark:border-gray-700">
                    Showing Payroll for: {months[selectedMonth]} {selectedYear}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Worker</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Notes</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayrollData.length > 0 ? filteredPayrollData.map((payroll) => {
                                const worker = state.workers.find(w => w.id === payroll.worker_id);
                                return (
                                <tr key={payroll.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{worker?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{worker?.role || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 italic">{payroll.notes || '-'}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">${payroll.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 flex items-center justify-center space-x-4">
                                        <button onClick={() => handleOpenModal(payroll)} className="text-primary-600 dark:text-primary-500 hover:text-primary-800">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(payroll.id)} className="text-red-600 dark:text-red-500 hover:text-red-800">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        No payroll entries for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal title={currentRecord?.id ? "Edit Payroll Entry" : "Create Payroll Entry"} isOpen={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worker</label>
                        <select name="worker_id" value={currentRecord?.worker_id || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                             <option value="">-- Select a worker --</option>
                             {state.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
                        <input type="number" name="amount" value={currentRecord?.amount || 0} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea name="notes" value={currentRecord?.notes || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Save Entry</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payroll;