import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import { Worker, AttendanceRecord } from '../types';
import { PencilSquareIcon } from '../components/Icons';

const DailyPayInput = ({ record, initialPay }: { record: AttendanceRecord, initialPay?: number }) => {
    const { dispatch } = useAppContext();
    const [pay, setPay] = useState(initialPay || '');

    useEffect(() => {
        setPay(initialPay || '');
    }, [initialPay]);

    const handleBlur = () => {
        const amount = parseFloat(pay.toString());
        const finalPay = !isNaN(amount) && amount >= 0 ? amount : undefined; // Use undefined for null in DB
        
        const updatedRecord: AttendanceRecord = {
            ...record,
            daily_pay: finalPay
        };

        dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
    };
    
    return (
        <input
            type="number"
            value={pay}
            onChange={e => setPay(e.target.value)}
            onBlur={handleBlur}
            placeholder="N/A"
            className="w-24 p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
        />
    );
};

const Workers = () => {
    const { state, dispatch } = useAppContext();
    const [isClockModalOpen, setIsClockModalOpen] = useState(false);
    const [clockModalType, setClockModalType] = useState<'clock-in' | 'clock-out' | null>(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    
    // State for worker management modal
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
    const [currentWorker, setCurrentWorker] = useState<Partial<Worker> | null>(null);
    const workerRoles: Worker['role'][] = ['Mechanic', 'Receptionist', 'Manager'];


    const today = new Date().toISOString().split('T')[0];

    const todaysAttendance = useMemo(() => {
        return state.attendance.filter(a => a.date === today).sort((a,b) => new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime());
    }, [state.attendance, today]);

    const { workersToClockIn, workersToClockOut } = useMemo(() => {
        const currentlyClockedInIds = new Set(
            state.attendance
                .filter(a => a.date === today && !a.clock_out)
                .map(a => a.worker_id)
        );

        return {
            workersToClockIn: state.workers.filter(w => !currentlyClockedInIds.has(w.id)),
            workersToClockOut: state.workers.filter(w => currentlyClockedInIds.has(w.id)),
        };
    }, [state.workers, state.attendance, today]);

    const openClockModal = (type: 'clock-in' | 'clock-out') => {
        setClockModalType(type);
        setSelectedWorkerId('');
        setIsClockModalOpen(true);
    };

    const handleClockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkerId || !clockModalType) return;
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        if (clockModalType === 'clock-in') {
            const newRecord: AttendanceRecord = {
                id: `A${Date.now()}`,
                worker_id: selectedWorkerId,
                date: todayStr,
                clock_in: now.toISOString(),
            };
            await dispatch({ type: 'ADD_ATTENDANCE', payload: newRecord });
        } else {
            const recordToUpdate = state.attendance.find(
                a => a.worker_id === selectedWorkerId && a.date === todayStr && !a.clock_out
            );
            if (recordToUpdate) {
                const updatedRecord: AttendanceRecord = {
                    ...recordToUpdate,
                    clock_out: now.toISOString(),
                };
                await dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
            } else {
                alert("This worker is not clocked in or has already clocked out.");
            }
        }
        setIsClockModalOpen(false);
    };

    const getClockModalTitle = () => {
        if (clockModalType === 'clock-in') return 'Clock In Worker';
        if (clockModalType === 'clock-out') return 'Clock Out Worker';
        return '';
    };

    const workersForClockModal = clockModalType === 'clock-in' ? workersToClockIn : workersToClockOut;

    // Worker Management Handlers
    const handleOpenWorkerModal = (worker: Worker | null) => {
        setCurrentWorker(worker ? { ...worker } : { name: '', role: 'Mechanic' });
        setIsWorkerModalOpen(true);
    };

    const handleCloseWorkerModal = () => {
        setIsWorkerModalOpen(false);
        setCurrentWorker(null);
    };

    const handleWorkerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (currentWorker) {
            setCurrentWorker({ ...currentWorker, [name]: value });
        }
    };
    
    const handleWorkerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorker || !currentWorker.name || !currentWorker.role) return;

        if (currentWorker.id) {
            await dispatch({ type: 'UPDATE_WORKER', payload: currentWorker as Worker });
        } else {
            const newWorker: Worker = {
                id: `W${Date.now()}`,
                name: currentWorker.name,
                role: currentWorker.role as Worker['role'],
            };
            await dispatch({ type: 'ADD_WORKER', payload: newWorker });
        }
        handleCloseWorkerModal();
    };

    return (
        <div className="space-y-8">
             {/* Worker Management Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Worker Management</h2>
                    <button
                        onClick={() => handleOpenWorkerModal(null)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        Add New Worker
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.workers.map(worker => (
                                <tr key={worker.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{worker.name}</td>
                                    <td className="px-6 py-4">{worker.role}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleOpenWorkerModal(worker)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Worker Attendance</h2>
                    <div className="space-x-2">
                        <button onClick={() => openClockModal('clock-in')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400" disabled={workersToClockIn.length === 0}>Clock In</button>
                        <button onClick={() => openClockModal('clock-out')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:bg-gray-400" disabled={workersToClockOut.length === 0}>Clock Out</button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                    <h3 className="text-lg font-semibold p-4 text-gray-800 dark:text-white border-b dark:border-gray-700">Today's Attendance ({new Date().toLocaleDateString()})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Worker</th>
                                    <th scope="col" className="px-6 py-3">Clock In</th>
                                    <th scope="col" className="px-6 py-3">Clock Out</th>
                                    <th scope="col" className="px-6 py-3">Hours</th>
                                    <th scope="col" className="px-6 py-3">Daily Pay ($)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaysAttendance.length > 0 ? todaysAttendance.map(record => {
                                    const worker = state.workers.find(w => w.id === record.worker_id);
                                    if (!worker) return null;
                                    
                                    const clockInTime = new Date(record.clock_in);
                                    const clockOutTime = record.clock_out ? new Date(record.clock_out) : null;
                                    const hours = clockOutTime ? ((clockOutTime.getTime() - clockInTime.getTime()) / 3600000) : 0;

                                    return (
                                        <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{worker.name}</td>
                                            <td className="px-6 py-4">{clockInTime.toLocaleTimeString()}</td>
                                            <td className="px-6 py-4">{clockOutTime ? clockOutTime.toLocaleTimeString() : <span className="text-green-500 font-semibold">Active</span>}</td>
                                            <td className="px-6 py-4">{hours > 0 ? hours.toFixed(2) : '-'}</td>
                                            <td className="px-6 py-4">
                                                {clockOutTime ? (
                                                    <DailyPayInput record={record} initialPay={record.daily_pay} />
                                                ) : (
                                                    <span className="text-gray-400 italic">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">No attendance records for today.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal title={getClockModalTitle()} isOpen={isClockModalOpen} onClose={() => setIsClockModalOpen(false)}>
                <form onSubmit={handleClockSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worker</label>
                        <select
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        >
                            <option value="">-- Select a Worker --</option>
                            {workersForClockModal.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                         {workersForClockModal.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No workers available for this action.</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setIsClockModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={!selectedWorkerId} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400">Confirm</button>
                    </div>
                </form>
            </Modal>
            
            <Modal title={currentWorker?.id ? 'Edit Worker' : 'Add New Worker'} isOpen={isWorkerModalOpen} onClose={handleCloseWorkerModal}>
                <form onSubmit={handleWorkerSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worker Name</label>
                        <input type="text" name="name" value={currentWorker?.name || ''} onChange={handleWorkerChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select name="role" value={currentWorker?.role || ''} onChange={handleWorkerChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                            {workerRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={handleCloseWorkerModal} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Save Worker</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Workers;